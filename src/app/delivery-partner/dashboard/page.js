
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryPartnerDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [partner, setPartner] = useState(null);
  const [orders, setOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [checkingSession, setCheckingSession] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load available orders for the logged-in partner's city
  const loadOrders = useCallback(async (city) => {
    if (!city?.trim()) {
      setOrders([]);
      setError("Your city is missing from your profile.");
      return;
    }

    setOrdersLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/Api/delivery-partner/${encodeURIComponent(city.trim())}`,
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/delivery-partner");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load available orders."
        );
      }

      setOrders(data.orders || []);
    } catch (err) {
      setOrders([]);
      setError(err.message || "Unable to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, [router]);

  // Load deliveries already assigned to this partner
  const loadMyDeliveries = useCallback(async () => {
    setDeliveriesLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/Api/delivery-partner/my-deliveries",
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/delivery-partner");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load your deliveries."
        );
      }

      setMyDeliveries(data.deliveries || []);
    } catch (err) {
      setError(err.message || "Unable to load your deliveries.");
    } finally {
      setDeliveriesLoading(false);
    }
  }, [router]);

  // Verify session and load dashboard
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await fetch(
          "/Api/delivery-partner/session",
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.partner) {
          router.replace("/delivery-partner");
          return;
        }

        if (cancelled) return;

        const currentPartner = data.partner;
        setPartner(currentPartner);

        if (!currentPartner.city?.trim()) {
          setError(
            "Your city is missing from your profile. Please update your profile."
          );
          return;
        }

        const [ordersResponse, deliveriesResponse] =
          await Promise.all([
            fetch(
              `/Api/delivery-partner/${encodeURIComponent(
                currentPartner.city.trim()
              )}`,
              {
                cache: "no-store",
                credentials: "include",
              }
            ),
            fetch("/Api/delivery-partner/my-deliveries", {
              cache: "no-store",
              credentials: "include",
            }),
          ]);

        const [ordersData, deliveriesData] = await Promise.all([
          ordersResponse.json(),
          deliveriesResponse.json(),
        ]);

        if (
          ordersResponse.status === 401 ||
          deliveriesResponse.status === 401
        ) {
          router.replace("/delivery-partner");
          return;
        }

        if (!ordersResponse.ok || !ordersData.success) {
          throw new Error(
            ordersData.message || "Unable to load available orders."
          );
        }

        if (!deliveriesResponse.ok || !deliveriesData.success) {
          throw new Error(
            deliveriesData.message || "Unable to load your deliveries."
          );
        }

        if (!cancelled) {
          setOrders(ordersData.orders || []);
          setMyDeliveries(deliveriesData.deliveries || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load dashboard.");
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Accept an available order
  const handleAcceptOrder = async (orderId) => {
    setError("");
    setMessage("");
    setAcceptingOrderId(orderId);

    try {
      const response = await fetch(
        "/Api/delivery-partner/accept-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ orderId }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/delivery-partner");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to accept order."
        );
      }

      setOrders((previous) =>
        previous.filter((order) => order._id !== orderId)
      );

      await loadMyDeliveries();

      setMessage(
        `Order #${orderId.slice(-6)} accepted successfully!`
      );
    } catch (err) {
      setError(err.message || "Unable to accept order.");

      if (partner?.city) {
        await loadOrders(partner.city);
      }
    } finally {
      setAcceptingOrderId("");
    }
  };

  // Update delivery status
  const handleUpdateStatus = async (orderId, status) => {
    setError("");
    setMessage("");
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(
        "/Api/delivery-partner/update-status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ orderId, status }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/delivery-partner");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update order status."
        );
      }

      setMyDeliveries((previous) =>
        previous.map((order) =>
          order._id === orderId
            ? { ...order, status: data.order.status }
            : order
        )
      );

      setMessage(
        `Order status updated to "${data.order.status}".`
      );
    } catch (err) {
      setError(err.message || "Status update failed.");
      await loadMyDeliveries();
    } finally {
      setUpdatingOrderId("");
    }
  };

  // Logout
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/Api/delivery-partner/logout",
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout failed.");
      }

      setPartner(null);
      setOrders([]);
      setMyDeliveries([]);

      router.replace("/delivery-partner");
      router.refresh();
    } catch (err) {
      setError(err.message || "Logout failed. Please try again.");
      setLoggingOut(false);
    }
  };

  if (checkingSession || !partner) {
    return (
      <main className="partner-dashboard">
        <p>
          {loggingOut
            ? "Logging out..."
            : "Verifying your login..."}
        </p>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  }

  const activeDeliveries = myDeliveries.filter(
    (order) =>
      order.status === "Accepted" ||
      order.status === "Out for Delivery"
  ).length;

  const completedDeliveries = myDeliveries.filter(
    (order) => order.status === "Delivered"
  ).length;

  return (
    <main className="partner-dashboard">
      <header className="partner-header">
        <div>
          <h1>🚚 Delivery Partner</h1>
          <p>Delivery management panel</p>
          <p>
            <strong>Assigned City:</strong> {partner.city}
          </p>
        </div>

        <button
          className="partner-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </header>

      <div className="partner-layout">
        <aside className="partner-sidebar">
          <h3>Menu</h3>

          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => {
              setActiveTab("overview");
              setError("");
              setMessage("");
            }}
          >
            Overview
          </button>

          <button
            className={activeTab === "deliveries" ? "active" : ""}
            onClick={() => {
              setActiveTab("deliveries");
              setError("");
              setMessage("");
            }}
          >
            Available Orders
          </button>

          <button
            className={activeTab === "my-deliveries" ? "active" : ""}
            onClick={() => {
              setActiveTab("my-deliveries");
              setError("");
              setMessage("");
              loadMyDeliveries();
            }}
          >
            My Deliveries
          </button>

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => {
              setActiveTab("profile");
              setError("");
              setMessage("");
            }}
          >
            My Profile
          </button>
        </aside>

        <section className="partner-content">
          {error && (
            <p className="delivery-error" role="alert">
              {error}
            </p>
          )}

          {message && <p role="status">{message}</p>}

          {/* Overview */}
          {activeTab === "overview" && (
            <>
              <h2>Dashboard Overview</h2>

              <p className="partner-welcome">
                Welcome, {partner.fullName || partner.email}!
              </p>

              <div className="partner-stats">
                <div className="partner-stat-card">
                  <span>📦</span>
                  <h3>{orders.length}</h3>
                  <p>Available Orders</p>
                </div>

                <div className="partner-stat-card">
                  <span>🛵</span>
                  <h3>{activeDeliveries}</h3>
                  <p>My Active Deliveries</p>
                </div>

                <div className="partner-stat-card">
                  <span>✅</span>
                  <h3>{completedDeliveries}</h3>
                  <p>Completed Deliveries</p>
                </div>
              </div>

              <div className="partner-notice">
                <h3>Delivery Updates</h3>
                <p>
                  You have {orders.length} available order(s) and{" "}
                  {activeDeliveries} active delivery/deliveries.
                </p>

                <button
                  className="partner-logout"
                  onClick={() => {
                    setActiveTab("deliveries");
                    setError("");
                    setMessage("");
                  }}
                >
                  View Available Orders
                </button>

                <button
                  className="partner-logout"
                  onClick={() => {
                    setActiveTab("my-deliveries");
                    setError("");
                    setMessage("");
                    loadMyDeliveries();
                  }}
                >
                  View My Deliveries
                </button>
              </div>
            </>
          )}

          {/* Available Orders */}
          {activeTab === "deliveries" && (
            <>
              <h2>Available Orders — {partner.city}</h2>

              <button
                className="partner-logout"
                onClick={() => loadOrders(partner.city)}
                disabled={ordersLoading || Boolean(acceptingOrderId)}
              >
                {ordersLoading ? "Refreshing..." : "Refresh Orders"}
              </button>

              {ordersLoading && (
                <p>Loading available orders...</p>
              )}

              {!ordersLoading && orders.length === 0 && (
                <div className="partner-notice">
                  <p>
                    No unassigned pending orders available in{" "}
                    {partner.city}.
                  </p>
                </div>
              )}

              <div className="partner-order-list">
                {orders.map((order) => (
                  <article
                    className="partner-notice"
                    key={order._id}
                  >
                    <h3>Order #{order._id.slice(-6)}</h3>

                    <p>
                      <strong>City:</strong>{" "}
                      {order.customer?.city || "Not available"}
                    </p>

                    <p>
                      <strong>Amount:</strong> Rs.{" "}
                      {Number(order.amount || 0).toLocaleString()}
                    </p>

                    <p>
                      <strong>Status:</strong> {order.status}
                    </p>

                    <p><strong>Items:</strong></p>
                    <ul>
                      {order.items?.map((item, index) => (
                        <li key={item._id || index}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>

                    <p>
                      <strong>Order date:</strong>{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "Not available"}
                    </p>

                    <button
                      className="partner-logout"
                      onClick={() => handleAcceptOrder(order._id)}
                      disabled={Boolean(acceptingOrderId)}
                    >
                      {acceptingOrderId === order._id
                        ? "Accepting..."
                        : "Accept Order"}
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* My Deliveries */}
          {activeTab === "my-deliveries" && (
            <>
              <h2>My Deliveries</h2>

              <button
                className="partner-logout"
                onClick={loadMyDeliveries}
                disabled={
                  deliveriesLoading || Boolean(updatingOrderId)
                }
              >
                {deliveriesLoading
                  ? "Refreshing..."
                  : "Refresh My Deliveries"}
              </button>

              {deliveriesLoading && (
                <p>Loading your deliveries...</p>
              )}

              {!deliveriesLoading && myDeliveries.length === 0 && (
                <div className="partner-notice">
                  <p>No deliveries assigned to you yet.</p>
                </div>
              )}

              <div className="partner-order-list">
                {myDeliveries.map((order) => (
                  <article
                    className="partner-notice"
                    key={order._id}
                  >
                    <h3>Order #{order._id.slice(-6)}</h3>

                    <p>
                      <strong>Customer:</strong>{" "}
                      {order.customer?.name || "Not available"}
                    </p>

                    <p>
                      <strong>Phone:</strong>{" "}
                      {order.customer?.phone || "Not available"}
                    </p>

                    <p>
                      <strong>City:</strong>{" "}
                      {order.customer?.city || "Not available"}
                    </p>

                    <p>
                      <strong>Amount:</strong> Rs.{" "}
                      {Number(order.amount || 0).toLocaleString()}
                    </p>

                    <p>
                      <strong>Status:</strong> {order.status}
                    </p>

                    <p><strong>Items:</strong></p>
                    <ul>
                      {order.items?.map((item, index) => (
                        <li key={item._id || index}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>

                    <p>
                      <strong>Order date:</strong>{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "Not available"}
                    </p>

                    {order.status === "Accepted" && (
                      <button
                        className="partner-logout"
                        onClick={() =>
                          handleUpdateStatus(
                            order._id,
                            "Out for Delivery"
                          )
                        }
                        disabled={Boolean(updatingOrderId)}
                      >
                        {updatingOrderId === order._id
                          ? "Updating..."
                          : "Start Delivery"}
                      </button>
                    )}

                    {order.status === "Out for Delivery" && (
                      <button
                        className="partner-logout"
                        onClick={() =>
                          handleUpdateStatus(
                            order._id,
                            "Delivered"
                          )
                        }
                        disabled={Boolean(updatingOrderId)}
                      >
                        {updatingOrderId === order._id
                          ? "Updating..."
                          : "Mark as Delivered"}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="partner-notice">
              <h2>My Profile</h2>

              <p>
                <strong>Name:</strong>{" "}
                {partner.fullName || "Not available"}
              </p>

              <p>
                <strong>Email:</strong> {partner.email}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {partner.phone || "Not available"}
              </p>

              <p>
                <strong>City:</strong>{" "}
                {partner.city || "Not available"}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
