import mongoose from "mongoose"

const photoCleanupSchema = new mongoose.Schema({
    filePath: { type: String, required: true, unique: true },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
}, { timestamps: true })

export default mongoose.model("photoCleanups", photoCleanupSchema)
