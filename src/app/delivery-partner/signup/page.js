
"use client";

import { useState } from "react";
import Link from "next/link";

export default function DeliveryPartnerSignup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/Api/delivery-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed.");
        return;
      }

      setMessage("Account created successfully! You can now log in.");
      setFullName("");
      setEmail("");
      setPhone("");
      setCity("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Signup request failed:", error);
      setError("Unable to connect to the server. Please try again.");
    }
  };

  return (
    <main className="delivery-login-page">
      <div className="delivery-login-card">
        <div className="delivery-icon">🛵</div>

        <h1>Create Account</h1>
        <p className="delivery-subtitle">
          Join our delivery partner team
        </p>

        <form onSubmit={handleSignup}>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label htmlFor="signupEmail">Email Address</label>
          <input
            id="signupEmail"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            placeholder="Enter your city, e.g. Okara"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <label htmlFor="signupPassword">Password</label>
          <input
            id="signupPassword"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Enter password again"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <p className="delivery-error">{error}</p>}
          {message && <p className="delivery-success">{message}</p>}

          <button type="submit" className="delivery-login-button">
            Sign Up
          </button>
        </form>

        <p className="delivery-signup-text">
          Already have an account?{" "}
          <Link href="/delivery-partner">Login</Link>
        </p>

        <Link href="/" className="delivery-home-link">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
