import { connectionStr } from "@/app/_components/lib/db";
import { userSchema } from "@/app/_components/lib/userModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { useRouter } from "next/navigation";

export async function POST(request) {
  try {
    await mongoose.connect(connectionStr);

    const body = await request.json();
    const { name, email, phone, city, password, login } = body;

    if (login === true) {
      const user = await userSchema.findOne({ email: String(email).toLowerCase() });

      if (!user || user.password !== String(password)) {
        return NextResponse.json(
          { success: false, message: "Incorrect email or password" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Login successful",
        result: user,
      });
    }
    

    if (!name || !email || !phone || !city || !password) {
      return NextResponse.json(
        { success: false, message: "Please fill in all fields" },
        { status: 400 }
      );
    }

    const existingUser = await userSchema.findOne({
      email: String(email).toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    const newUser = await userSchema.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      city: String(city).trim(),
      password: String(password),
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      result: newUser,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}
