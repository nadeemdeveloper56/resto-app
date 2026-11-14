
import { NextResponse } from "next/server";
import { restaurantSchema } from "@/app/_components/lib/restaurantModel";
import { connectDB } from "@/app/_components/lib/db";

export async function GET(request) {
    try {
        const queryParams = request.nextUrl.searchParams;
        const filter = {};

        if (queryParams.get("location")) {
            filter.city = {
                $regex: new RegExp(queryParams.get("location"), "i")
            };
        }

        if (queryParams.get("restaurant")) {
            filter.restaurantName = {
                $regex: new RegExp(queryParams.get("restaurant"), "i")
            };
        }

        await connectDB();

        const result = await restaurantSchema
            .find(filter)
            .select("restaurantName contactNumber city address email")
            .lean();

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("Customer restaurants API error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to load restaurants" },
            { status: 500 }
        );
    }
}
