
"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import defaultFoodItems from "@/app/lib/defaultFoodItems";

const FoodItemList = () => {
    const router = useRouter();

    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load only foods present in defaultFoodItems.js
    const LoadFoodItem = async () => {
        try {
            const restaurantData = JSON.parse(
                localStorage.getItem("restaurant") || "null"
            );

            if (!restaurantData?._id) {
                console.error("Restaurant data not found in localStorage");
                setFoodItems([]);
                return;
            }

            const response = await fetch(
                `/Api/restaurant/foods/${restaurantData._id}`
            );

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch {
                console.error("FOOD LIST RESPONSE:", text.slice(0, 500));
                alert("Food list API error. Check the VS Code terminal.");
                return;
            }

            if (!response.ok || !data.success) {
                alert(data.message || "Food items could not be loaded");
                return;
            }

            // Filter foods using names in defaultFoodItems.js
            const defaultNames = new Set(
                defaultFoodItems.map((food) =>
                    food.name.trim().toLowerCase()
                )
            );

            const filteredFoods = (data.result || []).filter((food) =>
                defaultNames.has(
                    (food.name || "").trim().toLowerCase()
                )
            );

            setFoodItems(filteredFoods);
        } catch (error) {
            console.error("LOAD FOOD ERROR:", error);
            alert("Unable to load food items");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            LoadFoodItem();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    // Add missing sample foods
    const addSampleFoods = async () => {
        try {
            const restaurantData = JSON.parse(
                localStorage.getItem("restaurant") || "null"
            );

            if (!restaurantData?._id) {
                alert("Please login to your restaurant account.");
                return;
            }

            setLoading(true);

            const response = await fetch("/Api/restaurant/seed-foods", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resto_id: restaurantData._id,
                }),
            });

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch {
                console.error("SEED API RESPONSE:", text.slice(0, 500));
                alert("Seed API error. Check the VS Code terminal.");
                return;
            }

            if (!response.ok || !data.success) {
                alert(data.message || "Sample foods could not be added.");
                return;
            }

            await LoadFoodItem();

            alert(
                `${data.message}\nNew items added: ${data.result?.added ?? 0}`
            );
        } catch (error) {
            console.error("SEED FOOD ERROR:", error);
            alert("Request failed. Check the VS Code terminal.");
        } finally {
            setLoading(false);
        }
    };

    // Delete food item
    const deletefoodItem = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this food item?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/Api/restaurant/foods/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (response.ok && data.success) {
                await LoadFoodItem();
            } else {
                alert(data.message || "Food item could not be deleted.");
            }
        } catch (error) {
            console.error("DELETE FOOD ERROR:", error);
            alert("Unable to delete food item.");
        }
    };

    // Edit food item
    const editFoodItem = (id) => {
        router.push("/restaurant/DashBoard/" + id);
    };

    return (
        <div>
            <h1>Food Items</h1>

            <button
                type="button"
                onClick={addSampleFoods}
                disabled={loading}
            >
                {loading ? "Adding Foods..." : "Add Sample Food Items"}
            </button>

            <p>Total Food Items: {foodItems.length}</p>

            <table>
                <thead>
                    <tr>
                        <th>S.N</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>Image</th>
                        <th>Operation</th>
                    </tr>
                </thead>

                <tbody>
                    {foodItems.map((item, index) => (
                        <tr key={item._id}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>Rs. {item.price}</td>
                            <td>{item.description}</td>

                            <td>
                                {item.img_path ? (
                                    <Image
                                        src={item.img_path}
                                        width={100}
                                        height={80}
                                        alt={item.name || "Food"}
                                        unoptimized
                                        style={{
                                            objectFit: "cover",
                                            borderRadius: "6px",
                                        }}
                                    />
                                ) : (
                                    "No image"
                                )}
                            </td>

                            <td>
                                <button
                                    type="button"
                                    onClick={() => deletefoodItem(item._id)}
                                >
                                    Delete
                                </button>

                                <button
                                    type="button"
                                    onClick={() => editFoodItem(item._id)}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}

                    {foodItems.length === 0 && (
                        <tr>
                            <td colSpan={6}>
                                No default food items found. Click &quot;Add
                                Sample Food Items&quot; to add missing items.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FoodItemList;
