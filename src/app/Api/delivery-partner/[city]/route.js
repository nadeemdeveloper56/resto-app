
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectionStr } from "@/app/_components/lib/db";
import { orderSchema } from "@/app/_components/lib/ordersModel";
import DeliveryPartner from "@/app/lib/DeliveryPartnerModel";
import { verifyDeliveryPartnerSession } from "@/app/lib/deliveryPartnerSession";

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return;
  }

  await mongoose.connect(connectionStr);
}

export async function GET(request, { params }) {
  try {
    // 1. Verify delivery partner session
    const cookieStore = await cookies();
    const token = cookieStore.get("deliveryPartnerSession")?.value;
    const session = verifyDeliveryPartnerSession(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        { status: 401 }
      );
    }

    // 2. Read city from URL
    const { city } = await params;
    const requestedCity = decodeURIComponent(city || "").trim();

    if (!requestedCity) {
      return NextResponse.json(
        {
          success: false,
          message: "City is required.",
        },
        { status: 400 }
      );
    }

    // 3. Validate partner ID
    if (!mongoose.Types.ObjectId.isValid(session.id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid partner session.",
        },
        { status: 401 }
      );
    }

    // 4. Connect to MongoDB
    await connectDB();

    // 5. Get logged-in partner's city
    const partner = await DeliveryPartner.findById(session.id)
      .select("city")
      .lean();

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery partner not found.",
        },
        { status: 404 }
      );
    }

    if (
      typeof partner.city !== "string" ||
      !partner.city.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please add your city to your delivery partner profile.",
        },
        { status: 400 }
      );
    }

    // 6. Allow only the partner's own city
    const partnerCity = partner.city.trim();

    if (
      requestedCity.toLowerCase() !==
      partnerCity.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only view orders from your assigned city.",
        },
        { status: 403 }
      );
    }

    // 7. Escape special regex characters
    const escapedCity = partnerCity.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // 8. Match both "Okara" and "Okara, Pakistan"
    const cityPattern =
      `^${escapedCity}(,\\s*Pakistan)?$`;

    // 9. Get unassigned pending orders from this city
    const orders = await orderSchema.collection
      .find({
        status: "Pending",
        "customer.city": {
          $regex: cityPattern,
          $options: "i",
        },
        $or: [
          { deliveryBoy_Id: null },
          { deliveryBoy_Id: { $exists: false } },
          { deliveryBoy_Id: "" },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      city: partnerCity,
      orders,
    });
  } catch (error) {
    console.error("City orders API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch city orders.",
      },
      { status: 500 }
    );
  }
}
