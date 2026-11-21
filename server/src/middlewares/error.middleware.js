import { ApiError } from "../utils/ApiError.js"


export const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message,
            errors: err.errors
        })
    }

    if (err.code === 11000) {

        const errors = {};

        const allowedFields = ["email", "username"];

        for (const field of allowedFields) {

            if (err.keyPattern?.[field]) {
                errors[field] = `${field} is already registered.`;
            }

        }

        return res.status(409).json({
            success: false,
            code: "DUPLICATE_VALUE",
            message: "The provided details are already in use.",
            errors
        });

    }

    if (err.name === "MulterError" || err.statusCode === 413 || err.statusCode === 415) {
        const tooLarge = err.code === "LIMIT_FILE_SIZE" || err.statusCode === 413
        if (err instanceof ApiError) {
            return res.status(err.statusCode).json({
                success: false,
                code: err.code,
                message: err.message,
                errors: err.errors,
            })
        }
        return res.status(tooLarge ? 413 : 400).json({
            success: false,
            code: tooLarge ? "FILE_TOO_LARGE" : "INVALID_UPLOAD",
            message: tooLarge ? "Profile photo must be 500 KB or smaller." : "Upload one valid profile photo.",
            errors: { profilePhoto: tooLarge ? "Maximum file size is 500 KB." : "Invalid file upload." },
        })
    }

    console.error("Unexpected error:", err);

    return res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
        errors: {}
    });
}
