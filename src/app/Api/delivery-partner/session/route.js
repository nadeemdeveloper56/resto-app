
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectionStr } from "@/app/_components/lib/db";
import DeliveryPartner from "@/app/lib/DeliveryPartnerModel";
import { verifyDeliveryPartnerSession } from "@/app/lib/deliveryPartnerSession";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("deliveryPartnerSession")?.value;
    const session = verifyDeliveryPartnerSession(token);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(session.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid partner session." },
        { status: 401 }
      );
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connectionStr);
    }

    const partner = await DeliveryPartner.findById(session.id)
      .select("fullName email phone city")
      .lean();

    if (!partner) {
      return NextResponse.json(
        { success: false, message: "Delivery partner not found." },
        { status: 404 }
      );
    }

    if (!partner.city?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Your city is missing. Please update your profile.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      partner: {
        id: partner._id.toString(),
        _id: partner._id.toString(),
        fullName: partner.fullName,
        email: partner.email,
        phone: partner.phone,
        city: partner.city.trim(),
      },
    });
  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to verify session." },
      { status: 500 }
    );
  }
}
