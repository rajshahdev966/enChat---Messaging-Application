import mongoose from "mongoose"
import conversationsModel from "../models/conversation.model.js"
import conversationMemberModel from "../models/conversationMember.model.js"
import { createSocketError } from "../middlewares/error.middleware.js"


export const getOrCreateDirectConversation = async (userA, userB) => {

    if (![userA, userB].every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw createSocketError("INVALID_RECIPIENT")
    }

    if (userA.toString() === userB.toString()) {
        throw createSocketError("INVALID_RECIPIENT", "You cannot message yourself.")
    }

    const directKey = [userA.toString(), userB.toString()].sort().join(":")

    let conversation = await conversationsModel.findOne({ directKey }).select("_id type").lean()

    if (!conversation) {
        try {
            conversation = await conversationsModel.create({
                type: "direct",
                directKey,
                participants: [userA, userB],
            })
        } catch (error) {
            if (error.code !== 11000) throw error;

            conversation = await conversationsModel
                .findOne({ directKey })
                .select("_id type")
                .lean();
        }
    }

    // Assures that userA and userB are in conversationMemeberModel (such fxn are k.a Idempotent)
    await conversationMemberModel.bulkWrite(
        [userA, userB].map((userId) => ({
            updateOne: {
                filter: {
                    conversationId: conversation._id,
                    userId,
                },
                update: {
                    $setOnInsert: {
                        conversationId: conversation._id,
                        userId,
                    },
                },
                upsert: true,
            },
        })),
        { ordered: false }
    );


    return conversation

}
