
import mongoose from "mongoose";

export const connectionStr = process.env.MONGODB_URI;

let cached = globalThis.mongoose;

if (!cached) {
    cached = globalThis.mongoose = {
        conn: null,
        promise: null,
    };
}

export async function connectDB() {
    if (!connectionStr) {
        throw new Error("MONGODB_URI is not configured");
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(connectionStr, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}
