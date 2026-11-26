import mongoose from "mongoose"
import { createBlock, deleteBlock, findBlockBetween, findBlockPairsForUsers, listBlockedByUser } from "../daos/block.dao.js"
import { createContact, deletePendingContactRequest, findContactPair, listContactRows, updateContactState } from "../daos/contact.dao.js"
import { findUserPreview } from "../daos/user.dao.js"
import { cacheGet, cacheSet, getContactCacheVersion, invalidateContactCache } from "./redis.service.js"
import { serializeUserPreview } from "./profile-visibility.service.js"
import { ApiError } from "../utils/ApiError.js"

const pairKeyFor = (first, second) => [String(first), String(second)].sort().join(":")
const badRequest = (code, message, statusCode = 400) => new ApiError({ statusCode, code, message })

const assertValidUserId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw badRequest("INVALID_USER_ID", "A valid user ID is required.")
}

const assertNotSelf = (userId, otherId) => {
    if (String(userId) === String(otherId)) throw badRequest("INVALID_RECIPIENT", "You cannot connect with yourself.")
}

const assertNotBlocked = async (userId, otherId) => {
    if (await findBlockBetween(userId, otherId)) {
        throw badRequest("RELATIONSHIP_BLOCKED", "This relationship is unavailable.", 403)
    }
}

const publicContactResult = (row) => ({
    id: row._id?.toString(),
    status: row.status,
    senderId: row.senderId?.toString?.() || row.senderId,
    receiverId: row.receiverId?.toString?.() || row.receiverId,
    updatedAt: row.updatedAt,
})

const updatePair = async (row, userId, otherId, status, requesterId = row.senderId) => {
    const updated = await updateContactState(row._id, {
        status: row.status,
        senderId: row.senderId,
        receiverId: row.receiverId,
    }, {
        pairKey: pairKeyFor(userId, otherId),
        senderId: requesterId,
        receiverId: String(requesterId) === String(userId) ? otherId : userId,
        status,
    })
    if (!updated) {
        const latest = await findContactPair(pairKeyFor(userId, otherId), userId, otherId)
        if (status === "accepted" && latest?.status === "accepted") return publicContactResult(latest)
        throw badRequest("CONTACT_STATE_CHANGED", "This contact request changed. Refresh and try again.", 409)
    }
    await invalidateContactCache([userId, otherId])
    return publicContactResult(updated)
}

const applyConnectToExisting = async (row, requesterId, recipientId) => {
    if (row.status === "accepted") return publicContactResult(row)

    if (row.status === "pending") {
        if (String(row.senderId) === String(requesterId)) {
            throw badRequest("CONTACT_REQUEST_PENDING", "Your request is already waiting for a response.", 409)
        }
        return updatePair(row, requesterId, recipientId, "accepted", row.senderId)
    }

    if (["rejected"].includes(row.status)) {
        if (String(row.senderId) === String(requesterId)) {
            throw badRequest("CONTACT_REQUEST_CLOSED", "You cannot send this request again. The other person may contact you instead.", 409)
        }
        return updatePair(row, requesterId, recipientId, "pending", requesterId)
    }

    if (row.status === "removed") return updatePair(row, requesterId, recipientId, "pending", requesterId)
    throw badRequest("CONTACT_STATE_INVALID", "This contact request cannot be changed.", 409)
}

export const connectContact = async (requesterId, recipientId) => {
    assertValidUserId(recipientId)
    assertNotSelf(requesterId, recipientId)
    await assertNotBlocked(requesterId, recipientId)

    const recipient = await findUserPreview(recipientId)
    if (!recipient) throw badRequest("USER_NOT_FOUND", "This user could not be found.", 404)
    if ((recipient.profile?.profilePrivacyOption || "everyone") !== "everyone") {
        throw badRequest("PROFILE_NOT_DISCOVERABLE", "This user is not accepting new contact requests.", 403)
    }

    const pairKey = pairKeyFor(requesterId, recipientId)
    let relation = await findContactPair(pairKey, requesterId, recipientId)
    if (relation) return applyConnectToExisting(relation, requesterId, recipientId)

    try {
        const created = await createContact({
            senderId: requesterId,
            receiverId: recipientId,
            pairKey,
            status: "pending",
        })
        await invalidateContactCache([requesterId, recipientId])
        return publicContactResult(created.toObject())
    } catch (error) {
        if (error.code !== 11000) throw error
        relation = await findContactPair(pairKey, requesterId, recipientId)
        if (!relation) throw error
        return applyConnectToExisting(relation, requesterId, recipientId)
    }
}

const findExpectedRelation = async (actorId, otherId) => {
    assertValidUserId(otherId)
    assertNotSelf(actorId, otherId)
    await assertNotBlocked(actorId, otherId)
    const row = await findContactPair(pairKeyFor(actorId, otherId), actorId, otherId)
    if (!row) throw badRequest("CONTACT_REQUEST_NOT_FOUND", "Contact request not found.", 404)
    return row
}

