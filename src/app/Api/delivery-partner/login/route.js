
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectionStr } from "@/app/_components/lib/db";
import DeliveryPartner from "@/app/lib/DeliveryPartnerModel";
import { createDeliveryPartnerSession } from "@/app/lib/deliveryPartnerSession";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { success: false, message: "Please enter your email and password." },
        { status: 400 }
      );
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connectionStr);
    }

    const partner = await DeliveryPartner.findOne({

      email: email.trim().toLowerCase(),
    });
    console.log("Partner ID:", partner?._id?.toString());
    console.log("Partner city:", partner?.city);
    console.log("Partner object:", partner?.toObject());
    console.log("Schema fields:", Object.keys(DeliveryPartner.schema.paths));
    console.log("Database name:", mongoose.connection.name);

    if (!partner || !(await bcrypt.compare(password, partner.password))) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!partner.city?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Your city is missing. Please update your delivery partner profile.",
        },
        { status: 400 }
      );
    }

    const token = createDeliveryPartnerSession(partner);

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      partner: {
        _id: partner._id.toString(),
        fullName: partner.fullName,
        email: partner.email,
        phone: partner.phone,
        city: partner.city,
      },
    });

    response.cookies.set("deliveryPartnerSession", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Delivery partner login error:", error);

    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
