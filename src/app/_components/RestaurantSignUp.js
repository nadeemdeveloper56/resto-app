"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


const RestaurantSignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [city, setCity] = useState("");
    const [restaurantName, setRestaurantName] = useState("");
    const [address, setAddress] = useState("");
    const [contactNumber, setContactNumber] = useState("");

    const router = useRouter();

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (
            !email.trim() ||
            !password ||
            !confirmPassword ||
            !city.trim() ||
            !restaurantName.trim() ||
            !address.trim() ||
            !contactNumber.trim()
        ) {
            alert("Please fill in all fields");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            alert("Please enter a valid email address");
            return;
        }

        // Password validation
        if (password.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            alert("Password and Confirm Password do not match");
            return;
        }

        // Contact number: 1 to 15 digits
        const contactNumberRegex = /^[0-9]{1,15}$/;

        if (!contactNumberRegex.test(contactNumber)) {
            alert("Contact number must contain 1 to 15 digits only");
            return;
        }

        try {
            const response = await fetch("/Api/restaurant/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                    city: city.trim(),
                    restaurantName: restaurantName.trim(),
                    address: address.trim(),
                    contactNumber,
                }),
            });

            const data = await response.json();

            console.log("API Response:", data);

            if (response.ok && data.success) {
                alert("Restaurant Signup Successful!");

                const restaurant = data.result;

                if (restaurant) {
                    const safeRestaurant = { ...restaurant };
                    delete safeRestaurant.password;

                    localStorage.setItem(
                        "restaurant",
                        JSON.stringify(safeRestaurant)
                    );
                }

                router.push("/restaurant/DashBoard");
            } else {
                alert(data.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Unable to connect to the server. Please try again.");
        }
    };

    return (
        <main className="restaurant-signup-page">
            <form
                className="restaurant-signup-card"
                onSubmit={handleSignUp}
            >
                <h1 className="signup-title">Restaurant Signup</h1>

                <p className="signup-subtitle">
                    Create your restaurant account
                </p>

                <div className="signup-field">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </div>

                <div className="signup-field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="At least 6 characters"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>

                <div className="signup-field">
                    <label htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        className="input-field"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        autoComplete="new-password"
                    />
                </div>

                <div className="signup-field">
                    <label htmlFor="city">City</label>
                    <input
                        id="city"
                        type="text"
                        placeholder="Enter city"
                        className="input-field"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>

                <div className="signup-field">
                    <label htmlFor="restaurantName">Restaurant Name</label>
                    <input
                        id="restaurantName"
                        type="text"
                        placeholder="Enter restaurant name"
                        className="input-field"
                        value={restaurantName}
                        onChange={(e) =>
                            setRestaurantName(e.target.value)
                        }
                    />
                </div>

                <div className="signup-field">
                    <label htmlFor="address">Full Address</label>
                    <input
                        id="address"
                        type="text"
                        placeholder="Enter full address"
                        className="input-field"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

                <div className="signup-field">
                    <label htmlFor="contactNumber">Contact Number</label>
                    <input
                        id="contactNumber"
                        type="tel"
                        inputMode="numeric"
                        placeholder="Enter contact number"
                        className="input-field"
                        value={contactNumber}
                        maxLength={15}
                        onChange={(e) =>
                            setContactNumber(
                                e.target.value.replace(/[^0-9]/g, "").slice(0, 15)
                            )
                        }
                    />
                    <small className="signup-hint">
                        Enter 1 to 15 digits.
                    </small>
                </div>

                <button type="submit" className="signup-button">
                    Create Account
                </button>
            </form>
        </main>
    );
};

export default RestaurantSignUp;