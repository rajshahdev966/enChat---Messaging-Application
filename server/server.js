import app from "./src/app.js"
import {createServer} from "node:http"
import { env } from "./src/config/env.js"
import { connectDb } from "./src/db/connectDb.js"
import { initializeSocket } from "./src/sockets/socket.server.js"
import { connectRedis } from "./src/services/redis.service.js"
import { retryPhotoCleanup } from "./src/services/photo-cleanup.service.js"

const httpServer = createServer(app)

await connectDb()
await connectRedis()
await retryPhotoCleanup().catch((error) => console.error("Photo cleanup retry failed:", error.message))
setInterval(() => {
    retryPhotoCleanup().catch((error) => console.error("Photo cleanup retry failed:", error.message))
}, 60 * 60 * 1000).unref()

initializeSocket(httpServer)
httpServer.listen(env.PORT, ()=> {
    console.log("Server is running on PORT:", env.PORT)
})
