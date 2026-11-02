
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

    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(connectionStr, {
            dbName: "RestoApp",
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
    }

    try {
        cached.conn = await cached.promise;

        console.log(
            "CONNECTED DATABASE:",
            mongoose.connection.name
        );

        return cached.conn;
    } catch (error) {
        cached.promise = null;
        cached.conn = null;
        console.error("DATABASE ERROR:", error.message);
        throw error;
    }
}
