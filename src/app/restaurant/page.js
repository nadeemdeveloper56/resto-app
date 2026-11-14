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
            <div className="restaurant-auth-page">
                <RestaurantHeader />

                {Login ? (
                    <RestaurantLogin onSwitch={() => setIsLogin(false)} />
                ) : (
                    <RestaurantSignUp onSwitch={() => setIsLogin(true)} />
                )}
            </div>

            <RestaurantFooter />
        </>
    );
};

export default Restaurant;
