import mongoose from "mongoose"
import {
    createDirectConversation,
    createMessage,
    ensureConversationMembers,
    findConversationBlocks,
    findConversationById,
    findConversationMember,
    findConversationRelations,
    findDirectConversation,
    findMessageByClientId,
    findLastConversationMessage,
    listConversationMembers,
    listMessages,
    markConversationMemberRead,
    updateConversationLastMessage,
} from "../daos/conversation.dao.js"
import { requireApprovedContact } from "./contact.service.js"
import { serializeUserPreview } from "./profile-visibility.service.js"
import { ApiError } from "../utils/ApiError.js"

const directKeyFor = (a, b) => [String(a), String(b)].sort().join(":")
const fail = (statusCode, code, message) => new ApiError({ statusCode, code, message })

const messageDto = (message) => ({
    id: message._id.toString(),
    conversationId: message.conversationId.toString(),
    senderId: message.senderId.toString(),
    message: message.message,
    clientMessageId: message.clientMessageId,
    createdAt: message.createdAt,
})

export const openDirectConversation = async (userId, otherId) => {
    await requireApprovedContact(userId, otherId)
    const directKey = directKeyFor(userId, otherId)
    let conversation = await findDirectConversation(directKey)

    if (!conversation) {
        try {
            conversation = await createDirectConversation(directKey, [userId, otherId])
        } catch (error) {
            if (error.code !== 11000) throw error
            conversation = await findDirectConversation(directKey)
        }
    }

    if (!conversation) throw fail(500, "CONVERSATION_CREATE_FAILED", "The conversation could not be opened.")
    await ensureConversationMembers(conversation._id, [userId, otherId])
    return {
        id: conversation._id.toString(),
        type: "direct",
        participantIds: [String(userId), String(otherId)],
        canSendMessages: true,
    }
}

export const getConversationList = async (userId, type, { limit, cursor }) => {
    const { rows, nextCursor } = await listConversationMembers(userId, type, { limit, cursor })
    const otherIds = rows.flatMap(({ conversationId }) =>
        (conversationId.participants || []).filter((person) => String(person._id) !== String(userId)).map((person) => person._id),
    )
    const [relations, blocks] = await Promise.all([
        findConversationRelations(userId, otherIds),
        findConversationBlocks(userId, otherIds),
    ])
    const pairKeys = new Set(relations.map((row) => `${row.senderId}:${row.receiverId}`))
    const blocked = new Set(blocks.flatMap((row) => [
        `${row.blockerId}:${row.blockedId}`,
        `${row.blockedId}:${row.blockerId}`,
    ]))

    return {
        items: rows.map((member) => {
            const conversation = member.conversationId
            const otherRecord = (conversation.participants || []).find((person) => String(person._id) !== String(userId)) || null
            const other = otherRecord ? serializeUserPreview(otherRecord, false) : null
            const hasContact = other && pairKeys.has(`${userId}:${other.id}`) || other && pairKeys.has(`${other.id}:${userId}`)
            const isBlocked = other && blocked.has(`${userId}:${other.id}`)
            if (other && hasContact && !isBlocked) Object.assign(other.profile, serializeUserPreview(otherRecord, true).profile)
            const lastMessage = conversation.lastMessageId ? {
                id: conversation.lastMessageId._id.toString(),
                message: conversation.lastMessageId.message,
                senderId: conversation.lastMessageId.senderId.toString(),
                createdAt: conversation.lastMessageId.createdAt,
            } : null
            return {
                id: conversation._id.toString(),
                type: conversation.type,
                participant: other,
                lastMessage,
                updatedAt: member.updatedAt,
                isMuted: member.isMuted,
                unreadCount: member.unreadCount || 0,
                canSendMessages: conversation.type === "direct" && Boolean(hasContact) && !isBlocked,
            }
        }),
        nextCursor,
    }
}

