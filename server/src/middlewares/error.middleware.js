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
        const uploadErrors = {
            LIMIT_FILE_SIZE: {
                statusCode: 413,
                code: "FILE_TOO_LARGE",
                message: "Profile photo must be 500 KB or smaller.",
                fieldMessage: "Maximum file size is 500 KB.",
            },
            LIMIT_FILE_COUNT: {
                statusCode: 400,
                code: "TOO_MANY_FILES",
                message: "Upload one profile photo at a time.",
                fieldMessage: "Only one profile photo can be uploaded.",
            },
            LIMIT_UNEXPECTED_FILE: {
                statusCode: 400,
                code: "UNEXPECTED_FILE_FIELD",
                message: "The photo must be sent in the profilePhoto field.",
                fieldMessage: "Choose one profile photo and try again.",
            },
            LIMIT_FIELD_COUNT: {
                statusCode: 400,
                code: "TOO_MANY_FIELDS",
                message: "The profile form contains too many fields.",
                fieldMessage: "Reload the form and try again.",
            },
            LIMIT_PART_COUNT: {
                statusCode: 400,
                code: "TOO_MANY_UPLOAD_PARTS",
                message: "The profile upload contains too many parts.",
                fieldMessage: "Reload the form and try again.",
            },
        }
        const uploadError = uploadErrors[err.code]
        if (err instanceof ApiError) {
            return res.status(err.statusCode).json({
                success: false,
                code: err.code,
                message: err.message,
                errors: err.errors,
            })
        }
        return res.status(uploadError?.statusCode || (err.statusCode === 413 ? 413 : 400)).json({
            success: false,
            code: uploadError?.code || "INVALID_UPLOAD",
            message: uploadError?.message || "Upload one valid profile photo.",
            errors: { profilePhoto: uploadError?.fieldMessage || "Invalid file upload." },
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
