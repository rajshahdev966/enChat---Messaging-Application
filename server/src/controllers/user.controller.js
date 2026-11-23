import { generatePrivateImageUrl } from "../services/storage.service.js"
import { ApiError } from "../utils/ApiError.js"

export const getSignedPhotoUrl = (req, res) => {
    const { filePath } = req.query
    if (typeof filePath !== "string" || !filePath.startsWith("/enChat_dev/")) {
        throw new ApiError({
            statusCode: 400,
            code: "INVALID_IMAGE_PATH",
            message: "A valid profile image path is required.",
            errors: { filePath: "Choose a valid image." },
        })
    }

    let imageUrl
    try {
        imageUrl = generatePrivateImageUrl(filePath)
        // ImageKit's helper returns an empty string (instead of throwing) when
        // its endpoint or source path is invalid. Do not report that as success.
        if (typeof imageUrl !== "string" || !imageUrl.startsWith("https://")) {
            throw new Error("ImageKit did not produce a valid signed URL.")
        }
    } catch (error) {
        throw new ApiError({
            statusCode: 502,
            code: "IMAGE_URL_GENERATION_FAILED",
            message: "The image could not be prepared right now.",
            cause: error,
        })
    }


    return res.status(200).json({ success: true, data: { imageUrl } })
}
