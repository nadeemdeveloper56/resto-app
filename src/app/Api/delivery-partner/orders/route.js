import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectionStr } from "@/app/_components/lib/db";
import { orderSchema } from "@/app/_components/lib/ordersModel";
import { verifyDeliveryPartnerSession } from "@/app/lib/deliveryPartnerSession";

export async function GET() {
  try {
    // Verify delivery partner login
    const cookieStore = await cookies();
    const token = cookieStore.get("deliveryPartnerSession")?.value;
    const partner = verifyDeliveryPartnerSession(token);

    if (!partner) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connectionStr);
    }

    // Find orders that have not been assigned to a delivery partner


    const orders = await orderSchema.collection
      .find({
        status: "Pending",
        $or: [
          { deliveryBoy_Id: null },
          { deliveryBoy_Id: { $exists: false } },
          { deliveryBoy_Id: "" },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();


    console.log("Available orders found:", orders.length);

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Delivery partner orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to fetch available orders.",
      },
      { status: 500 }
    );
  }
}