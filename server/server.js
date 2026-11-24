import app from "./src/app.js"
import {createServer} from "node:http"
import { env } from "./src/config/env.js"
import { connectDb } from "./src/db/connectDb.js"

const httpServer = createServer(app)

await connectDb()

httpServer.listen(env.PORT, ()=> {
    console.log("Server is running on PORT:", env.PORT)
})