import mongoose from "mongoose";
import { env } from "../config/env.js";


export async function connectDb() {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("MongoDB is connected sucessfully")
    } catch (error) {
        throw new Error("Error in connecting with database")
    }

}