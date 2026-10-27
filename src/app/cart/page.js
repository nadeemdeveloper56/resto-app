
"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CustomerHeader from "../_components/CustomerHeader";
import RestaurantFooter from "../_components/RestaurantFooter";
import { useRouter } from "next/navigation";

const getCartKey = (user) => {
    const userId = user?._id || user?.id || user?.email;
    return userId ? `cart_${userId}` : null;
};

const readCart = (user) => {
    const key = getCartKey(user);
    const storage = key ? localStorage : sessionStorage;
    const storageKey = key || "cart_guest";

    try {
        const saved = JSON.parse(storage.getItem(storageKey) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
};

const saveCart = (user, items) => {
    const key = getCartKey(user);
    const storage = key ? localStorage : sessionStorage;
    const storageKey = key || "cart_guest";

    storage.setItem(storageKey, JSON.stringify(items));
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cartChange"));
};

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const router = useRouter();

    useEffect(() => {
        try {
            const savedUser = JSON.parse(
                sessionStorage.getItem("activeUser") || "null"
            );

            const items = readCart(savedUser);
            setCartItems(items);
            localStorage.setItem("cart", JSON.stringify(items));
        } catch (error) {
            console.error("Cart loading error:", error);
            setCartItems([]);
        }
    }, []);

    const updateCart = (items) => {
        setCartItems(items);

        const savedUser = JSON.parse(
            sessionStorage.getItem("activeUser") || "null"
        );

        saveCart(savedUser, items);
    };

    const increaseQuantity = (id) => {
        const updatedItems = cartItems.map((item) =>
            String(item._id) === String(id)
                ? {
                      ...item,
                      quantity: Number(item.quantity || 1) + 1,
                  }
                : item
        );

        updateCart(updatedItems);
    };

    const decreaseQuantity = (id) => {
        const updatedItems = cartItems
            .map((item) =>
                String(item._id) === String(id)
                    ? {
                          ...item,
                          quantity: Number(item.quantity || 1) - 1,
                      }
                    : item
            )
            .filter((item) => Number(item.quantity) > 0);

        updateCart(updatedItems);
    };

    const removeItem = (id) => {
        const updatedItems = cartItems.filter(
            (item) => String(item._id) !== String(id)
        );

        updateCart(updatedItems);
    };

    const orderNow = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const savedUser = JSON.parse(
            sessionStorage.getItem("activeUser") || "null"
        );

        if (!savedUser) {
            router.push("/user-login?redirect=%2Forderdisplay");
            return;
        }

        router.push("/orderdisplay");
    };

    const totalPrice = cartItems.reduce(
        (total, item) =>
            total +
            Number(item.price || 0) * Number(item.quantity || 1),
        0
    );

    return (
        <div className="cart-page">
            <CustomerHeader />

            <h1>My Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div>
                    <h2>Your cart is empty!</h2>
                    <p>Please add some food items to your cart.</p>

                    <Link href="/">
                        <button type="button">Continue Shopping</button>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div className="cart-item" key={item._id}>
                                <Image
                                    src={item.img_path}
                                    alt={item.name || "Food item"}
                                    width={120}
                                    height={120}
                                    unoptimized
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                    }}
                                />

                                <div className="cart-item-details">
                                    <h2>{item.name}</h2>
                                    <p>{item.description}</p>

                                    <p>
                                        Price: Rs. {Number(item.price || 0)}
                                    </p>

                                    <div className="quantity-controls">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                decreaseQuantity(item._id)
                                            }
                                        >
                                            -
                                        </button>

                                        <span>{item.quantity || 1}</span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                increaseQuantity(item._id)
                                            }
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p>
                                        Subtotal: Rs.{" "}
                                        {Number(item.price || 0) *
                                            Number(item.quantity || 1)}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item._id)}
                                    >
                                        Remove Item
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-total">
                        <h2>Total: Rs. {totalPrice}</h2>

                        <Link href="/">
                            <button type="button">Continue Shopping</button>
                        </Link>

                        <button type="button" onClick={orderNow}>
                            Order Now
                        </button>
                    </div>
                </>
            )}

            <RestaurantFooter />
        </div>
    );
};

export default Cart;
