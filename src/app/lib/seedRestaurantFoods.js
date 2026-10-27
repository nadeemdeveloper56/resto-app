
import mongoose from "mongoose";
import { foodSchema } from "@/app/_components/lib/FoodsModel";
import defaultFoodItems from "./defaultFoodItems";

export async function seedRestaurantFoods(resto_id) {
    try {
        const restaurantId = new mongoose.Types.ObjectId(
            resto_id.toString()
        );

        // Names jo default list mein maujood hain
        const defaultNames = defaultFoodItems.map((food) =>
            food.name.toLowerCase()
        );

        // Sirf is restaurant ke extra default items delete karo.
        // Manually added foods ko preserve karne ke liye
        // unhein delete nahi karte.
        const existingFoods = await foodSchema.find({
            resto_id: restaurantId
        });

        const defaultNameSet = new Set(defaultNames);

        const extraDefaultFoods = existingFoods.filter((food) =>
            food.description &&
            (
                food.name.toLowerCase().includes("burger") ||
                food.name.toLowerCase().includes("pizza")
            ) &&
            !defaultNameSet.has(food.name.toLowerCase())
        );

        if (extraDefaultFoods.length > 0) {
            await foodSchema.deleteMany({
                _id: {
                    $in: extraDefaultFoods.map((food) => food._id)
                },
                resto_id: restaurantId
            });
        }

        const existingNames = new Set(
            existingFoods
                .filter((food) => defaultNameSet.has(food.name.toLowerCase()))
                .map((food) => food.name.toLowerCase())
        );

        const newFoods = defaultFoodItems
            .filter((food) => !existingNames.has(food.name.toLowerCase()))
            .map((food) => ({
                ...food,
                resto_id: restaurantId
            }));

        if (newFoods.length > 0) {
            await foodSchema.insertMany(newFoods);
        }

        return {
            success: true,
            added: newFoods.length,
            message: `${newFoods.length} default foods added`
        };
    } catch (error) {
        console.error("SEED FOOD ERROR:", error);
        throw error;
    }
}
