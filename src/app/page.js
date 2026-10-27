
"use client";

import Image from "next/image";
import CustomerHeader from "./_components/CustomerHeader";
import RestaurantFooter from "./_components/RestaurantFooter";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showLocationList, setShowLocationList] = useState(false);
  const [searchRestaurant, setSearchRestaurant] = useState("");

  const router = useRouter();

  const loadLocations = async () => {
    try {
      const res = await fetch("/Api/restaurant/customers/locations");
      const text = await res.text();

      if (!res.ok) {
        throw new Error(
          `Locations API error: ${res.status} - ${text}`
        );
      }

      if (!text.trim()) {
        throw new Error("Locations API returned an empty response");
      }

      const data = JSON.parse(text);

      if (data.success) {
        setLocations(Array.isArray(data.result) ? data.result : []);
      } else {
        console.error("Locations API failed:", data);
      }
    } catch (error) {
      console.error("Load Locations Error:", error);
    }
  };

  const loadRestaurants = async (params = {}) => {
    try {
      let url = "/Api/restaurant/customers";
      const query = [];

      if (params.location) {
        query.push(
          "location=" + encodeURIComponent(params.location)
        );
      }

      if (params.restaurant) {
        query.push(
          "restaurant=" + encodeURIComponent(params.restaurant)
        );
      }

      if (query.length > 0) {
        url += "?" + query.join("&");
      }

      const res = await fetch(url);
      const text = await res.text();

      if (!res.ok) {
        throw new Error(
          `Restaurants API error: ${res.status} - ${text}`
        );
      }

      if (!text.trim()) {
        throw new Error("Restaurants API returned an empty response");
      }

      const data = JSON.parse(text);

      if (data.success) {
        setRestaurants(
          Array.isArray(data.result) ? data.result : []
        );
      } else {
        console.error("Restaurants API failed:", data);
      }
    } catch (error) {
      console.error("Load Restaurants Error:", error);
    }
  };

  useEffect(() => {
    loadLocations();
    loadRestaurants();
  }, []);

  const handleListItem = (item) => {
    setSelectedLocation(item);
    setShowLocationList(false);

    loadRestaurants({
      location: item,
      restaurant: searchRestaurant,
    });
  };

  return (
    <main>
      <CustomerHeader />

      <div className="main-page-banner">
        <h1 className="text-3xl font-bold">Restaurant App</h1>

        <div className="input-wrapper">
          <input
            type="text"
            value={selectedLocation}
            onClick={() => setShowLocationList(true)}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedLocation(value);
              setShowLocationList(true);
            }}
            className="select-input"
            placeholder="Select Place"
          />

          <ul className="location-list">
            {showLocationList &&
              locations
                .filter((item) =>
                  item
                    .toLowerCase()
                    .includes(selectedLocation.toLowerCase())
                )
                .map((item) => (
                  <li
                    key={item}
                    onClick={() => handleListItem(item)}
                  >
                    {item}
                  </li>
                ))}
          </ul>

          <input
            type="text"
            value={searchRestaurant}
            onChange={(e) => {
              const value = e.target.value;
              setSearchRestaurant(value);

              loadRestaurants({
                location: selectedLocation,
                restaurant: value,
              });
            }}
            className="search-input"
            placeholder="Enter Restaurant Name"
          />
        </div>
      </div>

      <div className="restaurant-list-container">
        {restaurants.map((item) => (
          <div
            onClick={() =>
              router.push(
                "explore/" +
                  encodeURIComponent(item.restaurantName) +
                  "?id=" +
                  item._id
              )
            }
            className="restaurant-wrapper"
            key={item._id}
          >
            <div className="heading-wrapper">
              <h3>{item.restaurantName}</h3>
              <h5>contact: {item.contactNumber}</h5>
            </div>

            <div className="address-wrapper">
              <div>{item.city}, </div>
              <div className="address">
                {item.address}, Email: {item.email}
              </div>
            </div>
          </div>
        ))}
      </div>

      <RestaurantFooter />
    </main>
  );
}
