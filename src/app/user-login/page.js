"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CustomerHeader from "../_components/CustomerHeader";
import RestaurantFooter from "../_components/RestaurantFooter";

function UserLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!email.trim() || !password) {
            setMessage("Please enter your email and password.");
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
                    email: email.trim().toLowerCase(),
                    password,
                    login: true,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const result = data.result;

                const safeUser = {
                    id: result.id || result._id,
                    _id: result._id || result.id,
                    name: result.name,
                    email: result.email,
                    phone: result.phone,
                    city: result.city,
                };

                sessionStorage.setItem(
                    "activeUser",
                    JSON.stringify(safeUser)
                );

                localStorage.removeItem("user");
                localStorage.removeItem("userLoginExpiry");

                const userId =
                    safeUser._id || safeUser.id || safeUser.email;

                const cartKey = `cart_${userId}`;

                let personalCart = [];

                try {
                    const savedCart = JSON.parse(
                        localStorage.getItem(cartKey) || "[]"
                    );

                    personalCart = Array.isArray(savedCart)
                        ? savedCart
                        : [];
                } catch {
                    personalCart = [];
                }

                localStorage.setItem(
                    cartKey,
                    JSON.stringify(personalCart)
                );

                localStorage.setItem(
                    "cart",
                    JSON.stringify(personalCart)
                );

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
                setMessage(
                    data.message || "Invalid email or password."
                );
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("Unable to connect. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CustomerHeader />

            <main className="user-login-page">
                <div className="login-card">
                    <div className="login-heading">
                        <h1>Welcome Back!</h1>
                        <p>Login to order your favourite food.</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="login-input-group">
                            <label htmlFor="login-email">
                                Email Address
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="login-input-group">
                            <label htmlFor="login-password">
                                Password
                            </label>

                            <input
                                id="login-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {message && (
                            <p className="login-message" role="status">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="login-signup">
                        Don&apos;t have an account?{" "}
                        <Link
                            href={
                                searchParams.get("redirect")
                                    ? `/user-auth?redirect=${encodeURIComponent(
                                          searchParams.get("redirect")
                                      )}`
                                    : "/user-auth"
                            }
                        >
                            Sign Up
                        </Link>
                    </p>

                    <Link href="/" className="login-home">
                        Back to Home
                    </Link>
                </div>
            </main>

            <RestaurantFooter />
        </>
    );
}

export default function UserLogin() {
    return (
        <Suspense fallback={<p>Loading login page...</p>}>
            <UserLoginForm />
        </Suspense>
    );
}