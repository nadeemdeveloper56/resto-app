
"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomerHeader from "@/app/_components/CustomerHeader";
import RestaurantFooter from "@/app/_components/RestaurantFooter";

export default function MyProfile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("activeUser");

    if (!storedUser) {
      router.replace("/user-login?redirect=%2Fmy-profile");
      setLoading(false);
      return;
    }

    let parsedUser;

    try {
      parsedUser = JSON.parse(storedUser);

      if (!parsedUser) {
        throw new Error("User data not found.");
      }

      // Dono storage keys ko same user ke sath sync rakhein.
      localStorage.setItem("user", JSON.stringify(parsedUser));
      sessionStorage.setItem("activeUser", JSON.stringify(parsedUser));

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("user");
      sessionStorage.removeItem("activeUser");
      router.replace("/user-login?redirect=%2Fmy-profile");
      setLoading(false);
      return;
    }

    const userId = parsedUser._id || parsedUser.id;

    if (!userId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/Api/orders?userId=${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load orders.");
        }

        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        setError(err.message || "Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    sessionStorage.removeItem("activeUser");

    router.replace("/");
  };

  return (
    <>
      <CustomerHeader />

      <main className="my-profile-container">
        <h1>My Profile</h1>

        {user && (
          <section className="profile-card">
            <h2>Customer Information</h2>

            <p>
              <strong>Name:</strong>{" "}
              {user.name || user.fullName || "Not provided"}
            </p>

            <p>
              <strong>Email:</strong> {user.email || "Not provided"}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {user.phone || user.contactNumber || "Not provided"}
            </p>

            <p>
              <strong>City:</strong> {user.city || "Not provided"}
            </p>

            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </section>
        )}

        <section className="orders-section">
          <h2>My Orders</h2>

          {loading ? (
            <p>Loading your orders...</p>
          ) : error ? (
            <p className="profile-error">{error}</p>
          ) : orders.length === 0 ? (
            <p>You have not placed any orders yet.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order, index) => {
                const orderId = order._id || order.id || index;
                const items = Array.isArray(order.items)
                  ? order.items
                  : [];

                return (
                  <article
                    className="order-card"
                    key={orderId}
                  >
                    <h3>Order #{String(orderId)}</h3>

                    <p>
                      <strong>Date:</strong>{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : order.date
                          ? new Date(order.date).toLocaleString()
                          : "Not available"}
                    </p>

                    <div className="order-status-row">
  <span className="status-label">Order Status</span>

  <span
    className={`status-badge status-${String(
      order.status || "Pending"
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`}
  >
    <span className="status-dot"></span>
    {order.status || "Pending"}
  </span>
</div>

                    <div className="order-items">
                      <strong>Items:</strong>

                      {items.length > 0 ? (
                        <ul>
                          {items.map((item, itemIndex) => (
                            <li
                              key={
                                item._id ||
                                item.id ||
                                `${item.name || "item"}-${itemIndex}`
                              }
                            >
                              {item.name || item.foodName || "Food item"}
                              {" × "}
                              {item.quantity || 1}
                              {" — Rs. "}
                              {Number(item.price || 0) *
                                Number(item.quantity || 1)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Item details are not available.</p>
                      )}
                    </div>

                    <p className="order-total">
                      <strong>Total:</strong> Rs.{" "}
                      {Number(order.amount || order.totalAmount || 0)}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <RestaurantFooter />
    </>
  );
}
