import photoCleanupModel from "../models/photoCleanup.model.js"
import { deleteFileByPath } from "./storage.service.js"

export const queuePhotoCleanup = async (filePath) => {
    if (!filePath) return
    await photoCleanupModel.updateOne({ filePath }, { $setOnInsert: { filePath } }, { upsert: true })
}

export const retryPhotoCleanup = async (limit = 20) => {
    const jobs = await photoCleanupModel.find().sort({ updatedAt: 1 }).limit(limit).lean()
    for (const job of jobs) {
        try {
            await deleteFileByPath(job.filePath)
            await photoCleanupModel.deleteOne({ _id: job._id })
        } catch (error) {
            await photoCleanupModel.updateOne({ _id: job._id }, {
                $inc: { attempts: 1 },
                $set: { lastError: error.message.slice(0, 300) },
            })
        }
    }
}
