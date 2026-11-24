import mongoose from "mongoose"


const blockSchema = new mongoose.Schema({
    blockerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    blockedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
}, {timestamps: true})

blockSchema.index(
  { blockerId: 1, blockedId: 1 },
  { unique: true }
);




const blockModel = mongoose.model("blocks", blockSchema)

export default blockModel
