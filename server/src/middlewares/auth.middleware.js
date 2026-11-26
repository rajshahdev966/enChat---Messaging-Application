import { ApiError } from "../utils/ApiError.js"
import { verifyAccessToken } from "../utils/auth.util.js"
import { findActiveSession } from "../daos/auth.dao.js"

export const authentication = async (req, res, next) => {
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
        if (!req.auth.id || !req.auth.sid) throw new Error("Token has no active session ID")
        const session = await findActiveSession(req.auth.id)
        if (!session || session.activeSessionId !== req.auth.sid) {
            throw new ApiError({ statusCode: 401, code: "SESSION_REPLACED", message: "This session is no longer active." })
        }
        next()
    } catch (error) {
        if (error instanceof ApiError) return next(error)
        next(new ApiError({
            statusCode: 401,
            code: "INVALID_ACCESS_TOKEN",
            message: "Your session has expired.",
        }))
    }
}
