
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionStr } from "@/app/_components/lib/db";
import { orderSchema } from "@/app/_components/lib/ordersModel";

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(connectionStr);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, customer, items } = body;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !customer?.email ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Order details are incomplete." },
        { status: 400 }
      );
    }

    await connectDB();

    const amount = items.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    const firstRestaurantId =
      items[0].resto_id || items[0].resto_Id;

    const restoId =
      firstRestaurantId &&
      mongoose.Types.ObjectId.isValid(firstRestaurantId)
        ? new mongoose.Types.ObjectId(firstRestaurantId)
        : null;

    const order = await orderSchema.create({
      user_Id: new mongoose.Types.ObjectId(userId),
      email: customer.email,
      resto_Id: restoId,
      deliveryBoy_Id: null,
      status: "Pending",
      amount,
      customer: {
        name: customer.name || "",
        phone: customer.phone || "",
        city: customer.city || "",
      },
      items: items.map((item) => ({
        food_Id: String(item._id || item.food_Id || ""),
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        img_path: item.img_path || "",
      })),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully!",
        result: { _id: order._id },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Place order API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to save order.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Valid user ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const orders = await orderSchema
      .find({ user_Id: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch orders API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch orders." },
      { status: 500 }
    );
  }
}
