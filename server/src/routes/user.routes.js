import {Router} from "express"
import { authentication } from "../middlewares/auth.middleware"
import { generatePrivateImageUrl } from "../services/storage.service"


const router = Router()


/**
 * @method GET
 * @path /api/user/photo
 * @description provides signed url to access photo on the application
 * @headers Authorization: Bearer <accessToken>
 * @body {filePath}
 */

router.get("/photo", authentication, (req, res)=> {
    const {filePath} = req.body
    const signedUrl = generatePrivateImageUrl(filePath)
    // Later on conditions will be 
    return res.status(200).json({
        imageUrl: signedUrl
    })
})


export default router