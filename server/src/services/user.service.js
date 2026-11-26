import mongoose from "mongoose"
import { findAcceptedContactUserIds, findContactPair } from "../daos/contact.dao.js"
import { findContactProfile, findDiscoveryCandidates, findPhotoOwnerByPath, findViewerInterests } from "../daos/user.dao.js"
import { findBlockBetween } from "../daos/block.dao.js"
import { generatePrivateImageUrl } from "./storage.service.js"
import { canViewField, serializeUserPreview } from "./profile-visibility.service.js"
import { ApiError } from "../utils/ApiError.js"

const unavailable = () => new ApiError({ statusCode: 404, code: "PROFILE_UNAVAILABLE", message: "This profile is not available." })

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const cursorDecode = (value) => {
    if (!value) return null
    try { return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) }
    catch { throw new ApiError({ statusCode: 400, code: "INVALID_CURSOR", message: "The pagination cursor is invalid." }) }
}
const cursorEncode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url")

export const getVisibleProfile = async (viewerId, targetId) => {
    if (!mongoose.Types.ObjectId.isValid(targetId)) throw unavailable()
    const target = await findContactProfile(targetId)
    if (!target) throw unavailable()
    const isSelf = String(viewerId) === String(targetId)
    const [blocked, relation] = isSelf ? [null, null] : await Promise.all([
        findBlockBetween(viewerId, targetId),
        findContactPair([String(viewerId), String(targetId)].sort().join(":"), viewerId, targetId),
    ])
    const isContact = relation?.status === "accepted"
    if (blocked || (!isSelf && !canViewField(target.profile?.profilePrivacyOption || "everyone", isContact))) throw unavailable()
    return { user: serializeUserPreview(target, isContact || isSelf), isSelf }
}

export const getVisiblePhotoUrl = async (viewerId, filePath) => {
    if (typeof filePath !== "string" || !filePath.startsWith("/enChat_dev/")) throw unavailable()
    const owner = await findPhotoOwnerByPath(filePath)
    if (!owner) throw unavailable()
    const isSelf = String(viewerId) === String(owner._id)
    const [blocked, relation] = isSelf ? [null, null] : await Promise.all([
        findBlockBetween(viewerId, owner._id),
        findContactPair([String(viewerId), String(owner._id)].sort().join(":"), viewerId, owner._id),
    ])
    const isContact = relation?.status === "accepted"
    const profile = owner.profile || {}
    if (blocked || (!isSelf && (
        !canViewField(profile.profilePrivacyOption || "everyone", isContact)
        || !canViewField(profile.profilePhoto?.profilePhotoPrivacyOption || "everyone", isContact)
    ))) throw unavailable()

    const imageUrl = generatePrivateImageUrl(filePath)
    if (!imageUrl) throw new ApiError({ statusCode: 502, code: "IMAGE_URL_GENERATION_FAILED", message: "The image could not be prepared right now." })
    return { imageUrl }
}

