"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CustomerHeader from "../_components/CustomerHeader";
import RestaurantFooter from "../_components/RestaurantFooter";

function UserAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !user.name.trim() ||
      !user.email.trim() ||
      !user.phone.trim() ||
      !user.city.trim() ||
      !user.password ||
      !user.confirmPassword
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (user.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (user.password !== user.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/Api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name.trim(),
          email: user.email.trim().toLowerCase(),
          phone: user.phone.trim(),
          city: user.city.trim(),
          password: user.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const result = data.result;

        const safeUser = {
          id: result.id || result._id,
          _id: result._id || result.id,
          name: result.name || user.name.trim(),
          email: result.email || user.email.trim().toLowerCase(),
          phone: result.phone || user.phone.trim(),
          city: result.city || user.city.trim(),
        };

        localStorage.setItem("user", JSON.stringify(safeUser));
        window.dispatchEvent(new Event("userChange"));

        const redirect = searchParams.get("redirect");

        const destination =
          redirect &&
          redirect.startsWith("/") &&
          !redirect.startsWith("//") &&
          !redirect.includes("\\")
            ? redirect
            : "/";

        router.replace(destination);
        router.refresh();
      } else {
        setMessage(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setMessage("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const redirect = searchParams.get("redirect");

  const loginHref = redirect
    ? `/user-login?redirect=${encodeURIComponent(redirect)}`
    : "/user-login";

  return (
    <>
      <CustomerHeader />

      <main className="user-auth-page">
        <div className="signup-card">
          <div className="signup-heading">
            <h1>Create Account</h1>
            <p>Sign up to order your favourite food!</p>
          </div>

          <form onSubmit={handleSignup}>
            <div className="signup-input-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={user.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="signup-input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={user.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="signup-input-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="e.g. 03001234567"
                value={user.phone}
                onChange={handleChange}
                autoComplete="tel"
                maxLength={15}
                required
              />
            </div>

            <div className="signup-input-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter your city"
                value={user.city}
                onChange={handleChange}
                autoComplete="address-level2"
                required
              />
            </div>

            <div className="signup-input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password"
                value={user.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="signup-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={user.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {message && (
              <p className="signup-message" role="status">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Create Account"}
            </button>
          </form>

          <p className="signup-login">
            Already have an account?{" "}
            <Link href={loginHref}>Login</Link>
          </p>

          <Link href="/" className="signup-home">
            Back to Home
          </Link>
        </div>
      </main>

      <RestaurantFooter />
    </>
  );
}

export default function UserAuth() {
  return (
    <Suspense fallback={<p>Loading signup page...</p>}>
      <UserAuthForm />
    </Suspense>
  );
}