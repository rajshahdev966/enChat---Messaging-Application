import mongoose from "mongoose"

const conversationMemberSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversations",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    lastReadMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
        default: null,
    },
    isMuted: {
        type: Boolean,
        default: false,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true })

conversationMemberSchema.index({ conversationId: 1, userId: 1 }, { unique: true })
conversationMemberSchema.index({ userId: 1, updatedAt: -1, _id: -1 })

export default mongoose.model("conversationMembers", conversationMemberSchema)
