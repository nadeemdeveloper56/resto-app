
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectionStr } from "@/app/_components/lib/db";
import { orderSchema } from "@/app/_components/lib/ordersModel";
import { verifyDeliveryPartnerSession } from "@/app/lib/deliveryPartnerSession";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("deliveryPartnerSession")?.value;
    const partner = verifyDeliveryPartnerSession(token);

    if (!partner || !mongoose.Types.ObjectId.isValid(partner.id)) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connectionStr);
    }

    // Only one partner can accept an unassigned order.
    const order = await orderSchema.findOneAndUpdate(
      {
        _id: orderId,
        $or: [
          { deliveryBoy_Id: null },
          { deliveryBoy_Id: { $exists: false } },
        ],
      },
      {
        $set: {
          deliveryBoy_Id: new mongoose.Types.ObjectId(partner.id),
          status: "Accepted",
        },
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "This order has already been accepted or does not exist.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order accepted successfully!",
      order,
    });
  } catch (error) {
    console.error("Accept order error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to accept this order." },
      { status: 500 }
    );
  }
}
