
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectionStr } from "@/app/_components/lib/db";
import { orderSchema } from "@/app/_components/lib/ordersModel";
import { verifyDeliveryPartnerSession } from "@/app/lib/deliveryPartnerSession";

export async function PATCH(request) {
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

    const { orderId, status } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    const allowedTransitions = {
      Accepted: "Out for Delivery",
      "Out for Delivery": "Delivered",
    };

    if (!Object.values(allowedTransitions).includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid delivery status." },
        { status: 400 }
      );
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connectionStr);
    }

    const previousStatus = Object.keys(allowedTransitions).find(
      (currentStatus) => allowedTransitions[currentStatus] === status
    );

    const order = await orderSchema.findOneAndUpdate(
      {
        _id: orderId,
        deliveryBoy_Id: new mongoose.Types.ObjectId(partner.id),
        status: previousStatus,
      },
      { $set: { status } },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found, or its status has already changed.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}.`,
      order,
    });
  } catch (error) {
    console.error("Update delivery status error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update order status." },
      { status: 500 }
    );
  }
}
