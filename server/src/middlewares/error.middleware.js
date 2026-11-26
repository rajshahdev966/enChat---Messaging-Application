import { ApiError } from "../utils/ApiError.js"

const socketMessages = {
    AUTH_REQUIRED: "Authentication is required.",
    SESSION_REPLACED: "This session is no longer active.",
    INVALID_RECIPIENT: "Choose a valid recipient.",
    CONTACT_REQUIRED: "You must be approved contacts before messaging.",
    RELATIONSHIP_BLOCKED: "This relationship is unavailable.",
    INVALID_MESSAGE: "Enter a valid message.",
    MESSAGE_TOO_LONG: "Messages must be 4,000 characters or fewer.",
    INVALID_MESSAGE_ID: "The message ID is invalid.",
    MESSAGE_ID_REUSED: "This message ID has already been used.",
    INVALID_CONVERSATION_ID: "The conversation ID is invalid.",
    CONVERSATION_FORBIDDEN: "You cannot access this conversation.",
    INVALID_USER_ID: "Choose a valid user.",
    USER_NOT_FOUND: "This user could not be found.",
    CONTACT_REQUEST_PENDING: "Your request is already waiting for a response.",
    CONTACT_REQUEST_CLOSED: "This request cannot be sent again.",
    CONTACT_REQUEST_NOT_FOUND: "Contact request not found.",
    CONTACT_REQUEST_NOT_APPROVABLE: "This contact request cannot be approved.",
    CONTACT_REQUEST_NOT_REJECTABLE: "This contact request cannot be rejected.",
    CONTACT_REQUEST_NOT_CANCELLABLE: "This contact request cannot be cancelled.",
    CONTACT_NOT_APPROVED: "This contact is not approved.",
    PROFILE_NOT_DISCOVERABLE: "This user is not accepting new contact requests.",
    INTERNAL_ERROR: "The message could not be processed. Please try again.",
}

const socketErrorShape = (error = {}) => {
    let code = error.code
    if (error.name === "CastError") {
        code = /message/i.test(error.path || "") ? "INVALID_MESSAGE_ID" : "INVALID_RECIPIENT"
    } else if (error.name === "ValidationError") {
        code = Object.values(error.errors || {}).some((item) => item.kind === "maxlength")
            ? "MESSAGE_TOO_LONG"
            : "INVALID_MESSAGE"
    }
    if (!socketMessages[code]) code = "INTERNAL_ERROR"
    return {
        success: false,
        code,
        message: code === "INTERNAL_ERROR" ? socketMessages[code] : error.message || socketMessages[code],
        errors: error.errors || {},
    }
}

export const socketErrorMiddleware = (error, acknowledge, socket) => {
    const payload = socketErrorShape(error)
    if (typeof acknowledge === "function") acknowledge(payload)
    else socket?.emit("socket:error", payload)
    if (payload.code === "INTERNAL_ERROR") console.error("Socket event failed:", error)
    return payload
}

export const withSocketErrorHandling = (handler, socket) => async (...args) => {
    const acknowledge = typeof args.at(-1) === "function" ? args.at(-1) : undefined
    try {
        await handler(...args)
    } catch (error) {
        socketErrorMiddleware(error, acknowledge, socket)
    }
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
