import { connectionStr } from '@/app/_components/lib/db';
import { foodSchema } from '@/app/_components/lib/FoodsModel';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';


// GET FOOD ITEM
export async function GET(request, content) {

    try {

        const { id } = await content.params;

        console.log("ID:", id);

        await mongoose.connect(connectionStr);

        // Pehle single food item ko _id se find karein
        const foodItem = await foodSchema.findOne({
            _id: id
        });

        if (foodItem) {

            console.log("Single Food:", foodItem);

            return NextResponse.json({
                result: foodItem,
                success: true
            });
        }


        // Agar single food nahi mila to restaurant ID se foods find karein
        const result = await foodSchema.find({
            resto_id: new mongoose.Types.ObjectId(id)
        });

        console.log("Food Result:", result);

        if (result.length > 0) {

            return NextResponse.json({
                result: result,
                success: true
            });

        }


        return NextResponse.json({
            result: [],
            success: false
        });

    } catch (error) {

        console.log("GET ERROR:", error);

        return NextResponse.json({
            result: error.message,
            success: false
        });

    }
}


// UPDATE FOOD ITEM
export async function PUT(request, content) {

    try {

        const { id } = await content.params;

        console.log("UPDATE FOOD ID:", id);

        const payload = await request.json();

        console.log("UPDATE DATA:", payload);

        await mongoose.connect(connectionStr);

        const result = await foodSchema.updateOne(
            {
                _id: id
            },
            {
                $set: {
                    name: payload.name,
                    price: payload.price,
                    img_path: payload.img_path,
                    description: payload.description
                }
            }
        );

        console.log("UPDATE RESULT:", result);

        if (result.matchedCount > 0) {

            return NextResponse.json({
                result: result,
                success: true
            });

        } else {

            return NextResponse.json({
                result: "Food item not found",
                success: false
            });

        }

    } catch (error) {

        console.log("PUT ERROR:", error);

        return NextResponse.json({
            result: error.message,
            success: false
        });

    }
}


// DELETE FOOD ITEM
export async function DELETE(request, content) {

    try {

        const { id } = await content.params;

        console.log("DELETE FOOD ID:", id);

        await mongoose.connect(connectionStr);

        const result = await foodSchema.deleteOne({
            _id: id
        });

        console.log("DELETE RESULT:", result);

        if (result.deletedCount > 0) {

            return NextResponse.json({
                result: result,
                success: true
            });

        } else {

            return NextResponse.json({
                result: "Food item not found",
                success: false
            });

        }

    } catch (error) {

        console.log("DELETE ERROR:", error);

        return NextResponse.json({
            result: error.message,
            success: false
        });

    }
}