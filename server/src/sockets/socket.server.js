import { Server } from "socket.io"
import { env } from "../config/env.js"
import { registerSocketEvents } from "./socket.events.js"
import { authenticateSocket } from "./socket.auth.js"

let io

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    })

    io.use(authenticateSocket)
    io.on("connection", (socket) => {
        socket.join([`user:${socket.data.userId}`, `session:${socket.data.sessionId}`])
        registerSocketEvents(socket)
    })

    return io
}

export const disconnectSessionSockets = (sessionId) => {
    if (io && sessionId) io.in(`session:${sessionId}`).disconnectSockets(true)
}

export const getIO = () => {
    if (!io) throw new Error("Socket.IO has not been initialized.")
    return io
}
