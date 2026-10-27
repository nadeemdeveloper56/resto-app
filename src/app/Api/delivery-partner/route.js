
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionStr } from "@/app/_components/lib/db";
import DeliveryPartner from "@/app/lib/DeliveryPartnerModel";

export async function POST(request) {
  try {
    const body = await request.json();

    const { fullName, email, phone, city, password } = body;

    // Check required fields
    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !city?.trim() ||
      !password
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connectionStr);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether email is already registered
    const existingPartner = await DeliveryPartner.findOne({
      email: normalizedEmail,
    });

    if (existingPartner) {
      return NextResponse.json(
        { success: false, message: "This email is already registered." },
        { status: 409 }
      );
    }

    // Save new delivery partner with city
    const partner = await DeliveryPartner.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      city: city.trim(),
      password,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Delivery partner registered successfully.",
        partner: {
          _id: partner._id,
          fullName: partner.fullName,
          email: partner.email,
          phone: partner.phone,
          city: partner.city,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Delivery partner signup error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "This email is already registered." },
        { status: 409 }
      );
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, message: "Please check the registration details." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
