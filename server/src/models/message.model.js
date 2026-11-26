import mongoose from "mongoose"


const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "conversations"
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    message: {
        type: String,
        required: true,
        maxlength: 4000,
        trim: true,
    },
    clientMessageId: {
        type: String,
        required: true,
        maxlength: 80,
    }
}, { timestamps: true })


messageSchema.index({
    conversationId: 1,
    createdAt: -1,
    _id: -1
});

messageSchema.index(
    { senderId: 1, clientMessageId: 1 },
    { unique: true, partialFilterExpression: { clientMessageId: { $type: "string" } } },
)



const messageModel = mongoose.model("messages", messageSchema)


export default messageModel
