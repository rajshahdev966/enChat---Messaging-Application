import {config} from "dotenv"
config()

export const env = {
    ACCESS_SECRET_TOKEN: process.env.ACCESS_SECRET_TOKEN,
    REFRESH_SECRET_TOKEN: process.env.REFRESH_SECRET_TOKEN,
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    NODE_ENV: process.env.NODE_ENV || "development",
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
} 
