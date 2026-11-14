import { connectDB } from "@/app/_components/lib/db";
import { foodSchema } from "@/app/_components/lib/FoodsModel";
import { restaurantSchema } from "@/app/_components/lib/restaurantModel";
import { NextResponse } from "next/server";

export async function GET(request, content) {
    try {
        const { id } = await content.params;

        await connectDB();

        const [details, fooditems] = await Promise.all([
            restaurantSchema
                .findById(id)
                .select("restaurantName contactNumber city address email")
                .lean(),
            foodSchema
                .find({ resto_id: id })
                .select("name price img_path description")
                .lean(),
        ]);

        return NextResponse.json({ success: true, details, fooditems });
    } catch (error) {
        console.error("Customer restaurant details API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load restaurant details",
            },
            { status: 500 }
        );
    }
}