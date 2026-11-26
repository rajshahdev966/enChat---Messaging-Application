import bcryptjs from "bcryptjs"
import { randomUUID } from "node:crypto"
import { env } from "../config/env.js"
import {
    createUser,
    deleteUser,
    findPublicUserById,
    findUserByEmailOrUsername,
    findUserForLogin,
    findUserForPasswordReset,
    findUserForProfile,
    findUserForSession,
    rotateRefreshTokenHash,
    updateUserProfile,
} from "../daos/auth.dao.js"
import { ApiError } from "../utils/ApiError.js"
import {
    createPasswordResetCode,
    generateTokens,
    hashToken,
    verifyRefreshToken,
} from "../utils/auth.util.js"
import { deleteFile, deleteFileByPath, uploadFiles } from "../services/storage.service.js"
import { disconnectSessionSockets } from "../sockets/socket.server.js"
import { queuePhotoCleanup } from "../services/photo-cleanup.service.js"

const REFRESH_COOKIE = "refreshToken"
const REFRESH_COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    secure: env.NODE_ENV === "production",
    path: "/api/auth",
}
const REFRESH_COOKIE_OPTIONS = {
    ...REFRESH_COOKIE_BASE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const publicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    username: user.username,
})

const publicProfile = (profile) => ({
    profilePrivacyOption: profile?.profilePrivacyOption || "everyone",
    bio: profile?.bio || null,
    userCaption: profile?.userCaption || null,
    profilePhoto: {
        filePath: profile?.profilePhoto?.filePath || null,
        profilePhotoPrivacyOption: profile?.profilePhoto?.profilePhotoPrivacyOption || "everyone",
    },
    bioPrivacyOption: profile?.bioPrivacyOption || "everyone",
    userCaptionPrivacyOption: profile?.userCaptionPrivacyOption || "everyone",
    interests: profile?.interests || [],
    lastSeenPrivacy: profile?.lastSeenPrivacy || "contacts",
    onlineStatusPrivacy: profile?.onlineStatusPrivacy || "me",
})

const publicUserWithProfile = (user) => ({
    ...publicUser(user),
    profile: publicProfile(user.profile),
})

const setRefreshCookie = (res, token) =>
    res.cookie(REFRESH_COOKIE, token, REFRESH_COOKIE_OPTIONS)

const clearRefreshCookie = (res) =>
    res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_BASE_OPTIONS)

const cleanupUploadedPhoto = async (uploaded) => {
    if (!uploaded?.fileId) {
        if (uploaded?.filePath) await queuePhotoCleanup(uploaded.filePath).catch(() => {})
        return
    }
    try {
        await deleteFile(uploaded.fileId)
    } catch (error) {
        if (uploaded.filePath) await queuePhotoCleanup(uploaded.filePath).catch(() => {})
        console.error("Unable to clean up an unused uploaded profile photo:", error.message)
    }
}

const createSession = async (user, res, { replace = false } = {}) => {
    const previousSessionId = user.activeSessionId || null
    const sessionId = replace || !previousSessionId ? randomUUID() : previousSessionId
    const { accessToken, refreshToken } = generateTokens(user._id, user.username, sessionId)
    user.refreshTokenHash = hashToken(refreshToken)
    user.activeSessionId = sessionId
    await user.save({ validateBeforeSave: false })
    setRefreshCookie(res, refreshToken)
    if (previousSessionId && previousSessionId !== sessionId) disconnectSessionSockets(previousSessionId)
    return accessToken
}

