import mongoose from "mongoose"


const contactSchema = new mongoose.Schema({
    // Owner = one who sent the request of contact
    // Accepter = one who accept the request of contact
    senderId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    pairKey: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["accepted", "pending", "rejected", "removed", "cancelled"],
        default: "pending"
    },


}, {timestamps: true})



contactSchema.index({ pairKey: 1 }, { unique: true, partialFilterExpression: { pairKey: { $type: "string" } } })
contactSchema.index({ receiverId: 1, status: 1, _id: -1 })
contactSchema.index({ senderId: 1, status: 1, _id: -1 })



const contactModel = mongoose.model("contacts", contactSchema)


export default contactModel
