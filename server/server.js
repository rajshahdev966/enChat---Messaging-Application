import app from "./src/app.js"
import {createServer} from "node:http"
import { env } from "./src/config/env.js"
import { connectDb } from "./src/db/connectDb.js"
import { initializeSocket } from "./src/sockets/socket.server.js"

const httpServer = createServer(app)

await connectDb()

initializeSocket(httpServer)

httpServer.listen(env.PORT, ()=> {
    console.log("Server is running on PORT:", env.PORT)
})