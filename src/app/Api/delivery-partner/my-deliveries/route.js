
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectionStr } from "@/app/_components/lib/db";
import { orderSchema } from "@/app/_components/lib/ordersModel";
import { verifyDeliveryPartnerSession } from "@/app/lib/deliveryPartnerSession";

export async function GET() {
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

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connectionStr);
    }

    const deliveries = await orderSchema
      .find({
        deliveryBoy_Id: new mongoose.Types.ObjectId(partner.id),
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      deliveries,
    });
  } catch (error) {
    console.error("My deliveries error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch your deliveries.",
      },
      { status: 500 }
    );
  }
}
