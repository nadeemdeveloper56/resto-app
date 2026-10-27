
import { connectionStr } from "@/app/_components/lib/db";
import { foodSchema } from "@/app/_components/lib/FoodsModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await mongoose.connect(connectionStr);

        const payload = await request.json();

        const {
            name,
            price,
            img_path,
            description,
            resto_id
        } = payload;

        if (!name || !price || !img_path || !description || !resto_id) {
            return NextResponse.json({
                success: false,
                message: "Please fill in all fields"
            }, { status: 400 });
        }

        const result = await foodSchema.create({
            name,
            price,
            img_path,
            description,
            resto_id: new mongoose.Types.ObjectId(resto_id)
        });

        return NextResponse.json({
            success: true,
            message: "Food Item Added Successfully",
            result
        });

    } catch (error) {
        console.log("POST FOOD ERROR:", error);

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}
