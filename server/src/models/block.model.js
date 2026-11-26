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

blockSchema.pre("validate", function () {
    if (String(this.blockerId) === String(this.blockedId)) {
        this.invalidate("blockedId", "You cannot block yourself.")
    }
})

blockSchema.index(
  { blockerId: 1, blockedId: 1 },
  { unique: true }
);
blockSchema.index({ blockedId: 1, blockerId: 1 })




const blockModel = mongoose.model("blocks", blockSchema)


export default blockModel
