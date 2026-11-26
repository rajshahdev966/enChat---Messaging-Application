import { body, validationResult } from "express-validator"
import { ApiError } from "../utils/ApiError.js"

const emailPattern = /^\S+@\S+\.\S+$/
const usernamePattern = /^[a-zA-Z0-9_.]{3,24}$/
const passwordPattern = /^(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,}$/

const validate = (req, _res, next) => {
    const result = validationResult(req)
    if (result.isEmpty()) return next()

    const errors = {}
    for (const error of result.array({ onlyFirstError: true })) {
        errors[error.path] = error.msg
    }
    next(new ApiError({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        errors,
    }))
}

const email = () => body("email")
    .trim()
    .toLowerCase()
    .notEmpty().withMessage("Email is required.")
    .bail()
    .matches(emailPattern).withMessage("Enter a valid email address.")

const password = () => body("password")
    .isString().withMessage("Password is required.")
    .bail()
    .matches(passwordPattern)
    .withMessage("Use 8+ characters with at least one number and one symbol.")

export const registerValidator = [
    body("name").trim().isLength({ min: 2, max: 50 })
        .withMessage("Name must contain 2-50 characters."),
    email(),
    body("username").trim().toLowerCase().matches(usernamePattern)
        .withMessage("Use 3-24 letters, numbers, dots or underscores."),
    password(),
    validate,
]

export const loginValidator = [
    email(),
    body("password").isString().notEmpty().withMessage("Password is required."),
    validate,
]

export const forgotPasswordValidator = [email(), validate]

export const verifyResetCodeValidator = [
    email(),
    body("code").matches(/^\d{6}$/).withMessage("Enter the 6-digit reset code."),
    validate,
]

export const resetPasswordValidator = [
    email(),
    body("code").matches(/^\d{6}$/).withMessage("Enter the 6-digit reset code."),
    password(),
    validate,
]

export const profileSetupValidator = [
    body("bio").optional().isString().withMessage("Bio must be text.")
        .bail().isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters."),
    body("userCaption").optional().isString().withMessage("Caption must be text.")
        .bail().isLength({ max: 100 }).withMessage("Caption cannot exceed 100 characters."),
    body("profilePrivacyOption").optional().isIn(["everyone", "contacts", "me"])
        .withMessage("Choose everyone, contacts, or me for profile visibility."),
    body("profilePhotoPrivacyOption").optional().isIn(["everyone", "contacts", "me"])
        .withMessage("Choose everyone, contacts, or me for photo visibility."),
    body("bioPrivacyOption").optional().isIn(["everyone", "contacts", "me"])
        .withMessage("Choose everyone, contacts, or me for bio visibility."),
    body("userCaptionPrivacyOption").optional().isIn(["everyone", "contacts", "me"])
        .withMessage("Choose everyone, contacts, or me for caption visibility."),
    body("lastSeenPrivacy").optional().isIn(["everyone", "contacts", "me"])
        .withMessage("Choose everyone, contacts, or me for last-seen visibility."),
    body("onlineStatusPrivacy").optional().isIn(["everyone", "contacts", "me"])
        .withMessage("Choose everyone, contacts, or me for online-status visibility."),
    body("interests").optional().isString().withMessage("Interests must be a JSON list.")
        .bail().custom((value) => {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) && parsed.length <= 20
                && parsed.every((item) => typeof item === "string" && item.trim().length > 0 && item.trim().length <= 40)
        }).withMessage("Choose up to 20 interests, each no longer than 40 characters."),
    body("removeProfilePhoto").optional().isIn(["true", "false"])
        .withMessage("Photo removal value must be true or false."),
    validate,
]
