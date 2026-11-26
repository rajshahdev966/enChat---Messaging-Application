import { Router } from "express"
import { blockUser, blockedUsers, unblockUser } from "../controllers/contact.controller.js"
import { authentication } from "../middlewares/auth.middleware.js"

const router = Router()
router.use(authentication)
router.get("/", blockedUsers)
router.post("/:userId", blockUser)
router.delete("/:userId", unblockUser)

export default router
