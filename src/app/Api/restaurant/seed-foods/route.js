
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionStr } from "@/app/_components/lib/db";
import { restaurantSchema } from "@/app/_components/lib/restaurantModel";
import { seedRestaurantFoods } from "@/app/lib/seedRestaurantFoods";
export async function GET() {
    return NextResponse.json({
        success: true,
        message: "Seed foods API is running. Use POST to add food items."
    });
}

export async function POST(request) {
    try {
        await mongoose.connect(connectionStr);

        const { resto_id } = await request.json();

        if (!resto_id || !mongoose.Types.ObjectId.isValid(resto_id)) {
            return NextResponse.json(
                { success: false, message: "Valid resto_id is required" },
                { status: 400 }
            );
        }

        const restaurant = await restaurantSchema.findById(resto_id);

        if (!restaurant) {
            return NextResponse.json(
                { success: false, message: "Restaurant not found" },
                { status: 404 }
            );
        }

        const result = await seedRestaurantFoods(restaurant._id);

        return NextResponse.json({
            success: true,
            message: "Food seeding completed",
            result
        });
    } catch (error) {
        console.error("SEED API ERROR:", error);

        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
