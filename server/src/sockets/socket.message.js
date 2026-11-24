import mongoose from "mongoose"
import { createSocketError } from "../middlewares/error.middleware"
import { userModel } from "../models/auth.model";
import blockModel from "../models/block.model";
import contactModel from "../models/contact.model";
import { getOrCreateDirectConversation } from "./socket.conversation";
import messageModel from "../models/message.model";
import conversationsModel from "../models/conversation.model";



export const sendDirectMessage = async ({ senderId,
    recipientId,
    message,
    clientMessageId, }) => {

    if (!mongoose.isValidObjectId(recipientId)) {
        throw createSocketError("INVALID_RECIPIENT")
    }

    if (!message || typeof message !== "string" || !message.trim()) {
        throw createSocketError("INVALID_MESSAGE", "Message cannot be empty");
    }

    if (message.length > 4000) {
        throw createSocketError("MESSAGE_TOO_LONG");
    }

    if (!clientMessageId || typeof clientMessageId !== "string") {
        throw createSocketError("INVALID_MESSAGE_ID");
    }


    const recipientExist = await userModel.exists({ _id: recipientId })


    if (!recipientExist) {
        throw createSocketError("INVALID_RECIPIENT")
    }

    const blocked = await blockModel.exists({
        $or: [
            { blockerId: recipientId, blockedId: senderId },
            { blockedId: recipientId, blockerId: senderId }
        ]
    })

    if (blocked) {
        throw createSocketError("")
    }

    const isContact = await contactModel.exists({
        status: "accepted",
        $or: [
            { senderId: senderId, receiverId: recipientId },
            { senderId: recipientId, receiverId: senderId }
        ]
    })

    if (!isContact) {
        throw createSocketError("MESSAGE_NOT_ALLOWED")
    }

    const conversation = getOrCreateDirectConversation(senderId, recipientId)

    let savedMessage = await messageModel.findOne({ senderId, clientMessageId })

    if (savedMessage) {
        if (savedMessage.conversationId.toString() !==
            conversation._id.toString()) {
            throw createSocketError("INVALID_MESSAGE_ID")
        }
    } else {
        try {
            savedMessage = await messageModel.create({
                conversationId: conversation._id,
                senderId,
                clientMessageId,
                message: message.trim(),
            });
        } catch (error) {
            // A retry may have raced with the original request
            if (error.code !== 11000) throw error;

            savedMessage = await messageModel.findOne({
                senderId,
                clientMessageId,
            });

            if (!savedMessage) throw error;
        }
    }

    await conversationsModel.updateOne(
        {
            _id: conversation._id,
            $or: [
                { lastMessageAt: null },
                { lastMessageAt: { $lte: savedMessage.createdAt } },
            ],
        },
        {
            $set: {
                lastMessageId: savedMessage._id,
                lastMessageAt: savedMessage.createdAt,
            },
        }
    );


    return {
        conversation,
        message: savedMessage,
        recipientId: recipientId.toString()
    }


}