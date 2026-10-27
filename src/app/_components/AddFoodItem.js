import React from "react";
import { useState } from "react";

export default function AddFoodItem(props) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [path, setPath] = useState("");
    const [description, setDescription] = useState("");
    const [error,setError]=useState("");
    

    const handleAddFoodItem = async () => {

        if (!name || !price || !path || !description) {
            alert("Please fill in all fields");
            return;
        }

        console.log(name, price, path, description);

        let resto_id;

        const restaurantData = JSON.parse(localStorage.getItem("restaurant"));

        if (restaurantData) {
            resto_id = restaurantData._id;
        }

        let response = await fetch("http://localhost:3000/Api/restaurant/foods", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                price,
                img_path: path,
                description,
                resto_id
            })
        });

        response = await response.json();

        if (response.success) {
            alert("Food Item Added");
            props.setAddItem(false)
        } else {
            alert("Food Item Not Added");
        }
    };

    return (
        <div className="container">
            <h1>Welcome to food item</h1>

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
                <button className="button" onClick={handleAddFoodItem}>
                    Add Food Item
                    
                </button>
            </div>
        </div>
    );
}