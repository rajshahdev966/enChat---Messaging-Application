import { Router } from "express"
import {
    allConversations,
    conversationMessages,
    conversationDetails,
    directConversation,
    directConversations,
    groupConversations,
    markRead,
} from "../controllers/conversation.controller.js"
import { authentication } from "../middlewares/auth.middleware.js"
import { cursorPagination } from "../middlewares/pagination.middleware.js"

const router = Router()
router.use(authentication)

/** Open or restore a direct conversation with an approved contact. */
router.post("/direct/:userId", directConversation)
/** Read older messages in a stable, newest-page cursor sequence. */
router.get("/messages/:conversationId", cursorPagination({ defaultLimit: 30, maxLimit: 100 }), conversationMessages)
/** Mark the latest message as read for the authenticated member. */
router.post("/:conversationId/read", markRead)
/** List direct conversations for the authenticated user. */
router.get("/direct", cursorPagination({ validateCursor: false }), directConversations)
/** List group conversations for the authenticated user. */
router.get("/group", cursorPagination({ validateCursor: false }), groupConversations)
/** List all conversations for the authenticated user. */
router.get("/all", cursorPagination({ validateCursor: false }), allConversations)
/** Return one conversation available to the authenticated member. */
router.get("/:conversationId", conversationDetails)

export default router
