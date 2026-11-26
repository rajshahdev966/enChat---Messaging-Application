import express from "express"
import authRoutes from "./routes/auth.routes.js"
import photoRoutes from "./routes/photo.routes.js"
import contactRoutes from "./routes/contact.routes.js"
import blockRoutes from "./routes/block.routes.js"
import conversationRoutes from "./routes/conversation.routes.js"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/ApiError.js"
import { errorMiddleware } from "./middlewares/error.middleware.js"
import { env } from "./config/env.js"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", env.CLIENT_URL)
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")

    if (req.method === "OPTIONS") return res.sendStatus(204)
    next()
})


app.use("/api/auth", authRoutes)
app.use("/api/user", photoRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/block", blockRoutes)
app.use("/api/conversation", conversationRoutes)

app.use((req, res, next) => {
    next(new ApiError({
        statusCode: 404,
        code: "ROUTE_NOT_FOUND",
        message: "Endpoint not found",
    }))
})

app.use(errorMiddleware)

export default app;
