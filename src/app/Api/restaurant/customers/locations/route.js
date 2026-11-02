
import { NextResponse } from "next/server";
import { restaurantSchema } from "@/app/_components/lib/restaurantModel";
import { connectDB } from "@/app/_components/lib/db";

export async function GET() {
    try {
        await connectDB();

        const restaurants = await restaurantSchema.find();

        let result = restaurants
            .map((item) => item.city)
            .filter(
                (city) =>
                    typeof city === "string" && city.trim() !== ""
            )
            .map(
                (city) =>
                    city.trim().charAt(0).toUpperCase() +
                    city.trim().slice(1)
            );

        result = [...new Set(result)];

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error) {
        console.error("Location API Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}