export const register = async (req, res) => {
    const { email, password, name, username } = req.body
    const existing = await findUserByEmailOrUsername(email, username)

    if (existing) {
        const errors = {}
        if (existing.email === email) errors.email = "Email is already registered."
        if (existing.username === username) errors.username = "Username is already taken."
        throw new ApiError({
            statusCode: 409,
            code: "USER_ALREADY_EXISTS",
            message: "The provided details are already in use.",
            errors,
        })
    }

    const user = await createUser({
        email,
        name,
        username,
        passwordHash: await bcryptjs.hash(password, 12),
    })

    try {
        const accessToken = await createSession(user, res, { replace: true })
        return res.status(201).json({
            success: true,
            message: "Registered successfully.",
            data: { user: publicUserWithProfile(user), profile: publicProfile(user.profile), accessToken },
        })
    } catch (error) {
        await deleteUser(user._id)
        throw error
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    const user = await findUserForLogin(email)
    const validPassword = user && await bcryptjs.compare(password, user.passwordHash)

    if (!validPassword) {
        throw new ApiError({
            statusCode: 401,
            code: "INVALID_CREDENTIALS",
            message: "Email or password is incorrect.",
        })
    }

    const accessToken = await createSession(user, res, { replace: true })
    return res.json({
        success: true,
        message: "Signed in successfully.",
        data: { user: publicUserWithProfile(user), accessToken, profile: publicProfile(user?.profile) },
    })
}

export const refresh = async (req, res) => {
    const refreshToken = req.cookies[REFRESH_COOKIE]
    if (!refreshToken) {
        throw new ApiError({ statusCode: 401, code: "REFRESH_TOKEN_REQUIRED", message: "Your session has expired." })
    }

    let decoded
    try {
        decoded = verifyRefreshToken(refreshToken)
    } catch {
        clearRefreshCookie(res)
        throw new ApiError({ statusCode: 401, code: "INVALID_REFRESH_TOKEN", message: "Your session has expired." })
    }

    const user = await findUserForSession(decoded.id)
    if (!user?.refreshTokenHash || hashToken(refreshToken) !== user.refreshTokenHash
        || (decoded.sid && decoded.sid !== user.activeSessionId)) {
        clearRefreshCookie(res)
        throw new ApiError({ statusCode: 401, code: "INVALID_REFRESH_TOKEN", message: "Your session has expired." })
    }

    const { accessToken, refreshToken: nextRefreshToken } = generateTokens(user._id, user.username, user.activeSessionId)
    const rotation = await rotateRefreshTokenHash(user._id, user.refreshTokenHash, user.activeSessionId, hashToken(nextRefreshToken))
    if (!rotation.modifiedCount) {
        throw new ApiError({ statusCode: 409, code: "SESSION_REFRESHED", message: "Your session was refreshed in another tab. Retrying now." })
    }
    setRefreshCookie(res, nextRefreshToken)
    return res.json({
        success: true,
        message: "Session refreshed.",
        data: { user: publicUserWithProfile(user), accessToken, profile: publicProfile(user.profile) },
    })
}

export const logout = async (req, res) => {
    const refreshToken = req.cookies[REFRESH_COOKIE]
    if (refreshToken) {
        try {
            const { id } = verifyRefreshToken(refreshToken)
            const user = await findUserForSession(id)
            if (user && hashToken(refreshToken) === user.refreshTokenHash) {
                const sessionId = user.activeSessionId
                user.refreshTokenHash = undefined
                user.activeSessionId = undefined
                await user.save({ validateBeforeSave: false })
                if (sessionId) disconnectSessionSockets(sessionId)
            }
        } catch {
            // Invalid cookies are still cleared; logout is idempotent.
        }
    }
    clearRefreshCookie(res)
    return res.json({ success: true, message: "Signed out successfully." })
}

export const forgotPassword = async (req, res) => {
    const user = await findUserForPasswordReset(req.body.email)
    let devCode
    if (user) {
        const code = createPasswordResetCode()
        user.passwordResetTokenHash = hashToken(code)
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000)
        await user.save({ validateBeforeSave: false })
        if (env.NODE_ENV !== "production") devCode = code
    }

    return res.json({
        success: true,
        message: "If that account exists, a reset code has been sent.",
        data: devCode ? { devCode } : {},
    })
}

const getValidPasswordResetUser = async (email, code) => {
    const user = await findUserForPasswordReset(email)
    const valid = user
        && user.passwordResetExpires > new Date()
        && user.passwordResetTokenHash === hashToken(code)
    if (!valid) {
        throw new ApiError({
            statusCode: 400,
            code: "INVALID_RESET_CODE",
            message: "The reset code is invalid or has expired.",
            errors: { code: "Enter a valid reset code." },
        })
    }
    return user
}

export const verifyResetCode = async (req, res) => {
    await getValidPasswordResetUser(req.body.email, req.body.code)
    return res.json({ success: true, message: "Reset code verified." })
}

export const resetPassword = async (req, res) => {
    const user = await getValidPasswordResetUser(req.body.email, req.body.code)
    user.passwordHash = await bcryptjs.hash(req.body.password, 12)
    user.passwordResetTokenHash = undefined
    user.passwordResetExpires = undefined
    const previousSessionId = user.activeSessionId
    user.refreshTokenHash = undefined
    user.activeSessionId = undefined
    await user.save()
    if (previousSessionId) disconnectSessionSockets(previousSessionId)
    clearRefreshCookie(res)
    return res.json({ success: true, message: "Password reset successfully. You can now sign in." })
}

