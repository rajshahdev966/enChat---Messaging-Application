import { Router } from "express"
import { getSignedPhotoUrl } from "../controllers/user.controller.js"
import { authentication } from "../middlewares/auth.middleware.js"


const router = Router()


/**
 * @method GET
 * @path /api/user/photo?filePath=/enChat_dev/profile.jpg
 * @description Return a short-lived signed URL for a private ImageKit image.
 * @headers Authorization: Bearer <accessToken>
 * @query filePath
 */
router.get("/photo", authentication, getSignedPhotoUrl)

export default router
