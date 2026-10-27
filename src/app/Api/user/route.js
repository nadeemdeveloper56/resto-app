
import { connectionStr } from "@/app/_components/lib/db";
import { userSchema } from "@/app/_components/lib/userModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    if (!connectionStr) {
      throw new Error("MONGODB_URI is not loaded.");
    }

    await mongoose.connect(connectionStr);

    console.log("MongoDB connected successfully");

    const body = await request.json();
    const { name, email, phone, city, password, login } = body;

    if (login === true) {
      const user = await userSchema.findOne({
        email: String(email).trim().toLowerCase(),
      });

      if (!user || user.password !== String(password)) {
        return NextResponse.json(
          {
            success: false,
            message: "Incorrect email or password",
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Login successful",
        result: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
        },
      });
    }

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !city?.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all fields",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userSchema.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 }
      );
    }

    const newUser = await userSchema.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      city: city.trim(),
      password: String(password),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        result: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          city: newUser.city,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}
