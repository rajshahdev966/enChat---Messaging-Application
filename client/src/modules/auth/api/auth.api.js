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

export const refreshRequest = () => request("/auth/refresh", { method: "POST" })
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

export const signedPhotoUrlRequest = (filePath, accessToken, signal) =>
  authenticatedRequest(`/user/photo?filePath=${encodeURIComponent(filePath)}`, accessToken, { signal })
    .then((response) => response.data.imageUrl)

export const updateProfileRequest = (values, accessToken) => {
  const body = new FormData()
  for (const key of ["bio", "userCaption", "profilePrivacyOption", "profilePhotoPrivacyOption"]) {
    if (values[key] !== undefined) body.append(key, values[key])
  }
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


