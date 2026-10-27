
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RestaurantLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handlelogin = async () => {
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
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
        } catch (error) {
            setError("Something went wrong");
        }
    };

    return (
        <>
            <h1>Login Component</h1>

            <div className="input-wrapper">
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="input-field"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                    }}
                />
            </div>

            <div>
                <input
                    type="password"
                    placeholder="Enter your password"
                    className="input-field"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                    }}
                />
            </div>

            {error && <p>{error}</p>}

            <div>
                <button
                    className="button"
                    onClick={handlelogin}
                >
                    Login
                </button>
            </div>
        </>
    );
};

export default RestaurantLogin;

