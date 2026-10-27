
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { restaurantSchema } from "@/app/_components/lib/restaurantModel";
import { seedRestaurantFoods } from "@/app/lib/seedRestaurantFoods";

const connectionStr = process.env.MONGODB_URI;

async function connectDB() {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(connectionStr);
    }
}

export async function GET() {
    try {
        await connectDB();

        const data = await restaurantSchema.find();

        return NextResponse.json({
            success: true,
            database: mongoose.connection.name,
            collection: restaurantSchema.collection.name,
            result: data,
        });
    } catch (error) {
        console.error("GET ERROR:", error);

        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        const {
            email,
            password,
            city,
            restaurantName,
            address,
            contactNumber,
            login,
        } = body;

        // LOGIN
        if (login === true) {
            const result = await restaurantSchema.findOne({
                email,
                password,
            });

            if (!result) {
                return NextResponse.json({
                    success: false,
                    message: "Incorrect email or password",
                });
            }

            return NextResponse.json({
                success: true,
                message: "Login successful",
                result,
            });
        }

        // SIGNUP
        if (
            !email ||
            !password ||
            !city ||
            !restaurantName ||
            !address ||
            !contactNumber
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please fill in all fields",
                },
                { status: 400 }
            );
        }

        const existingRestaurant = await restaurantSchema.findOne({
            email,
        });

        if (existingRestaurant) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This email is already registered",
                },
                { status: 409 }
            );
        }

        const restaurant = new restaurantSchema({
            email,
            password,
            city,
            restaurantName,
            address,
            contactNumber,
        });

        const result = await restaurant.save();

        // Automatically add sample foods for this new restaurant
        let menuResult;

        try {
            menuResult = await seedRestaurantFoods(result._id);
        } catch (seedError) {
            console.error("FOOD SEED ERROR:", seedError);

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Restaurant was created, but sample foods could not be added.",
                    restaurantId: result._id,
                    error: seedError.message,
                },
                { status: 500 }
            );
        }

        const safeRestaurant = result.toObject();
        delete safeRestaurant.password;

        return NextResponse.json({
            success: true,
            message: "Restaurant signup successful",
            result: safeRestaurant,
            menu: menuResult,
        });
    } catch (error) {
        console.error("POST ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
