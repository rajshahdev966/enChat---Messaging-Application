import { Router } from "express"
import {
    forgotPassword,
    login,
    logout,
    me,
    refresh,
    register,
    resetPassword,
    setupProfile,
    verifyResetCode,
} from "../controllers/auth.controller.js"
import { authentication } from "../middlewares/auth.middleware.js"
import {
    forgotPasswordValidator,
    loginValidator,
    registerValidator,
    resetPasswordValidator,
    verifyResetCodeValidator,
    profileSetupValidator,
} from "../validators/auth.validator.js"
import { uploadProfilePhoto } from "../middlewares/profile-upload.middleware.js"

const routes = Router()

/**
 * @method POST
 * @path /api/auth/register
 * @description Create an account, issue a 15-minute access token, and set a rotating HTTP-only refresh cookie.
 * @body { name, email, username, password }
 * @returns { user, accessToken }
 */
routes.post("/register", registerValidator, register)

/**
 * @method POST
 * @path /api/auth/login
 * @description Authenticate an account and start a new session.
 * @body { email, password }
 * @returns { user, accessToken }
 */
routes.post("/login", loginValidator, login)

/**
 * @method POST
 * @path /api/auth/refresh
 * @description Rotate the HTTP-only refresh cookie and return a fresh access token.
 * @cookie refreshToken
 * @returns { user, accessToken }
 */
routes.post("/refresh", refresh)

/**
 * @method POST
 * @path /api/auth/logout
 * @description Revoke the current refresh token and clear its cookie.
 */
routes.post("/logout", logout)

/**
 * @method POST
 * @path /api/auth/forgot-password
 * @description Create a 6-digit password-reset code valid for 10 minutes.
 * @body { email }
 */
routes.post("/forgot-password", forgotPasswordValidator, forgotPassword)

/**
 * @method POST
 * @path /api/auth/verify-reset-code
 * @description Verify a password-reset code before showing the new-password step.
 * @body { email, code }
 */
routes.post("/verify-reset-code", verifyResetCodeValidator, verifyResetCode)

/**
 * @method POST
 * @path /api/auth/reset-password
 * @description Replace the password and revoke all existing refresh sessions.
 * @body { email, code, password }
 */
routes.post("/reset-password", resetPasswordValidator, resetPassword)

/**
 * @method GET
 * @path /api/auth/me
 * @description Return the authenticated user's public account data.
 * @header Authorization: Bearer <accessToken>
 */
routes.get("/me", authentication, me)

/**
 * @method PATCH
 * @path /api/auth/profile
 * @description Save the authenticated user's profile fields and optional private ImageKit photo URL.
 * @header Authorization: Bearer <accessToken>
 * @body multipart/form-data: bio, userCaption, privacyOption, profilePhoto (optional, max 500 KB), removeProfilePhoto (optional boolean)
 */
routes.patch("/profile", authentication, uploadProfilePhoto, profileSetupValidator, setupProfile)

export default routes