export const approveContact = async (accepterId, senderId, allowRejected = false) => {
    const row = await findExpectedRelation(accepterId, senderId)
    const directedToActor = String(row.senderId) === String(senderId) && String(row.receiverId) === String(accepterId)
    if (!directedToActor || !["pending", ...(allowRejected ? ["rejected"] : [])].includes(row.status)) {
        throw badRequest("CONTACT_REQUEST_NOT_APPROVABLE", "This contact request cannot be approved.", 409)
    }
    return updatePair(row, accepterId, senderId, "accepted", senderId)
}

export const rejectContact = async (accepterId, senderId) => {
    const row = await findExpectedRelation(accepterId, senderId)
    if (String(row.senderId) !== String(senderId) || String(row.receiverId) !== String(accepterId) || row.status !== "pending") {
        throw badRequest("CONTACT_REQUEST_NOT_REJECTABLE", "This pending request cannot be rejected.", 409)
    }
    return updatePair(row, accepterId, senderId, "rejected", senderId)
}

export const cancelContactRequest = async (requesterId, recipientId) => {
    const row = await findExpectedRelation(requesterId, recipientId)
    if (String(row.senderId) !== String(requesterId) || String(row.receiverId) !== String(recipientId) || row.status !== "pending") {
        throw badRequest("CONTACT_REQUEST_NOT_CANCELLABLE", "Only your pending request can be cancelled.", 409)
    }

    const deleted = await deletePendingContactRequest(row._id, requesterId, recipientId)
    if (!deleted) {
        throw badRequest("CONTACT_REQUEST_NOT_CANCELLABLE", "Only your pending request can be cancelled.", 409)
    }

    await invalidateContactCache([requesterId, recipientId])
    return publicContactResult(deleted)
}

export const removeContact = async (userId, otherId) => {
    const row = await findExpectedRelation(userId, otherId)
    if (row.status !== "accepted") throw badRequest("CONTACT_NOT_APPROVED", "Only an approved contact can be removed.", 409)
    return updatePair(row, userId, otherId, "removed", row.senderId)
}

export const requireApprovedContact = async (userId, otherId) => {
    assertValidUserId(otherId)
    assertNotSelf(userId, otherId)
    await assertNotBlocked(userId, otherId)
    const row = await findContactPair(pairKeyFor(userId, otherId), userId, otherId)
    if (!row || row.status !== "accepted") {
        throw badRequest("CONTACT_REQUIRED", "You must be approved contacts before starting a conversation.", 403)
    }
    return row
}

export const getContactList = async (userId, status, { limit, cursor }) => {
    const version = await getContactCacheVersion(userId)
    const cursorPart = cursor || "start"
    const cacheKey = version === null ? null : `contacts:list:${userId}:${version}:${status}:${limit}:${cursorPart}`
    if (cacheKey) {
        const cached = await cacheGet(cacheKey)
        if (cached) return cached
    }

    const { rows, nextCursor } = await listContactRows(userId, status, { limit, cursor })
    const otherIds = rows.map((row) => String(row.senderId._id) === String(userId) ? row.receiverId._id : row.senderId._id)
    const blockedPairs = await findBlockPairsForUsers(userId, otherIds)
    const blockedIds = new Set(blockedPairs.map((pair) => String(pair.blockerId) === String(userId) ? String(pair.blockedId) : String(pair.blockerId)))
    const data = {
        items: rows.map((row) => {
            const other = String(row.senderId._id) === String(userId) ? row.receiverId : row.senderId
            const isContact = row.status === "accepted"
            return {
                ...serializeUserPreview(other, isContact && !blockedIds.has(String(other._id))),
                contactId: row._id.toString(),
                status: blockedIds.has(String(other._id)) ? "blocked" : row.status,
                relationshipStatus: row.status,
                requestedByMe: String(row.senderId._id) === String(userId),
                updatedAt: row.updatedAt,
            }
        }),
        nextCursor,
    }
    if (cacheKey) await cacheSet(cacheKey, data)
    return data
}

export const createBlockForUser = async (blockerId, blockedId) => {
    assertValidUserId(blockedId)
    assertNotSelf(blockerId, blockedId)
    if (!await findUserPreview(blockedId)) throw badRequest("USER_NOT_FOUND", "This user could not be found.", 404)
    try {
        await createBlock(blockerId, blockedId)
    } catch (error) {
        if (error.code !== 11000) throw error
    }
    await invalidateContactCache([blockerId, blockedId])
    return { blockedUserId: String(blockedId) }
}

export const removeBlockForUser = async (blockerId, blockedId) => {
    assertValidUserId(blockedId)
    await deleteBlock(blockerId, blockedId)
    await invalidateContactCache([blockerId, blockedId])
    return { blockedUserId: String(blockedId) }
}

export const getBlockedUsers = async (userId) => {
    const rows = await listBlockedByUser(userId)
    return { items: rows.filter((row) => row.blockedId).map((row) => ({
        ...serializeUserPreview(row.blockedId, false),
        blockedAt: row.createdAt,
    })) }
}
