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
    status: {
        type: String,
        enum: ["accepted", "pending", "rejected"],
        default: "pending"
    },

}, {timestamps: true})



contactSchema.index(
  { senderId: 1, receiverId: 1 },
  { unique: true }
);



const contactModel = mongoose.model("contacts", contactSchema)


export default contactModel