import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import crypto from "node:crypto"

export const generateTokens = (id, username, sessionId) => {
    const accessToken = jwt.sign({ id, username, sid: sessionId }, env.ACCESS_SECRET_TOKEN, { expiresIn: "15m" })

    const refreshToken = jwt.sign({ id, username, sid: sessionId }, env.REFRESH_SECRET_TOKEN, { expiresIn: "7d" })

    return {accessToken, refreshToken}
}

export const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex")

export const createPasswordResetCode = () =>
    crypto.randomInt(100000, 1000000).toString()


export const verifyAccessToken = (token)=> {
    const decoded = jwt.verify(token, env.ACCESS_SECRET_TOKEN)

    return decoded;
}

export const verifyRefreshToken = (token)=> {
    const decoded = jwt.verify(token, env.REFRESH_SECRET_TOKEN)

    return decoded;
}
