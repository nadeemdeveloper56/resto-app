
"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import CustomerHeader from "@/app/_components/CustomerHeader";
import RestaurantFooter from "@/app/_components/RestaurantFooter";
import Image from "next/image";
import { useEffect, useState, use } from "react";
import defaultFoodItems from "@/app/lib/defaultFoodItems";

const Page = (props) => {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const restaurantName = params.name;

  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [foodItems, setfoodItems] = useState([]);
  const [cartData, setcartData] = useState();
  const [cartStorage, setCartStorage] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  const [removeCartData, setRemoveCartData] = useState();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    setCartStorage(cart);

    setCartIds(
      cart.map((item) => {
        return item._id;
      })
    );

    const LoadRestaurantDetails = async () => {
      const id = searchParams.id;

      if (!id) {
        console.log("Restaurant ID nahi mili");
        return;
      }

      try {
        let response = await fetch(
          "/Api/restaurant/customers/" + id
        );

        let data = await response.json();

        if (data.success) {
          setRestaurantDetails(data.details);
        }

        let foodResponse = await fetch(
          "/Api/restaurant/foods/" + id
        );

        let foodData = await foodResponse.json();

        if (foodData.success && Array.isArray(foodData.result)) {
          const defaultFoodNames = new Set(
            defaultFoodItems.map((food) =>
              food.name.trim().toLowerCase()
            )
          );

          const filteredFoods = foodData.result.filter((food) =>
            defaultFoodNames.has(
              (food.name || "").trim().toLowerCase()
            )
          );

          setfoodItems(filteredFoods);

          console.log("Filtered Food Items:", filteredFoods.map(
            (food) => food.name
          ));
        } else {
          setfoodItems([]);
        }
      } catch (error) {
        console.log("Restaurant Details Error:", error);
      }
    };

    LoadRestaurantDetails();
  }, [searchParams]);

  const addtoCart = (item) => {
    let localCartIds = [...cartIds];

    if (!localCartIds.includes(item._id)) {
      localCartIds.push(item._id);
    }

    setCartIds(localCartIds);

    setcartData({
      ...item,
      cartId: crypto.randomUUID()
    });
  };

  const removeFromCart = (id) => {
    let localCartIds = cartIds.filter(
      (itemId) => itemId !== id
    );

    setCartIds(localCartIds);

    let localCartItem = JSON.parse(
      localStorage.getItem("cart") || "[]"
    ).filter((item) => item._id !== id);

    setCartStorage(localCartItem);

    localStorage.setItem(
      "cart",
      JSON.stringify(localCartItem)
    );

    setRemoveCartData({
      id: id,
      time: Date.now()
    });
  };

  return (
    <div>
      <CustomerHeader
        cartData={cartData}
        removeCartData={removeCartData}
      />

      <div className="restaurant-page-banner">
        <h1>{decodeURIComponent(restaurantName)}</h1>
      </div>

      <div className="detail-wrapper">
        <h3>Contact : {restaurantDetails?.contactNumber}</h3>
        <h3>City : {restaurantDetails?.city}</h3>
        <h3>Address : {restaurantDetails?.address}</h3>
        <h3>Email : {restaurantDetails?.email}</h3>
      </div>

      <div className="food-item-wrapper">
        {foodItems.length > 0 ? (
          foodItems.map((item) => (
            <div className="list-item" key={item._id}>
              <Image
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover"
                }}
                src={item.img_path}
                alt={item.name}
                width={100}
                height={100}
                unoptimized
              />

              <div>
                <div>{item.name}</div>
                <div>{item.price}</div>

                <div className="description">
                  {item.description}
                </div>

                {cartIds.includes(item._id) ? (
                  <button
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove to Cart
                  </button>
                ) : (
                  <button onClick={() => addtoCart(item)}>
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <h1>No Food Item for Now</h1>
        )}
      </div>

      <RestaurantFooter />
    </div>
  );
};

export default Page;
