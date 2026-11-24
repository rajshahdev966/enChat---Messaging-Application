import { ApiError } from "../utils/ApiError.js"

const socketErrorDefaults = {
    UNAUTHORIZED: { status: 401, message: "Authentication is required." },
    INVALID_RECIPIENT: { status: 400, message: "Choose a valid recipient." },
    INVALID_MESSAGE: { status: 400, message: "Enter a valid message." },
    MESSAGE_TOO_LONG: { status: 413, message: "Messages must be 4,000 characters or fewer." },
    MESSAGE_NOT_ALLOWED: { status: 403, messsage: "You cannot message this user" },
    INVALID_MESSAGE_ID: { status: 400, message: "The message ID is invalid." },
    INVALID_CONVERSATION_ID: { status: 400, message: "The conversation ID is invalid." },
    CONVERSATION_NOT_FOUND: { status: 404, message: "Conversation not found." },
    FORBIDDEN: { status: 403, message: "You cannot access this conversation." },
    DUPLICATE_MESSAGE: { status: 409, message: "This message was already received." },
    VALIDATION_ERROR: { status: 400, message: "The message could not be processed." },
    INTERNAL_ERROR: { status: 500, message: "The message could not be sent. Please try again." },

}

const normalizeSocketError = (error = {}) => {
    let code = typeof error.code === "string" ? error.code : undefined

    if (!code && error.name === "CastError") {
        const path = String(error.path || "")
        code = /message|_id/i.test(path)
            ? "INVALID_MESSAGE_ID"
            : /conversation/i.test(path)
                ? "INVALID_CONVERSATION_ID"
                : "VALIDATION_ERROR"
    } else if (!code && error.name === "ValidationError") {
        const overlong = Object.values(error.errors || {}).some((item) => item.kind === "maxlength")
        code = overlong ? "MESSAGE_TOO_LONG" : "INVALID_MESSAGE"
    } else if (!code && error.code === 11000) {
        code = "DUPLICATE_MESSAGE"
    }

    if (!socketErrorDefaults[code]) code = "INTERNAL_ERROR"

    const fallback = socketErrorDefaults[code]
    
    return {
        code,
        status: error.status || error.statusCode || fallback.status,
        message: code === "INTERNAL_ERROR" ? fallback.message : (error.message || fallback.message),
        details: error.details,
    }
}

export const createSocketError = (code, message, details) =>
    Object.assign(new Error(message || socketErrorDefaults[code]?.message || "Socket event failed."), {
        code,
        ...(details ? { details } : {}),
    })

// Socket.IO acknowledgements use the same stable error envelope as API responses.
export const toSocketErrorPayload = (error) => {
    const normalized = normalizeSocketError(error)
    return {
        success: false,
        error: {
            code: normalized.code,
            status: normalized.status,
            message: normalized.message,
            ...(normalized.details ? { details: normalized.details } : {}),
        },
    }
}

export const socketErrorMiddleware = (error, acknowledge) => {
    const payload = toSocketErrorPayload(error)
    if (typeof acknowledge === "function") acknowledge(payload)
    if (payload.error.code === "INTERNAL_ERROR") console.error("Socket event failed:", error)
    return payload
}

// Wrap async event handlers so rejected promises are returned through their ack callback.
export const withSocketErrorHandling = (handler) => async (...args) => {
    const acknowledge = typeof args.at(-1) === "function" ? args.at(-1) : undefined
    try {
        await handler(...args)
    } catch (error) {
        socketErrorMiddleware(error, acknowledge)
    }
}

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
