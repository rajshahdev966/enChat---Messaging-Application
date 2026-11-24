import { Server } from "socket.io"
import { env } from "../config/env.js"
import { authenticateSocket } from "./socket.auth.js"
import { socketErrorMiddleware } from "../middlewares/error.middleware.js"


let io;

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    })



    io.use(authenticateSocket)


    io.on("connection", (socket) => {
        const userId = socket?.data.userId
        socket.join(`user:${userId}`)

        socket.on("error", (error) => socketErrorMiddleware(error))

        socket.on("disconnect", () => {
            // Socket.IO owns connection cleanup; no per-user state is persisted here yet.
        })
    })

    return io
}


export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
}
