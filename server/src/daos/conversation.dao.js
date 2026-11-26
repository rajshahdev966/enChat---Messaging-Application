import mongoose from "mongoose"
import conversationMemberModel from "../models/conversationMember.model.js"
import conversationsModel from "../models/conversation.model.js"
import messageModel from "../models/message.model.js"
import contactModel from "../models/contact.model.js"
import blockModel from "../models/block.model.js"
import { ApiError } from "../utils/ApiError.js"

export const findDirectConversation = (directKey) => conversationsModel.findOne({ directKey })
    .select("_id type participants lastMessageId updatedAt")
    .lean()

export const findConversationById = (conversationId) => conversationsModel.findById(conversationId)
    .select("_id type participants lastMessageId updatedAt")
    .populate("participants", "name username profile")
    .populate("lastMessageId", "message senderId createdAt")
    .lean()

export const createDirectConversation = (directKey, participants) => conversationsModel.create({
    type: "direct",
    directKey,
    participants,
})

export const ensureConversationMembers = (conversationId, userIds) => conversationMemberModel.bulkWrite(
    userIds.map((userId) => ({
        updateOne: {
            filter: { conversationId, userId },
            update: { $setOnInsert: { conversationId, userId } },
            upsert: true,
        },
    })),
    { ordered: false },
)

export const findConversationMember = (conversationId, userId) =>
    conversationMemberModel.findOne({ conversationId, userId }).select("_id isMuted lastReadMessageId").lean()

export const listConversationMembers = async (userId, type, { limit, cursor }) => {
    const viewerId = new mongoose.Types.ObjectId(userId)
    const match = { userId: viewerId }
    if (cursor) {
        let decoded
        try { decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) }
        catch { throw new ApiError({ statusCode: 400, code: "INVALID_CURSOR", message: "The pagination cursor is invalid." }) }
        const at = new Date(decoded.at)
        if (!decoded || !mongoose.Types.ObjectId.isValid(decoded.id) || Number.isNaN(at.valueOf())) {
            throw new ApiError({ statusCode: 400, code: "INVALID_CURSOR", message: "The pagination cursor is invalid." })
        }
        match.$or = [
            { updatedAt: { $lt: at } },
            { updatedAt: at, _id: { $lt: new mongoose.Types.ObjectId(decoded.id) } },
        ]
    }
    const stages = [
        { $match: match },
        { $lookup: { from: "conversations", localField: "conversationId", foreignField: "_id", as: "conversation" } },
        { $unwind: "$conversation" },
        ...(type ? [{ $match: { "conversation.type": type } }] : []),
        { $sort: { updatedAt: -1, _id: -1 } },
        { $limit: limit + 1 },
        { $lookup: { from: "messages", localField: "lastReadMessageId", foreignField: "_id", as: "readMarker" } },
        { $set: {
            readAt: { $arrayElemAt: ["$readMarker.createdAt", 0] },
            readId: { $arrayElemAt: ["$readMarker._id", 0] },
        } },
        { $lookup: {
            from: "messages",
            let: { conversationId: "$conversationId", readAt: "$readAt", readId: "$readId", viewerId: { $literal: viewerId } },
            pipeline: [
                { $match: { $expr: { $and: [
                    { $eq: ["$conversationId", "$$conversationId"] },
                    { $ne: ["$senderId", "$$viewerId"] },
                    { $or: [
                        { $eq: ["$$readAt", null] },
                        { $gt: ["$createdAt", "$$readAt"] },
                        { $and: [{ $eq: ["$createdAt", "$$readAt"] }, { $gt: ["$_id", "$$readId"] }] },
                    ] },
                ] } } },
                { $count: "count" },
            ],
            as: "unread",
        } },
        { $lookup: { from: "users", localField: "conversation.participants", foreignField: "_id", as: "participants" } },
        { $lookup: { from: "messages", localField: "conversation.lastMessageId", foreignField: "_id", as: "lastMessage" } },
        { $project: {
            _id: 1,
            isMuted: 1,
            updatedAt: 1,
            unreadCount: { $ifNull: [{ $arrayElemAt: ["$unread.count", 0] }, 0] },
            conversationId: {
                _id: "$conversation._id",
                type: "$conversation.type",
                participants: "$participants",
                lastMessageId: { $arrayElemAt: ["$lastMessage", 0] },
            },
        } },
    ]
    const rows = await conversationMemberModel.aggregate(stages)
    const hasMore = rows.length > limit
    const items = rows.slice(0, limit)
    const last = items.at(-1)
    const nextCursor = hasMore && last
        ? Buffer.from(JSON.stringify({ at: last.updatedAt, id: last._id.toString() })).toString("base64url")
        : null
    return { rows: items, nextCursor }
}

export const createMessage = (values) => messageModel.create(values)

export const findMessageByClientId = (senderId, clientMessageId) => messageModel.findOne({ senderId, clientMessageId })
    .select("_id conversationId senderId message clientMessageId createdAt")
    .lean()

export const listMessages = async (conversationId, { limit, cursor }) => {
    const query = { conversationId }
    if (cursor) {
        const before = await messageModel.findById(cursor).select("createdAt").lean()
        if (!before) return { rows: [], nextCursor: null }
        query.$or = [
            { createdAt: { $lt: before.createdAt } },
            { createdAt: before.createdAt, _id: { $lt: before._id } },
        ]
    }
    const rows = await messageModel.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .select("_id conversationId senderId message clientMessageId createdAt")
        .lean()
    const hasMore = rows.length > limit
    const items = rows.slice(0, limit).reverse()
    return { rows: items, nextCursor: hasMore ? rows[limit - 1]._id.toString() : null }
}

export const updateConversationLastMessage = async (conversationId, messageId, createdAt, participantIds) => {
    await Promise.all([
        conversationsModel.updateOne({
            _id: conversationId,
            $or: [
                { lastMessageAt: null },
                { lastMessageAt: { $lt: createdAt } },
                { lastMessageAt: createdAt, lastMessageId: { $lt: messageId } },
            ],
        }, { $set: { lastMessageId: messageId, lastMessageAt: createdAt } }),
        conversationMemberModel.updateMany(
            { conversationId, userId: { $in: participantIds } },
            { $max: { updatedAt: createdAt } },
            { timestamps: false },
        ),
    ])
}

export const markConversationMemberRead = (conversationId, userId, messageId) =>
    conversationMemberModel.findOneAndUpdate(
        { conversationId, userId },
        { $set: { lastReadMessageId: messageId } },
        { new: true },
    ).select("_id").lean()

export const findLastConversationMessage = (conversationId) =>
    messageModel.findOne({ conversationId }).sort({ createdAt: -1, _id: -1 }).select("_id").lean()

export const findConversationRelations = (userId, otherIds) => contactModel.find({
    status: "accepted",
    $or: [
        { senderId: userId, receiverId: { $in: otherIds } },
        { receiverId: userId, senderId: { $in: otherIds } },
    ],
}).select("senderId receiverId").lean()

export const findConversationBlocks = (userId, otherIds) => blockModel.find({
    $or: [
        { blockerId: userId, blockedId: { $in: otherIds } },
        { blockedId: userId, blockerId: { $in: otherIds } },
    ],
}).select("blockerId blockedId").lean()
