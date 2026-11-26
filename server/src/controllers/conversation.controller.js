import { getConversationDetails, getConversationList, getConversationMessages, markConversationRead, openDirectConversation } from "../services/conversation.service.js"

const list = (type) => async (req, res) => {
    const data = await getConversationList(req.auth.id, type, req.pagination)
    return res.json({ success: true, data })
}

export const allConversations = list(null)
export const directConversations = list("direct")
export const groupConversations = list("group")

export const directConversation = async (req, res) => {
    const data = await openDirectConversation(req.auth.id, req.params.userId)
    return res.status(200).json({ success: true, data })
}

export const conversationMessages = async (req, res) => {
    const data = await getConversationMessages(req.auth.id, req.params.conversationId, req.pagination)
    return res.json({ success: true, data })
}

export const conversationDetails = async (req, res) => {
    const data = await getConversationDetails(req.auth.id, req.params.conversationId)
    return res.json({ success: true, data })
}

export const markRead = async (req, res) => {
    const data = await markConversationRead(req.auth.id, req.params.conversationId)
    return res.json({ success: true, data })
}
