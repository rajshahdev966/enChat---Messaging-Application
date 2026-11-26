import { authenticatedRequest } from "../../auth/api/auth.api"

const params = (values) => new URLSearchParams(Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== "")).toString()

export const discoverPeopleRequest = (values, accessToken, signal) =>
  authenticatedRequest(`/user/discover?${params(values)}`, accessToken, { signal }).then((response) => response.data)

export const getPersonProfileRequest = (userId, accessToken, signal) =>
  authenticatedRequest(`/user/${encodeURIComponent(userId)}/profile`, accessToken, { signal }).then((response) => response.data)
