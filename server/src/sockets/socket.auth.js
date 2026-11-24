import { verifyAccessToken } from "../utils/auth.util.js"
import { toSocketErrorPayload } from "../middlewares/error.middleware.js"



export const authenticateSocket = (socket, next) => {

    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            const error = new Error("Authentication is required")
            error.data = toSocketErrorPayload({ code: "UNAUTHORIZED", message: error.message })
            return next(error)
        }

        const { id } = verifyAccessToken(token)

        if (!id) {
            const error = new Error("Invalid access token")
            error.data = toSocketErrorPayload({ code: "UNAUTHORIZED", message: error.message })
            return next(error)
        }

        socket.data.userId = id

        next()
    } catch (error) {
        const authError = new Error("Invalid or expired access token")
        authError.data = toSocketErrorPayload({ code: "UNAUTHORIZED", message: authError.message })
        next(authError)
    }
}
