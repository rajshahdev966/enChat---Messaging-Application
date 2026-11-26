import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"

export const cursorPagination = ({ defaultLimit = 20, maxLimit = 50, validateCursor = true } = {}) => (req, _res, next) => {
    const requested = req.query.limit === undefined ? defaultLimit : Number(req.query.limit)
    const cursor = req.query.cursor || null
    if (!Number.isInteger(requested) || requested < 1 || requested > maxLimit) {
        return next(new ApiError({ statusCode: 400, code: "INVALID_LIMIT", message: `Limit must be between 1 and ${maxLimit}.` }))
    }
    if (cursor && (cursor.length > 1200 || (validateCursor && !mongoose.Types.ObjectId.isValid(cursor)))) {
        return next(new ApiError({ statusCode: 400, code: "INVALID_CURSOR", message: "The pagination cursor is invalid." }))
    }
    req.pagination = { limit: requested, cursor }
    next()
}
