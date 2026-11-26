import contactModel from "../models/contact.model.js"

export const findContactPair = (pairKey, userA, userB) => contactModel.findOne({
    $or: [
        { pairKey },
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
    ],
}).select("senderId receiverId pairKey status updatedAt").lean()

export const createContact = (values) => contactModel.create(values)

export const updateContactState = (contactId, expected, values) => contactModel.findOneAndUpdate(
    { _id: contactId, status: expected.status, senderId: expected.senderId, receiverId: expected.receiverId },
    { $set: values },
    { new: true, runValidators: true },
).lean()

export const deletePendingContactRequest = (contactId, senderId, receiverId) => contactModel.findOneAndDelete({
    _id: contactId,
    senderId,
    receiverId,
    status: "pending",
}).lean()

export const listContactRows = async (userId, status, { limit, cursor }) => {
    const direction = { $or: [{ senderId: userId }, { receiverId: userId }] }
    const query = { ...direction, status }
    if (cursor) query._id = { $lt: cursor }

    const rows = await contactModel.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .select("senderId receiverId status updatedAt")
        .populate("senderId", "name username profile")
        .populate("receiverId", "name username profile")
        .lean()

    const hasMore = rows.length > limit
    const items = rows.slice(0, limit)
    return {
        rows: items,
        nextCursor: hasMore ? items.at(-1)._id.toString() : null,
    }
}

export const findAcceptedContactUserIds = async (userId) => {
    const rows = await contactModel.find({
        status: "accepted",
        $or: [{ senderId: userId }, { receiverId: userId }],
    }).select("senderId receiverId").lean()
    return rows.map((row) => String(row.senderId) === String(userId) ? row.receiverId : row.senderId)
}
