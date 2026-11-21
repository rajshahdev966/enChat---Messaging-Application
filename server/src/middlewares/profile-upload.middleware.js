import multer from "multer"
import { ApiError } from "../utils/ApiError.js"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024, files: 1, fields: 3, parts: 4 },
    fileFilter: (_req, file, callback) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            return callback(new ApiError({
                statusCode: 415,
                code: "UNSUPPORTED_IMAGE_TYPE",
                message: "Choose a JPG, PNG, or WebP profile photo.",
                errors: { profilePhoto: "Supported formats: JPG, PNG, WebP." },
            }))
        }
        callback(null, true)
    },
}).single("profilePhoto")

export const uploadProfilePhoto = (req, res, next) => upload(req, res, (error) => {
    if (error) return next(error)
    next()
})
