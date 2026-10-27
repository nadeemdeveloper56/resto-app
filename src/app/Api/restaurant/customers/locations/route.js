
import { restaurantSchema } from '@/app/_components/lib/restaurantModel';
import { connectionStr } from '@/app/_components/lib/db';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await mongoose.connect(connectionStr);

        const restaurants = await restaurantSchema.find();

        let result = restaurants
            .map((item) => item.city)
            .filter((city) => typeof city === 'string' && city.trim() !== '')
            .map((city) => city.trim().charAt(0).toUpperCase() + city.trim().slice(1));

        result = [...new Set(result)];

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.log('Location API Error:', error.message);

        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
