"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RestaurantLogin = ({ onSwitch }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handlelogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/Api/restaurant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    login: true,
                }),
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem(
                    "restaurant",
                    JSON.stringify(result.result)
                );

                router.push("/restaurant/DashBoard");
            } else {
                setError("Incorrect email or password");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="restaurant-login-page">
            <form
                className="restaurant-login-card"
                onSubmit={handlelogin}
            >
                <h1 className="signup-title">Restaurant Login</h1>

                <p className="signup-subtitle">
                    Login to manage your restaurant
                </p>

                <div className="signup-field">
                    <label htmlFor="login-email">Email Address</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="input-field"
                        value={email}
                        autoComplete="email"
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                        }}
                    />
                </div>

                <div className="signup-field">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        className="input-field"
                        value={password}
                        autoComplete="current-password"
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                        }}
                    />
                </div>

                {error && <p className="login-message">{error}</p>}

                <button
                    type="submit"
                    className="signup-button"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {onSwitch && (
                    <p className="auth-switch">
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            className="auth-switch-link"
                            onClick={onSwitch}
                        >
                            Sign Up
                        </button>
                    </p>
                )}
            </form>
        </main>
    );
};

export default RestaurantLogin;
