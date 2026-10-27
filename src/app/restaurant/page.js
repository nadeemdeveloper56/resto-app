
"use client";

import RestaurantLogin from "../_components/RestaurantLogin";
import RestaurantSignUp from "../_components/RestaurantSignUp";
import { useState } from "react";
import RestaurantHeader from "../_components/Restaurantheader";
import "./style.css";
import RestaurantFooter from "../_components/RestaurantFooter";

const Restaurant = () => {
    const [Login, setIsLogin] = useState(true);

    return (
        <>
            <div className="container">

                <RestaurantHeader />

                <h1 className="text-2xl font-bold">
                    Restaurant Login/Signup Page
                </h1>

                {
                    Login ? (
                        <RestaurantLogin />
                    ) : (
                        <RestaurantSignUp />
                    )
                }

                <div>
                    <button
                        className="account-button button-Link"
                        onClick={() => setIsLogin(!Login)}
                    >
                        {Login
                            ? "Don't have an account? Sign Up"
                            : "Already have an account? Login"
                        }
                    </button>
                </div>

            </div>

            <RestaurantFooter />
        </>
    );
};

export default Restaurant;

