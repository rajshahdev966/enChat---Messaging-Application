import { userModel } from "../models/auth.model.js"

export const findUserByEmailOrUsername = (email, username) =>
    userModel.findOne({ $or: [{ email }, { username }] }).lean()

export const findUserForLogin = (email) =>
    userModel.findOne({ email }).select("+passwordHash")

export const findUserForSession = (id) =>
    userModel.findById(id).select("+refreshTokenHash")

export const findUserForPasswordReset = (email) =>
    userModel.findOne({ email }).select("+passwordResetTokenHash +passwordResetExpires")

export const createUser = (values) => userModel.create(values)
export const deleteUser = (id) => userModel.findByIdAndDelete(id)
export const findPublicUserById = (id) =>
    userModel.findById(id)
        .select("name username profile.profilePrivacyOption profile.profilePhoto.filePath profile.profilePhoto.profilePhotoPrivacyOption profile.bio profile.userCaption")
        .lean()

export const findUserForProfile = (id) =>
    userModel.findById(id)
        .select("name username profile.profilePrivacyOption profile.profilePhoto.filePath profile.profilePhoto.profilePhotoPrivacyOption profile.bio profile.userCaption")

export const updateUserProfile = (id, profile) =>
    userModel.findByIdAndUpdate(id, {
        $set: Object.fromEntries(Object.entries(profile).map(([key, value]) => [`profile.${key}`, value])),
    }, {
        new: true,
        runValidators: true,
        strict: false,
        select: "name username profile.profilePrivacyOption profile.profilePhoto.filePath profile.profilePhoto.profilePhotoPrivacyOption profile.bio profile.userCaption",
    }).lean()


