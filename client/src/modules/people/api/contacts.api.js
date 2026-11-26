import { authenticatedRequest } from "../../auth/api/auth.api"

const query = ({ limit = 30, cursor } = {}) => {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set("cursor", cursor)
  return params.toString()
}

export const getContactsRequest = (token, pagination) => authenticatedRequest(`/contact/?${query(pagination)}`, token).then((response) => response.data)
export const getPendingContactsRequest = (token, pagination) => authenticatedRequest(`/contact/pending?${query(pagination)}`, token).then((response) => response.data)
export const getRejectedContactsRequest = (token, pagination) => authenticatedRequest(`/contact/rejected?${query(pagination)}`, token).then((response) => response.data)
export const connectContactRequest = (userId, token) => authenticatedRequest(`/contact/connect/${encodeURIComponent(userId)}`, token, { method: "POST" }).then((response) => response.data)
export const approveContactRequest = (userId, token, reapprove = false) => authenticatedRequest(`/contact/approve/${encodeURIComponent(userId)}`, token, { method: reapprove ? "PATCH" : "POST" }).then((response) => response.data)
export const rejectContactRequest = (userId, token) => authenticatedRequest(`/contact/reject/${encodeURIComponent(userId)}`, token, { method: "POST" }).then((response) => response.data)
export const cancelContactRequest = (userId, token) => authenticatedRequest(`/contact/request/${encodeURIComponent(userId)}`, token, { method: "DELETE" }).then((response) => response.data)
export const removeContactRequest = (userId, token) => authenticatedRequest(`/contact/${encodeURIComponent(userId)}`, token, { method: "DELETE" }).then((response) => response.data)
export const getBlockedUsersRequest = (token) => authenticatedRequest("/block/", token).then((response) => response.data)
export const blockUserRequest = (userId, token) => authenticatedRequest(`/block/${encodeURIComponent(userId)}`, token, { method: "POST" }).then((response) => response.data)
export const unblockUserRequest = (userId, token) => authenticatedRequest(`/block/${encodeURIComponent(userId)}`, token, { method: "DELETE" }).then((response) => response.data)
