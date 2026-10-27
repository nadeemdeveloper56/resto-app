import { connectionStr } from "@/app/_components/lib/db";
import { foodSchema } from "@/app/_components/lib/FoodsModel";
import { restaurantSchema } from "@/app/_components/lib/restaurantModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, content) {
    const params = await content.params;
    const id = params.id;

    await mongoose.connect(connectionStr);

    const details = await restaurantSchema.findOne({ _id: id });
    const fooditems= await foodSchema.find({resto_id:id})

    return NextResponse.json({ success: true, details, fooditems });
}