import { Router } from "express"
import {
    approvedContacts,
    approve,
    blockUser,
    blockedUsers,
    cancelRequest,
    connect,
    pendingContacts,
    reject,
    rejectedContacts,
    reapprove,
    remove,
    unblockUser,
} from "../controllers/contact.controller.js"
import { authentication } from "../middlewares/auth.middleware.js"
import { cursorPagination } from "../middlewares/pagination.middleware.js"

const router = Router()

router.use(authentication)

/** Start or respond to an existing reverse contact request. */
router.post("/connect/:userId", connect)
/** Accept a pending request from :userId. */
router.post("/approve/:userId", approve)
/** Re-approve a previously rejected request from :userId. */
router.patch("/approve/:userId", reapprove)
/** Reject a pending request from :userId. */
router.post("/reject/:userId", reject)
/** Cancel a pending request created by the authenticated user. */
router.delete("/request/:userId", cancelRequest)
/** Remove an approved contact while retaining its conversation history. */
router.delete("/:userId", remove)
/** Return approved contacts. */
router.get("/", cursorPagination(), approvedContacts)
/** Return incoming pending requests. */
router.get("/pending", cursorPagination(), pendingContacts)
/** Return rejected contact requests. */
router.get("/rejected", cursorPagination(), rejectedContacts)

export default router
