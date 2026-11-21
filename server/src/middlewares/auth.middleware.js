import { ApiError } from "../utils/ApiError.js"
import { verifyAccessToken } from "../utils/auth.util.js"

export const authentication = (req, res, next) => {
    const authorization = req.get("authorization")
    const token = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null

    if (!token) {
        return next(new ApiError({
            statusCode: 401,
            code: "AUTH_REQUIRED",
            message: "Authentication is required.",
        }))
    }

    try {
        req.auth = verifyAccessToken(token)
        next()
    } catch {
        next(new ApiError({
            statusCode: 401,
            code: "INVALID_ACCESS_TOKEN",
            message: "Your session has expired.",
        }))
    }
}
