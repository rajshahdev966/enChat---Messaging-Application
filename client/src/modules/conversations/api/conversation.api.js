import { authenticatedRequest } from "../../auth/api/auth.api"

const pageQuery = ({ limit = 30, cursor } = {}) => {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set("cursor", cursor)
  return params.toString()
}

export const listConversationsRequest = (token, { type, limit = 30, cursor } = {}) => {
  const suffix = type ? `/${type}` : "/all"
  return authenticatedRequest(`/conversation${suffix}?${pageQuery({ limit, cursor })}`, token).then((response) => response.data)
}

export const openDirectConversationRequest = (recipientId, token) =>
  authenticatedRequest(`/conversation/direct/${encodeURIComponent(recipientId)}`, token, { method: "POST" }).then((response) => response.data)

export const getConversationRequest = (conversationId, token, signal) =>
  authenticatedRequest(`/conversation/${encodeURIComponent(conversationId)}`, token, { signal }).then((response) => response.data)

export const listMessagesRequest = (conversationId, token, { limit = 30, cursor, signal } = {}) =>
  authenticatedRequest(`/conversation/messages/${encodeURIComponent(conversationId)}?${pageQuery({ limit, cursor })}`, token, { signal }).then((response) => response.data)

export const markConversationReadRequest = (conversationId, token) =>
  authenticatedRequest(`/conversation/${encodeURIComponent(conversationId)}/read`, token, { method: "POST" }).then((response) => response.data)
