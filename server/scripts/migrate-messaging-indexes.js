import mongoose from "mongoose"
import { config } from "dotenv"

config()
mongoose.set("autoIndex", false)

const [{ default: Contact }, { default: Block }, { default: Conversation }, { default: Message }, { default: ConversationMember }, { userModel: User }] = await Promise.all([
    import("../src/models/contact.model.js"),
    import("../src/models/block.model.js"),
    import("../src/models/conversation.model.js"),
    import("../src/models/message.model.js"),
    import("../src/models/conversationMember.model.js"),
    import("../src/models/auth.model.js"),
])

const pairKey = (first, second) => [String(first), String(second)].sort().join(":")
const indexesOrEmpty = async (model) => {
    try { return await model.collection.indexes() }
    catch (error) {
        if (error.code === 26 || error.codeName === "NamespaceNotFound") return []
        throw error
    }
}

try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.")
    await mongoose.connect(process.env.MONGO_URI, { autoIndex: false })

    const contacts = await Contact.find({}, "senderId receiverId pairKey").lean()
    const pairRows = new Map()
    for (const row of contacts) {
        const key = pairKey(row.senderId, row.receiverId)
        pairRows.set(key, [...(pairRows.get(key) || []), row._id.toString()])
    }
    const duplicatePairs = [...pairRows].filter(([, ids]) => ids.length > 1)
    if (duplicatePairs.length) {
        throw new Error(`Found ${duplicatePairs.length} duplicate contact pairs. Resolve these records before migrating; no rows were changed.`)
    }

    const directRows = await Conversation.find({ type: "direct" }, "participants directKey").lean()
    const directPairs = new Map()
    for (const row of directRows) {
        if (row.participants?.length !== 2) throw new Error("A direct conversation does not have exactly two participants. Resolve it before migrating.")
        const key = pairKey(row.participants[0], row.participants[1])
        directPairs.set(key, [...(directPairs.get(key) || []), row._id.toString()])
    }
    if ([...directPairs.values()].some((ids) => ids.length > 1)) {
        throw new Error("Duplicate direct conversations exist. Resolve them before migrating; no indexes were changed.")
    }

    const duplicateBlocks = await Block.aggregate([
        { $group: { _id: { blockerId: "$blockerId", blockedId: "$blockedId" }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $limit: 5 },
    ])
    if (duplicateBlocks.length) throw new Error("Duplicate block records exist. Resolve them before migrating; no indexes were changed.")

    const duplicateMembers = await ConversationMember.aggregate([
        { $group: { _id: { conversationId: "$conversationId", userId: "$userId" }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $limit: 5 },
    ])
    if (duplicateMembers.length) throw new Error("Duplicate conversation membership records exist. Resolve them before migrating; no indexes were changed.")

    const duplicateMessages = await Message.aggregate([
        { $match: { clientMessageId: { $type: "string" } } },
        { $group: { _id: { senderId: "$senderId", clientMessageId: "$clientMessageId" }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $limit: 5 },
    ])
    if (duplicateMessages.length) throw new Error("Duplicate client message IDs exist. Resolve them before migrating; no indexes were changed.")

    const [blockIndexes, conversationIndexes, contactIndexes, messageIndexes, memberIndexes] = await Promise.all([
        indexesOrEmpty(Block),
        indexesOrEmpty(Conversation),
        indexesOrEmpty(Contact),
        indexesOrEmpty(Message),
        indexesOrEmpty(ConversationMember),
    ])
    for (const index of blockIndexes) {
        const fields = Object.keys(index.key || {})
        if ((fields.includes("senderId") && fields.includes("receiverId"))
            || (fields.includes("blockerId") && fields.includes("blockedId") && (!index.unique || index.partialFilterExpression))) {
            await Block.collection.dropIndex(index.name)
        }
    }
    for (const index of conversationIndexes) if (index.key?.directKey) await Conversation.collection.dropIndex(index.name)
    for (const index of contactIndexes) if (index.key?.pairKey) await Contact.collection.dropIndex(index.name)
    for (const index of messageIndexes) {
        if (index.key?.senderId && index.key?.clientMessageId
            && (!index.unique || index.partialFilterExpression?.clientMessageId?.$type !== "string")) {
            await Message.collection.dropIndex(index.name)
        }
    }
    for (const index of memberIndexes) {
        if (index.key?.conversationId && index.key?.userId && (!index.unique || index.partialFilterExpression)) {
            await ConversationMember.collection.dropIndex(index.name)
        }
    }

    for (const row of contacts) {
        const canonical = pairKey(row.senderId, row.receiverId)
        if (row.pairKey !== canonical) await Contact.updateOne({ _id: row._id }, { $set: { pairKey: canonical } })
    }

    for (const row of directRows) {
        const canonical = pairKey(row.participants[0], row.participants[1])
        if (row.directKey !== canonical) await Conversation.updateOne({ _id: row._id }, { $set: { directKey: canonical } })
    }

    const lastMessages = await Conversation.aggregate([
        { $match: { lastMessageId: { $type: "objectId" } } },
        { $lookup: { from: "messages", localField: "lastMessageId", foreignField: "_id", as: "lastMessage" } },
        { $set: { lastMessageAt: { $arrayElemAt: ["$lastMessage.createdAt", 0] } } },
        { $match: { lastMessageAt: { $type: "date" } } },
        { $project: { _id: 1, lastMessageAt: 1 } },
    ])
    for (const row of lastMessages) await Conversation.updateOne({ _id: row._id }, { $set: { lastMessageAt: row.lastMessageAt } })

    for (const model of [Contact, Block, Conversation, Message, ConversationMember, User]) {
        await model.createIndexes()
    }
    console.info("Messaging indexes are ready.")
} catch (error) {
    console.error("Messaging index migration failed:", error.message)
    process.exitCode = 1
} finally {
    await mongoose.disconnect()
}
