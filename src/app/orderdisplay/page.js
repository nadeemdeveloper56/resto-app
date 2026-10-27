
"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerHeader from "../_components/CustomerHeader";
import RestaurantFooter from "../_components/RestaurantFooter";


export default function OrderDisplay() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderMessage, setOrderMessage] = useState("");
    const [showOrderPopup, setShowOrderPopup] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState("");

    useEffect(() => {
        try {
            const savedUser = JSON.parse(
                localStorage.getItem("user") ||
                sessionStorage.getItem("activeUser") ||
                "null"
            );
        

    if (!savedUser) {
        router.replace("/user-login?redirect=%2Forderdisplay");
        return;
    }

    const userId =
        savedUser._id || savedUser.id || savedUser.email;

    const cartKey = `cart_${userId}`;

    const personalCart = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
    );

    const items = Array.isArray(personalCart)
        ? personalCart
        : [];

    setUser(savedUser);
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
} catch (error) {
    console.error("Order details loading error:", error);
    setOrderMessage("Unable to load your order details.");
} finally {
    setLoading(false);
}
    }, [router]);

const totalAmount = cartItems.reduce((total, item) => {
    return (
        total +
        Number(item.price || 0) *
        Number(item.quantity || 1)
    );
}, 0);

const closePopupAndRedirect = () => {
    setShowOrderPopup(false);
    router.push("/my-profile");
};

const placeOrder = async () => {
    if (placingOrder) return;

    if (!user || cartItems.length === 0) {
        setOrderMessage(
            "Please login and add food items first."
        );
        return;
    }

    const userId = user._id || user.id;

    if (!userId) {
        setOrderMessage(
            "Your user ID is missing. Please login again."
        );
        return;
    }

    setPlacingOrder(true);
    setOrderMessage("");

    try {
        const response = await fetch("/Api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                customer: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    city: user.city,
                },
                items: cartItems,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Failed to place your order."
            );
        }

        const orderId =
            data.result?._id ||
            data.order?._id ||
            data.result?.orderId ||
            data.orderId;

        if (!orderId) {
            throw new Error(
                "Order was submitted, but its confirmation ID was not returned."
            );
        }

        const cartKey = `cart_${user._id || user.id || user.email
            }`;

        localStorage.setItem(cartKey, JSON.stringify([]));
        localStorage.setItem("cart", JSON.stringify([]));

        setCartItems([]);
        setPlacedOrderId(String(orderId));
        setShowOrderPopup(true);
    } catch (error) {
        console.error("Place order error:", error);
        setOrderMessage(
            error.message || "Unable to place your order."
        );
    } finally {
        setPlacingOrder(false);
    }
};

if (loading) {
    return (
        <>
            <CustomerHeader />
            <main className="order-display-page">
                <div className="order-display-container">
                    <h1>Loading Order Details...</h1>
                </div>
            </main>
            <RestaurantFooter />
        </>
    );
}

if (!user) return null;

return (
    <>
        <CustomerHeader />

        {showOrderPopup && (
            <div className="success-popup-overlay">
                <div
                    className="success-popup"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="success-popup-title"
                >
                    <button
                        type="button"
                        className="success-popup-close"
                        onClick={closePopupAndRedirect}
                        aria-label="Close popup"
                    >
                        &times;
                    </button>

                    <div className="success-check">
                        <svg viewBox="0 0 52 52" aria-hidden="true">
                            <circle cx="26" cy="26" r="24" />
                            <path d="M14 27 L22 35 L39 17" />
                        </svg>
                    </div>

                    <h2 id="success-popup-title">
                        Order Placed!
                    </h2>

                    <p className="success-popup-text">
                        Thank you for your order! Your food order
                        has been placed successfully.
                    </p>

                    <div className="success-order-id">
                        <span>Your Order ID</span>
                        <strong>{placedOrderId}</strong>
                    </div>

                    <div className="success-popup-note">
                        <span>🎉</span>
                        <p>Your delicious food journey starts here!</p>
                    </div>

                    <button
                        type="button"
                        className="success-popup-button"
                        onClick={closePopupAndRedirect}
                    >
                        View My Orders →
                    </button>
                </div>
            </div>
        )}

        <main className="order-display-page">
            <div className="order-display-container">
                <h1>Order Summary</h1>

                <p className="order-subtitle">
                    Review your details and selected food items.
                </p>

                <section className="order-info-card">
                    <h2>Customer Details</h2>

                    <div className="customer-details">
                        <p>
                            <strong>Name:</strong>{" "}
                            {user.name || "Not available"}
                        </p>
                        <p>
                            <strong>Email:</strong>{" "}
                            {user.email || "Not available"}
                        </p>
                        <p>
                            <strong>Phone:</strong>{" "}
                            {user.phone || "Not available"}
                        </p>
                        <p>
                            <strong>City:</strong>{" "}
                            {user.city || "Not available"}
                        </p>
                    </div>
                </section>

                <section className="order-info-card">
                    <h2>Order Details</h2>

                    {cartItems.length > 0 ? (
                        <>
                            <div className="order-items">
                                {cartItems.map((item, index) => (
                                    <div
                                        className="order-item"
                                        key={item._id || index}
                                    >
                                        <div className="order-item-info">
                                            <h3>{item.name}</h3>
                                            <p>
                                                Quantity:{" "}
                                                {Number(item.quantity || 1)}
                                            </p>
                                            <p>
                                                Price per item: Rs.{" "}
                                                {Number(
                                                    item.price || 0
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        <p className="order-item-price">
                                            Rs.{" "}
                                            {(
                                                Number(item.price || 0) *
                                                Number(item.quantity || 1)
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="order-total">
                                <span>Total Amount</span>
                                <strong>
                                    Rs. {totalAmount.toLocaleString()}
                                </strong>
                            </div>
                        </>
                    ) : (
                        <div>
                            <p>Your cart is empty.</p>
                            <Link
                                href="/"
                                className="order-action-button"
                            >
                                Browse Food
                            </Link>
                        </div>
                    )}
                </section>

                {orderMessage && (
                    <p className="order-error-message" role="alert">
                        {orderMessage}
                    </p>
                )}

                <div className="order-bottom-actions">
                    <Link
                        href="/cart"
                        className="order-secondary-link"
                    >
                        Back to Cart
                    </Link>

                    <Link
                        href="/"
                        className="order-action-button"
                    >
                        Continue Shopping
                    </Link>

                    {cartItems.length > 0 && (
                        <button
                            type="button"
                            className="order-action-button"
                            onClick={placeOrder}
                            disabled={placingOrder}
                        >
                            {placingOrder
                                ? "Placing Order..."
                                : "Place Your Order"}
                        </button>
                    )}
                </div>
            </div>
        </main>

        <RestaurantFooter />
    </>
);
}
