import mongoose from "mongoose"
import { findConversationMember } from "../daos/conversation.dao.js"
import { openDirectConversation } from "../services/conversation.service.js"
import { ApiError } from "../utils/ApiError.js"

export const startDirectConversation = (userId, recipientId) =>
    openDirectConversation(userId, recipientId)

export const assertConversationMembership = async (userId, conversationId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new ApiError({ statusCode: 400, code: "INVALID_CONVERSATION_ID", message: "A valid conversation ID is required." })
    }
    const member = await findConversationMember(conversationId, userId)
    if (!member) {
        throw new ApiError({ statusCode: 403, code: "CONVERSATION_FORBIDDEN", message: "You are not a member of this conversation." })
    }
    return member
}
