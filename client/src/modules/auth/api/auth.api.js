const API_URL = import.meta.env.VITE_API_URL || "/api"

export class ApiRequestError extends Error {
  constructor(payload, status) {
    super(payload?.message || "Unable to complete the request.")
    this.name = "ApiRequestError"
    this.status = status
    this.code = payload?.code || "REQUEST_FAILED"
    this.errors = payload?.errors || {}
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiRequestError(payload, response.status)
  return payload
}

export const registerRequest = (values) => request("/auth/register", {
  method: "POST",
  body: JSON.stringify(values),
})

export const loginRequest = (values) => request("/auth/login", {
  method: "POST",
  body: JSON.stringify(values),
})

export const refreshRequest = async () => {
  try {
    return await request("/auth/refresh", { method: "POST" })
  } catch (error) {
    if (error.code !== "SESSION_REFRESHED") throw error
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    return request("/auth/refresh", { method: "POST" })
  }
}
export const logoutRequest = () => request("/auth/logout", { method: "POST" })

export const forgotPasswordRequest = (email) => request("/auth/forgot-password", {
  method: "POST",
  body: JSON.stringify({ email }),
})

export const verifyResetCodeRequest = (email, code) => request("/auth/verify-reset-code", {
  method: "POST",
  body: JSON.stringify({ email, code }),
})

export const resetPasswordRequest = (email, code, password) => request("/auth/reset-password", {
  method: "POST",
  body: JSON.stringify({ email, code, password }),
})

export const authenticatedRequest = (path, accessToken, options = {}) => request(path, {
  ...options,
  headers: { ...options.headers, Authorization: `Bearer ${accessToken}` },
})

const signedPhotoCache = new Map()
const signedPhotoRequests = new Map()
const SIGNED_PHOTO_CACHE_MS = 9 * 60 * 1000

export const signedPhotoUrlRequest = (filePath, accessToken) => {
  const key = `${accessToken}:${filePath}`
  const cached = signedPhotoCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.url)
  if (signedPhotoRequests.has(key)) return signedPhotoRequests.get(key)

  const requestPromise = authenticatedRequest(`/user/photo?filePath=${encodeURIComponent(filePath)}`, accessToken)
    .then((response) => {
      const imageUrl = response?.data?.imageUrl
      if (typeof imageUrl !== "string" || !imageUrl.startsWith("https://")) {
        throw new Error("The server returned an invalid profile photo URL.")
      }
      if (signedPhotoCache.size > 500) signedPhotoCache.delete(signedPhotoCache.keys().next().value)
      signedPhotoCache.set(key, { url: imageUrl, expiresAt: Date.now() + SIGNED_PHOTO_CACHE_MS })
      return imageUrl
    })
    .finally(() => signedPhotoRequests.delete(key))

  signedPhotoRequests.set(key, requestPromise)
  return requestPromise
}

export const updateProfileRequest = (values, accessToken) => {
  const body = new FormData()
  for (const key of ["bio", "userCaption", "profilePrivacyOption", "profilePhotoPrivacyOption", "bioPrivacyOption", "userCaptionPrivacyOption", "lastSeenPrivacy", "onlineStatusPrivacy"]) {
    if (values[key] !== undefined) body.append(key, values[key])
  }
  if (values.interests !== undefined) body.append("interests", JSON.stringify(values.interests))
  if (values.profilePhoto) body.append("profilePhoto", values.profilePhoto)
  if (values.removeProfilePhoto) body.append("removeProfilePhoto", "true")

  return fetch(`${API_URL}/auth/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
  }).then(async (response) => {
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new ApiRequestError(payload, response.status)
    return payload
  })
}


