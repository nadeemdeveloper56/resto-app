
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditFoodItem(props) {
    const params = React.use(props.params);
    const router = useRouter();

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [path, setPath] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const loadFoodItem = useCallback(async () => {
        try {
            console.log("FOOD ID:", params.id);

            const response = await fetch(
                `http://localhost:3000/Api/restaurant/foods/${params.id}`
            );

            const data = await response.json();

            console.log("FOOD RESPONSE:", data);

            if (data.success && data.result) {
                setName(data.result.name || "");
                setPrice(data.result.price ?? "");
                setPath(data.result.img_path || "");
                setDescription(data.result.description || "");
                setError("");
            } else {
                setError("Food item not found");
            }
        } catch (error) {
            console.log("GET FOOD ERROR:", error);
            setError("Something went wrong");
        }
    }, [params.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadFoodItem();
        }, 0);

        return () => clearTimeout(timer);
    }, [loadFoodItem]);

    const handleEditFoodItem = async () => {
        if (!name || !price || !path || !description) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3000/Api/restaurant/foods/${params.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        price,
                        img_path: path,
                        description,
                    }),
                }
            );

            const data = await response.json();

            console.log("UPDATE RESPONSE:", data);

            if (data.success) {
                alert("Food Item Updated Successfully");
                router.push("/restaurant/DashBoard");
            } else {
                alert("Food Item is not updated");
            }
        } catch (error) {
            console.log("UPDATE FOOD ERROR:", error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="container">
            <h1>Update Food Item</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <div className="input-wrapper">
                <input
                    type="text"
                    className="input-field"
                    placeholder="Enter Food Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="input-wrapper">
                <input
                    type="text"
                    className="input-field"
                    placeholder="Enter Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>

            <div className="input-wrapper">
                <input
                    type="text"
                    className="input-field"
                    placeholder="Enter Food Image Path"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                />
            </div>

            <div className="input-wrapper">
                <input
                    type="text"
                    className="input-field"
                    placeholder="Enter Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="input-wrapper">
                <button
                    className="button"
                    onClick={handleEditFoodItem}
                >
                    Update Food Item
                </button>

                <button
                    className="button"
                    onClick={() => router.push("/restaurant/DashBoard")}
                >
                    Return To DashBoard
                </button>
            </div>
        </div>
    );
}
