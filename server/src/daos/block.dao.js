import blockModel from "../models/block.model.js"

export const findBlockBetween = (userA, userB) => blockModel.findOne({
    $or: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
    ],
}).select("_id blockerId blockedId").lean()

export const listBlockedByUser = (userId) => blockModel.find({ blockerId: userId })
    .sort({ _id: -1 })
    .select("blockedId createdAt")
    .populate("blockedId", "name username profile")
    .lean()

export const findBlockPairsForUsers = (userId, otherIds) => blockModel.find({
    $or: [
        { blockerId: userId, blockedId: { $in: otherIds } },
        { blockedId: userId, blockerId: { $in: otherIds } },
    ],
}).select("blockerId blockedId").lean()

export const createBlock = (blockerId, blockedId) => blockModel.create({ blockerId, blockedId })
export const deleteBlock = (blockerId, blockedId) => blockModel.findOneAndDelete({ blockerId, blockedId }).lean()
