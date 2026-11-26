import { userModel } from "../models/auth.model.js"

export const findUserPreview = (id) => userModel.findById(id)
    .select("name username profile")
    .lean()

export const findUserPreviews = (ids) => userModel.find({ _id: { $in: ids } })
    .select("name username profile")
    .lean()

export const findActiveSession = (id) => userModel.findById(id)
    .select("+activeSessionId")
    .lean()

export const findDiscoveryCandidates = (pipeline) => userModel.aggregate(pipeline)

export const findPhotoOwnerByPath = (filePath) => userModel.findOne({ "profile.profilePhoto.filePath": filePath })
    .select("name username profile.profilePrivacyOption profile.profilePhoto.filePath profile.profilePhoto.profilePhotoPrivacyOption profile.bio profile.bioPrivacyOption profile.userCaption profile.userCaptionPrivacyOption profile.interests")
    .lean()

export const findContactProfile = (id) => userModel.findById(id)
    .select("name username profile.profilePrivacyOption profile.profilePhoto.filePath profile.profilePhoto.profilePhotoPrivacyOption profile.bio profile.bioPrivacyOption profile.userCaption profile.userCaptionPrivacyOption profile.interests")
    .lean()

export const findViewerInterests = (id) => userModel.findById(id).select("profile.interests").lean()
