
export class ApiError extends Error {
    constructor({ statusCode = 500, code = "API_ERROR", message, errors = {}, cause }) {
        super(message, cause ? { cause } : undefined)
        this.name = "ApiError"
        this.statusCode = statusCode
        this.code = code
        this.errors = errors

        Error.captureStackTrace?.(this, ApiError)
    }
}
