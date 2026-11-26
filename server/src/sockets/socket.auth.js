import { findActiveSession } from "../daos/auth.dao.js"
import { verifyAccessToken } from "../utils/auth.util.js"

export const authenticateSocket = async (socket, next) => {
    const authorization = socket.handshake.headers.authorization || ""
    const token = socket.handshake.auth?.accessToken
        || socket.handshake.auth?.token
        || (authorization.startsWith("Bearer ") ? authorization.slice(7) : null)

    if (!token) {
        const error = new Error("Authentication is required.")
        error.data = { code: "AUTH_REQUIRED" }
        return next(error)
    }

    try {
        const claims = verifyAccessToken(token)
        if (!claims.id || !claims.sid) throw new Error("Invalid session token")
        const session = await findActiveSession(claims.id)
        if (!session || session.activeSessionId !== claims.sid) {
            const error = new Error("This session is no longer active.")
            error.data = { code: "SESSION_REPLACED" }
            return next(error)
        }
        socket.data.userId = claims.id
        socket.data.sessionId = claims.sid
        next()
    } catch (cause) {
        if (cause?.data?.code) return next(cause)
        const error = new Error("Invalid or expired access token.")
        error.data = { code: "INVALID_ACCESS_TOKEN" }
        next(error)
    }
}
