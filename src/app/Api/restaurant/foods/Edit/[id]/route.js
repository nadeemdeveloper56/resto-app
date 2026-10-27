import { connectionStr } from "@/app/_components/lib/db";
import { foodSchema } from "@/app/_components/lib/FoodsModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  const { id } = await context.params;

  try {
    await mongoose.connect(connectionStr);
    const result = await foodSchema.findOne({ _id: id });

    return NextResponse.json({
      success: !!result,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        result: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  const { id } = await context.params;

  try {
    const payload = await request.json();
    await mongoose.connect(connectionStr);

    const result = await foodSchema.findOneAndUpdate(
      { _id: id },
      { $set: payload },
      { new: true }
    );

    return NextResponse.json({
      success: !!result,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        result: error.message,
      },
      { status: 500 }
    );
  }
}
