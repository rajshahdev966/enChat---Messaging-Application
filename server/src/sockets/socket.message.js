import { sendDirectMessage as sendMessage } from "../services/conversation.service.js"
import { getIO } from "./socket.server.js"

export const sendDirectMessage = async (socket, payload) => {
    const data = await sendMessage(socket.data.userId, payload)
    if (!data.duplicate) {
        getIO().to(`user:${payload.recipientId}`).emit("message:new", { success: true, data })
    }
    return data
}
