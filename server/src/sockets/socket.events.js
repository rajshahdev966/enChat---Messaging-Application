import { sendDirectMessage } from "./socket.message"



const userRoom = (userId) => `user:${userId}`



export const registerMessageHandler = (io, socket) => {


    // Sending messages
    socket.on("message:send", async (payload, ack) => {
        const reply = typeof ack === "function" ? ack : () => { }

        try {
            const { recipientId, message, clientMessageId } = payload

            const response = await sendDirectMessage({
                senderId: socket.data.userId,
                recipientId,
                message,
                clientMessageId
            })

            const messageData = {
                _id: response.message._id.toString(),
                message: response.message.message,
                createdAt: response.message.createdAt,
                clientMessageId: response.message.clientMessageId,
                senderId: response.message.senderId,
                conversationId: response.message.conversationId,

            }

            io.on(userRoom(socket.data.userId))
                .on(userRoom(response.recipientId))
                .emit("message:new", messageData)

            reply({
                succcess: true,
                data: {
                    message: messageData,
                    conversationId: result.conversation._id,
                },

            })



        } catch (error) {
            console.error("message:send failed:", error);
            reply({
                success: false,
                // Add error handling here
            })
        }
    })
}