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
        unique: true,
    },
    lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
        default: null
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    }]

}, { timestamps: true })






const conversationsModel = mongoose.model("conversations", conversationSchema)


export default conversationsModel