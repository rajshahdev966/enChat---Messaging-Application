import mongoose from "mongoose"


const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["group", "direct"],
        default: "direct"
    },
    directKey: {
        type: String,
        default: null,
    },
    lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
        default: null
    },
    lastMessageAt: {
        type: Date,
        default: null,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    }]

}, { timestamps: true })

conversationSchema.index(
    { directKey: 1 },
    { unique: true, partialFilterExpression: { directKey: { $type: "string" } } },
)






const conversationsModel = mongoose.model("conversations", conversationSchema)


export default conversationsModel
