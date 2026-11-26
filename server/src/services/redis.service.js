import { createClient } from "redis"
import { env } from "../config/env.js"

let client
let connection
let retryAfter = 0

const getClient = async () => {
    if (!env.REDIS_URL || Date.now() < retryAfter) return null

    if (!client) {
        client = createClient({
            url: env.REDIS_URL,
            socket: {
                connectTimeout: 1500,
                reconnectStrategy: (retries) => retries > 1 ? false : 250,
            },
        })
        client.on("error", (error) => {
            retryAfter = Date.now() + 5000
            console.warn("Redis unavailable; using MongoDB until Redis reconnects.", error.message)
        })
    }

    if (client.isReady) return client
    if (!connection) {
        connection = client.connect()
            .catch((error) => {
                retryAfter = Date.now() + 5000
                console.warn("Redis connection failed; using MongoDB for contact lists.", error.message)
                return null
            })
            .finally(() => { connection = null })
    }

    await connection
    return client.isReady ? client : null
}

export const connectRedis = async () => {
    if (!env.REDIS_URL) {
        console.info("REDIS_URL is not set; contact caching is disabled.")
        return false
    }
    const redis = await getClient()
    if (redis) console.info("Redis cache is connected.")
    return Boolean(redis)
}

export const cacheGet = async (key) => {
    try {
        const redis = await getClient()
        const value = redis && await redis.get(key)
        return value ? JSON.parse(value) : null
    } catch {
        return null
    }
}

export const cacheSet = async (key, value, ttl = env.CONTACT_CACHE_TTL_SECONDS) => {
    try {
        const redis = await getClient()
        if (redis) await redis.set(key, JSON.stringify(value), { EX: ttl })
    } catch {
        // The caller has already received the MongoDB result; caching is best effort.
    }
}

export const invalidateContactCache = async (userIds) => {
    try {
        const redis = await getClient()
        if (redis) {
            const ids = [...new Set(userIds.map(String))]
            if (ids.length) {
                const transaction = redis.multi()
                ids.forEach((id) => transaction.incr(`contacts:version:${id}`))
                await transaction.exec()
            }
        }
    } catch {
        // Contact state is always read from MongoDB after a cache miss; entries expire quickly.
    }
}

export const getContactCacheVersion = async (userId) => {
    try {
        const redis = await getClient()
        return redis ? (await redis.get(`contacts:version:${userId}`)) || "0" : null
    } catch {
        return null
    }
}