export const getConversationMessages = async (userId, conversationId, pagination) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw fail(400, "INVALID_CONVERSATION_ID", "A valid conversation ID is required.")
    }
    if (!await findConversationMember(conversationId, userId)) {
        throw fail(403, "CONVERSATION_FORBIDDEN", "You are not a member of this conversation.")
    }
    const { rows, nextCursor } = await listMessages(conversationId, pagination)
    return { items: rows.map(messageDto), nextCursor }
}

export const getConversationDetails = async (userId, conversationId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw fail(400, "INVALID_CONVERSATION_ID", "A valid conversation ID is required.")
    }
    if (!await findConversationMember(conversationId, userId)) {
        throw fail(403, "CONVERSATION_FORBIDDEN", "You are not a member of this conversation.")
    }
    const conversation = await findConversationById(conversationId)
    if (!conversation) throw fail(404, "CONVERSATION_NOT_FOUND", "Conversation not found.")
    const other = conversation.participants.find((person) => String(person._id) !== String(userId)) || null
    let isContact = false
    let isBlocked = false
    if (other && conversation.type === "direct") {
        const [relations, blocks] = await Promise.all([
            findConversationRelations(userId, [other._id]),
            findConversationBlocks(userId, [other._id]),
        ])
        isContact = relations.length > 0
        isBlocked = blocks.length > 0
    }
    return {
        id: conversation._id.toString(),
        type: conversation.type,
        participant: other ? serializeUserPreview(other, isContact && !isBlocked) : null,
        lastMessage: conversation.lastMessageId ? {
            id: conversation.lastMessageId._id.toString(),
            message: conversation.lastMessageId.message,
            senderId: conversation.lastMessageId.senderId.toString(),
            createdAt: conversation.lastMessageId.createdAt,
        } : null,
        updatedAt: conversation.updatedAt,
        canSendMessages: conversation.type === "direct" && isContact && !isBlocked,
    }
}

export const markConversationRead = async (userId, conversationId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw fail(400, "INVALID_CONVERSATION_ID", "A valid conversation ID is required.")
    }
    if (!await findConversationMember(conversationId, userId)) {
        throw fail(403, "CONVERSATION_FORBIDDEN", "You are not a member of this conversation.")
    }
    const latest = await findLastConversationMessage(conversationId)
    if (latest) await markConversationMemberRead(conversationId, userId, latest._id)
    return { conversationId, lastReadMessageId: latest?._id.toString() || null }
}

export const sendDirectMessage = async (userId, payload) => {
    const { recipientId, message: rawMessage, clientMessageId } = payload || {}
    if (typeof rawMessage !== "string" || !rawMessage.trim()) {
        throw fail(400, "INVALID_MESSAGE", "Message text cannot be empty.")
    }
    const message = rawMessage.trim()
    if (message.length > 4000) throw fail(413, "MESSAGE_TOO_LONG", "Messages must be 4,000 characters or fewer.")
    if (typeof clientMessageId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(clientMessageId)) {
        throw fail(400, "INVALID_MESSAGE_ID", "A valid client message ID is required.")
    }

    await requireApprovedContact(userId, recipientId)
    const conversation = await openDirectConversation(userId, recipientId)
    let saved
    try {
        saved = await createMessage({
            conversationId: conversation.id,
            senderId: userId,
            message,
            clientMessageId,
        })
    } catch (error) {
        if (error.code !== 11000) throw error
        saved = await findMessageByClientId(userId, clientMessageId)
        if (!saved) throw error
        if (String(saved.conversationId) !== String(conversation.id) || saved.message !== message) {
            throw fail(409, "MESSAGE_ID_REUSED", "This message ID has already been used.")
        }
        await updateConversationLastMessage(conversation.id, saved._id, saved.createdAt, [userId, recipientId])
        return { conversationId: conversation.id, message: messageDto(saved), duplicate: true }
    }

    await updateConversationLastMessage(conversation.id, saved._id, saved.createdAt, [userId, recipientId])
    return { conversationId: conversation.id, message: messageDto(saved), duplicate: false }
}
