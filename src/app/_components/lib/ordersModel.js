
import mongoose from "mongoose";

const orderModel = new mongoose.Schema(
    {
        user_Id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        email: {
            type: String,
            required: true,
        },

        resto_Id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        deliveryBoy_Id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        status: {
            type: String,
            default: "Pending",
        },

        amount: {
            type: Number,
            required: true,
        },

        customer: {
            name: String,
            phone: String,
            city: String,
        },

        items: [
            {
                food_Id: String,
                name: String,
                price: Number,
                quantity: Number,
                img_path: String,
            },
        ],
    },
    { timestamps: true }
);

export const orderSchema =
    mongoose.models.order ||
    mongoose.model("order", orderModel);
