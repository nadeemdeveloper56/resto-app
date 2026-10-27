
import mongoose from "mongoose";

const RestaurantModel = new mongoose.Schema({

    name: String,

    email: String,

    password: String,

    city: String,

    restaurantName: String,

    address: String,

    contactNumber: String,

    age: Number,

    hobbies: Array,

});

export const restaurantSchema =

    mongoose.models.Restaurant ||

    mongoose.model("Restaurant", RestaurantModel);

