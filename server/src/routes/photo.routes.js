import { Router } from "express"
import { discover, getProfile, getSignedPhotoUrl } from "../controllers/user.controller.js"
import { authentication } from "../middlewares/auth.middleware.js"
import { cursorPagination } from "../middlewares/pagination.middleware.js"


const router = Router()


/**
 * @method GET
 * @path /api/user/photo?filePath=/enChat_dev/profile.jpg
 * @description Return a short-lived signed URL for a private ImageKit image.
 * @headers Authorization: Bearer <accessToken>
 * @query filePath
 */
router.get("/photo", authentication, getSignedPhotoUrl)
router.get("/discover", authentication, cursorPagination({ defaultLimit: 20, maxLimit: 50, validateCursor: false }), discover)
router.get("/:userId/profile", authentication, getProfile)

export default router
