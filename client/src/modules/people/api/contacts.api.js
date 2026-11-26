import { authenticatedRequest } from "../../auth/api/auth.api";

const buildQueryString = ({ limit = 30, cursor } = {}) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set("cursor", cursor);
  }
  return params.toString();
};

const extractData = (response) => response.data;

export const getContactsRequest = (token, pagination) =>
  authenticatedRequest(`/contact/?${buildQueryString(pagination)}`, token).then(extractData);

export const getPendingContactsRequest = (token, pagination) =>
  authenticatedRequest(`/contact/pending?${buildQueryString(pagination)}`, token).then(extractData);

export const getRejectedContactsRequest = (token, pagination) =>
  authenticatedRequest(`/contact/rejected?${buildQueryString(pagination)}`, token).then(extractData);

export const connectContactRequest = (userId, token) =>
  authenticatedRequest(`/contact/connect/${encodeURIComponent(userId)}`, token, {
    method: "POST",
  }).then(extractData);

export const approveContactRequest = (userId, token, reapprove = false) =>
  authenticatedRequest(`/contact/approve/${encodeURIComponent(userId)}`, token, {
    method: reapprove ? "PATCH" : "POST",
  }).then(extractData);

export const rejectContactRequest = (userId, token) =>
  authenticatedRequest(`/contact/reject/${encodeURIComponent(userId)}`, token, {
    method: "POST",
  }).then(extractData);

export const cancelContactRequest = (userId, token) =>
  authenticatedRequest(`/contact/request/${encodeURIComponent(userId)}`, token, {
    method: "DELETE",
  }).then(extractData);

export const removeContactRequest = (userId, token) =>
  authenticatedRequest(`/contact/${encodeURIComponent(userId)}`, token, {
    method: "DELETE",
  }).then(extractData);

export const getBlockedUsersRequest = (token) =>
  authenticatedRequest("/block/", token).then(extractData);

export const blockUserRequest = (userId, token) =>
  authenticatedRequest(`/block/${encodeURIComponent(userId)}`, token, {
    method: "POST",
  }).then(extractData);

export const unblockUserRequest = (userId, token) =>
  authenticatedRequest(`/block/${encodeURIComponent(userId)}`, token, {
    method: "DELETE",
  }).then(extractData);