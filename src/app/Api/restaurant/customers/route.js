
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { restaurantSchema } from "@/app/_components/lib/restaurantModel";
import { connectionStr } from "@/app/_components/lib/db";

export async function GET(request) {
    let queryParams = request.nextUrl.searchParams;
    console.log(queryParams.get("restaurant"));

    let filter = {};

    if (queryParams.get("location")) {
        let city = queryParams.get("location");

        filter.city = { $regex: new RegExp(city, "i") };
    }

    if (queryParams.get("restaurant")) {
        let restaurant = queryParams.get("restaurant");

        filter.restaurantName = {
            $regex: new RegExp(restaurant, "i")
        };
    }

    await mongoose.connect(connectionStr);

    let result = await restaurantSchema.find(filter).select("-password");

    return NextResponse.json({ success: true, result });
}
