import { withSocketErrorHandling } from "../middlewares/error.middleware.js"
import { sendDirectMessage } from "./socket.message.js"
import { assertConversationMembership, startDirectConversation } from "./socket.conversation.js"

export const registerSocketEvents = (socket) => {
    socket.on("conversation:open", withSocketErrorHandling(async (payload, acknowledge) => {
        const data = await startDirectConversation(socket.data.userId, payload?.recipientId)
        if (typeof acknowledge === "function") acknowledge({ success: true, data })
    }, socket))

    socket.on("conversation:join", withSocketErrorHandling(async (payload, acknowledge) => {
        await assertConversationMembership(socket.data.userId, payload?.conversationId)
        socket.join(`conversation:${payload.conversationId}`)
        if (typeof acknowledge === "function") acknowledge({ success: true })
    }, socket))

    socket.on("message:send", withSocketErrorHandling(async (payload, acknowledge) => {
        const data = await sendDirectMessage(socket, payload)
        if (typeof acknowledge === "function") acknowledge({ success: true, data })
    }, socket))
}
