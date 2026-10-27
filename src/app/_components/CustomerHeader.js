
"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";


const getActiveUser = () => {
    try {
        return JSON.parse(
            localStorage.getItem("user") ||
            sessionStorage.getItem("activeUser") ||
            "null"
        );
    } catch {
        return null;
    }
};

const getCartKey = (user) => {
    const userId = user?._id || user?.id || user?.email;
    return userId ? `cart_${userId}` : null;
};

const getTotalQuantity = (items) =>
    items.reduce(
        (total, item) => total + Number(item.quantity || 1),
        0
    );

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

const CustomerHeader = ({ cartData, removeCartData }) => {
    const [user, setUser] = useState(null);
    const [cartNumber, setCartNumber] = useState(0);

    const refreshHeader = () => {
        try {
            const activeUser = getActiveUser();

            setUser(activeUser);
            setCartNumber(getTotalQuantity(readCart(activeUser)));
        } catch (error) {
            console.error("Header loading error:", error);
            setUser(null);
            setCartNumber(0);
        }
    };

    useEffect(() => {
        refreshHeader();

        window.addEventListener("userChange", refreshHeader);
        window.addEventListener("cartChange", refreshHeader);

        return () => {
            window.removeEventListener("userChange", refreshHeader);
            window.removeEventListener("cartChange", refreshHeader);
        };
    }, []);

    useEffect(() => {
        if (!cartData?._id) return;

        try {
            const activeUser = getActiveUser();
            let items = readCart(activeUser);

            if (
                items.length > 0 &&
                String(items[0].resto_id) !== String(cartData.resto_id)
            ) {
                items = [];
            }

            const existingIndex = items.findIndex(
                (item) => String(item._id) === String(cartData._id)
            );

            if (existingIndex >= 0) {
                items[existingIndex] = {
                    ...items[existingIndex],
                    quantity:
                        Number(items[existingIndex].quantity || 1) + 1,
                };
            } else {
                items.push({ ...cartData, quantity: 1 });
            }

            saveCart(activeUser, items);
            setCartNumber(getTotalQuantity(items));
        } catch (error) {
            console.error("Add to cart error:", error);
        }
    }, [cartData]);

    useEffect(() => {
        if (!removeCartData) return;

        try {
            const activeUser = getActiveUser();

            const removeId =
                typeof removeCartData === "object"
                    ? removeCartData.id || removeCartData._id
                    : removeCartData;

            const items = readCart(activeUser).filter(
                (item) => String(item._id) !== String(removeId)
            );

            saveCart(activeUser, items);
            setCartNumber(getTotalQuantity(items));
        } catch (error) {
            console.error("Remove cart item error:", error);
        }
    }, [removeCartData]);

    const handleLogout = () => {
        sessionStorage.removeItem("activeUser");
        localStorage.removeItem("user");
        localStorage.removeItem("userLoginExpiry");

        setUser(null);
        setCartNumber(0);

        window.dispatchEvent(new Event("userChange"));
        window.location.href = "/";
    };

    return (
        <div className="header-wrapper">
            <div className="Logo">
                <Image
                    src="https://graphicsfamily.com/wp-content/uploads/edd/2023/02/Restaurant-Logo-Design-2-1180x664.jpg"
                    alt="Restaurant Logo"
                    width={90}
                    height={90}
                    loading="eager"
                    unoptimized
                />
            </div>

            <ul>
                <li>
                    <Link href="/">Home</Link>
                </li>

                {user ? (
                    <>
                        <li>
                            <Link href="/my-profile">My Profile</Link>
                        </li>

                        <li>
                            <button type="button" onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link href="/user-login">Sign In</Link>
                        </li>

                        <li>
                            <Link href="/user-auth">Sign Up</Link>
                        </li>
                    </>
                )}

                <li>
                    <Link href="/cart">Cart ({cartNumber})</Link>
                </li>

                <li>
                    <Link href="/restaurant">Add Restaurant</Link>
                </li>
            </ul>
        </div>
    );
};

export default CustomerHeader;