export const discoverPeople = async (viewerId, { query = "", sort = "recommended", limit, cursor }) => {
    if (typeof query !== "string" || query.length > 80) {
        throw new ApiError({ statusCode: 400, code: "INVALID_QUERY", message: "Search text must be 80 characters or fewer." })
    }
    const term = query.trim()
    const mode = sort === "alphabetical" ? "alphabetical" : "recommended"
    const parsedCursor = cursorDecode(cursor)
    const viewer = await findViewerInterests(viewerId)
    const acceptedIds = await findAcceptedContactUserIds(viewerId)
    const escaped = term ? escapeRegex(term) : null
    const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value)
    const validNumber = (value) => typeof value === "number" && Number.isFinite(value)
    if (parsedCursor && (typeof parsedCursor !== "object" || !validObjectId(parsedCursor.id)
        || (mode === "alphabetical" && typeof parsedCursor.nameSort !== "string")
        || (mode !== "alphabetical" && (!validNumber(parsedCursor.score)
            || (escaped && (!validNumber(parsedCursor.searchRank) || !validNumber(parsedCursor.searchQuality))))))) {
        throw new ApiError({ statusCode: 400, code: "INVALID_CURSOR", message: "The pagination cursor is invalid." })
    }
    const initialMatch = { _id: { $ne: new mongoose.Types.ObjectId(viewerId) }, "profile.profilePrivacyOption": { $in: ["everyone", null] } }
    if (escaped) initialMatch.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { "profile.userCaption": { $regex: escaped, $options: "i" } },
        { "profile.bio": { $regex: escaped, $options: "i" } },
    ]
    const stages = [
        { $match: initialMatch },
        { $lookup: {
            from: "blocks",
            let: { candidateId: "$_id", viewerId: { $literal: new mongoose.Types.ObjectId(viewerId) } },
            pipeline: [{ $match: { $expr: { $or: [
                { $and: [{ $eq: ["$blockerId", "$$viewerId"] }, { $eq: ["$blockedId", "$$candidateId"] }] },
                { $and: [{ $eq: ["$blockedId", "$$viewerId"] }, { $eq: ["$blockerId", "$$candidateId"] }] },
            ] } } }, { $project: { _id: 1 } }],
            as: "blockingRelations",
        } },
        { $match: { blockingRelations: { $eq: [] } } },
        { $lookup: {
            from: "contacts",
            let: { candidateId: "$_id", viewerId: { $literal: new mongoose.Types.ObjectId(viewerId) } },
            pipeline: [{ $match: { $expr: { $and: [
                { $in: ["$status", ["accepted", "pending", "rejected", "cancelled"]] },
                { $or: [
                    { $and: [{ $eq: ["$senderId", "$$viewerId"] }, { $eq: ["$receiverId", "$$candidateId"] }] },
                    { $and: [{ $eq: ["$receiverId", "$$viewerId"] }, { $eq: ["$senderId", "$$candidateId"] }] },
                ] },
            ] } } }, { $project: { _id: 1 } }],
            as: "existingRelations",
        } },
        { $match: { existingRelations: { $eq: [] } } },
        { $lookup: {
            from: "contacts",
            let: { candidateId: "$_id" },
            pipeline: [{ $match: { $expr: { $and: [
                { $eq: ["$status", "accepted"] },
                { $or: [{ $eq: ["$senderId", "$$candidateId"] }, { $eq: ["$receiverId", "$$candidateId"] }] },
            ] } } }, { $project: { senderId: 1, receiverId: 1 } }],
            as: "candidateContacts",
        } },
        { $set: {
            candidateContactIds: { $map: { input: "$candidateContacts", as: "relation", in: {
                $cond: [{ $eq: ["$$relation.senderId", "$_id"] }, "$$relation.receiverId", "$$relation.senderId"],
            } } },
            sharedInterestCount: { $size: { $setIntersection: [{ $ifNull: ["$profile.interests", []] }, { $literal: viewer?.profile?.interests || [] }] } },
        } },
        { $set: {
            mutualContactCount: { $size: { $setIntersection: ["$candidateContactIds", { $literal: acceptedIds }] } },
            nameSort: { $toLower: "$name" },
        } },
        { $set: { recommendationScore: { $add: [{ $multiply: ["$mutualContactCount", 30] }, { $multiply: ["$sharedInterestCount", 20] }, 10] } } },
    ]

    if (escaped) {
        stages.push(
            { $set: {
                searchRank: { $cond: [
                    { $regexMatch: { input: "$name", regex: escaped, options: "i" } }, 3,
                    { $cond: [{ $regexMatch: { input: { $ifNull: ["$profile.userCaption", ""] }, regex: escaped, options: "i" } }, 2, 1] },
                ] },
                searchQuality: { $cond: [{ $regexMatch: { input: "$name", regex: `^${escaped}`, options: "i" } }, 1, 0] },
            } },
        )
    }

    if (parsedCursor) {
        if (mode === "alphabetical") {
            stages.push({ $match: { $or: [
                { nameSort: { $gt: parsedCursor.nameSort } },
                { nameSort: parsedCursor.nameSort, _id: { $gt: new mongoose.Types.ObjectId(parsedCursor.id) } },
            ] } })
        } else if (escaped) {
            stages.push({ $match: { $or: [
                { searchRank: { $lt: parsedCursor.searchRank } },
                { searchRank: parsedCursor.searchRank, searchQuality: { $lt: parsedCursor.searchQuality } },
                { searchRank: parsedCursor.searchRank, searchQuality: parsedCursor.searchQuality, recommendationScore: { $lt: parsedCursor.score } },
                { searchRank: parsedCursor.searchRank, searchQuality: parsedCursor.searchQuality, recommendationScore: parsedCursor.score, _id: { $gt: new mongoose.Types.ObjectId(parsedCursor.id) } },
            ] } })
        } else {
            stages.push({ $match: { $or: [
                { recommendationScore: { $lt: parsedCursor.score } },
                { recommendationScore: parsedCursor.score, _id: { $gt: new mongoose.Types.ObjectId(parsedCursor.id) } },
            ] } })
        }
    }

    if (mode === "alphabetical") stages.push({ $sort: { nameSort: 1, _id: 1 } })
    else if (escaped) stages.push({ $sort: { searchRank: -1, searchQuality: -1, recommendationScore: -1, _id: 1 } })
    else stages.push({ $sort: { recommendationScore: -1, _id: 1 } })

    stages.push({ $limit: limit + 1 }, { $project: {
        _id: 1,
        name: 1,
        username: 1,
        profile: 1,
        recommendationScore: 1,
        searchRank: 1,
        searchQuality: 1,
        nameSort: 1,
        sharedInterestCount: 1,
    } })

    const rows = await findDiscoveryCandidates(stages)
    const hasMore = rows.length > limit
    const items = rows.slice(0, limit)
    const last = items.at(-1)
    const nextCursor = hasMore && last ? cursorEncode(mode === "alphabetical"
        ? { nameSort: last.nameSort, id: last._id.toString() }
        : { score: last.recommendationScore, searchRank: last.searchRank, searchQuality: last.searchQuality, id: last._id.toString() }) : null

    return {
        items: items.map((user) => ({
            ...serializeUserPreview(user, false),
            recommendationScore: user.recommendationScore,
            sharedInterestCount: user.sharedInterestCount,
        })),
        nextCursor,
    }
}