export const me = async (req, res) => {
    const user = await findPublicUserById(req.auth.id)
    if (!user) throw new ApiError({ statusCode: 404, code: "USER_NOT_FOUND", message: "User not found." })
    return res.json({ success: true, data: { user: publicUser(user), profile: publicProfile(user.profile) } })
}

export const setupProfile = async (req, res) => {
    const { bio, userCaption, profilePrivacyOption, profilePhotoPrivacyOption, bioPrivacyOption, userCaptionPrivacyOption, lastSeenPrivacy, onlineStatusPrivacy } = req.body
    const current = await findUserForProfile(req.auth.id)
    if (!current) throw new ApiError({ statusCode: 404, code: "USER_NOT_FOUND", message: "User not found." })

    const previousFilePath = current.profile?.profilePhoto?.filePath || null
    let uploaded
    if (req.file) {
        try {
            uploaded = await uploadFiles({ buffer: req.file.buffer, fileName: `profile-${req.auth.id}-${Date.now()}.${req.file.mimetype.split("/")[1]}` })
        } catch (error) {
            // Keep the current photo until the replacement is uploaded and saved.
            throw new ApiError({ statusCode: 502, code: "PHOTO_UPLOAD_FAILED", message: "Profile photo could not be uploaded. Please try again.", cause: error })
        }
        if (!uploaded?.filePath || !uploaded?.fileId) {
            await cleanupUploadedPhoto(uploaded)
            throw new ApiError({ statusCode: 502, code: "PHOTO_UPLOAD_INCOMPLETE", message: "Profile photo upload did not complete. Please try again." })
        }
    }

    const update = {}
    if (bio !== undefined) update.bio = bio.trim() || null
    if (userCaption !== undefined) update.userCaption = userCaption.trim() || null
    if (profilePrivacyOption !== undefined) update.profilePrivacyOption = profilePrivacyOption
    if (profilePhotoPrivacyOption !== undefined) update["profilePhoto.profilePhotoPrivacyOption"] = profilePhotoPrivacyOption
    if (bioPrivacyOption !== undefined) update.bioPrivacyOption = bioPrivacyOption
    if (userCaptionPrivacyOption !== undefined) update.userCaptionPrivacyOption = userCaptionPrivacyOption
    if (lastSeenPrivacy !== undefined) update.lastSeenPrivacy = lastSeenPrivacy
    if (onlineStatusPrivacy !== undefined) update.onlineStatusPrivacy = onlineStatusPrivacy
    if (req.body.interests !== undefined) {
        try {
            const interests = typeof req.body.interests === "string" ? JSON.parse(req.body.interests) : req.body.interests
            if (!Array.isArray(interests) || interests.length > 20 || interests.some((item) => typeof item !== "string" || item.trim().length > 40)) {
                throw new Error("Invalid interests")
            }
            update.interests = [...new Set(interests.map((item) => item.trim()).filter(Boolean))]
        } catch {
            await cleanupUploadedPhoto(uploaded)
            throw new ApiError({ statusCode: 400, code: "INVALID_INTERESTS", message: "Interests must be a list of up to 20 short text values." })
        }
    }
    if (uploaded) {
        update["profilePhoto.filePath"] = uploaded.filePath
    } else if (req.body.removeProfilePhoto === "true") {
        update["profilePhoto.filePath"] = null
    }

    let profile
    try {
        profile = await updateUserProfile(req.auth.id, update)
    } catch (error) {
        await cleanupUploadedPhoto(uploaded)
        throw error
    }

    if (!profile) {
        await cleanupUploadedPhoto(uploaded)
        throw new ApiError({ statusCode: 404, code: "USER_NOT_FOUND", message: "User not found." })
    }

    if ((uploaded || req.body.removeProfilePhoto === "true") && previousFilePath && previousFilePath !== uploaded?.filePath) {
        await deleteFileByPath(previousFilePath).catch((error) => {
            console.error("Unable to remove replaced ImageKit photo:", error.message)
            queuePhotoCleanup(previousFilePath).catch((queueError) => console.error("Unable to queue photo cleanup:", queueError.message))
        })
    }



    const user = await findPublicUserById(req.auth.id)
    return res.json({ success: true, message: "Profile saved.", data: { user: publicUserWithProfile(user), profile: publicProfile(user.profile) } })
}


