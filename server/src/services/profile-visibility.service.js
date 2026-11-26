export const canViewField = (option, isContact) =>
    option === "everyone" || (option === "contacts" && isContact)

export const serializeProfileForViewer = (user, isContact = false) => {
    const profile = user.profile || {}
    const profileVisible = canViewField(profile.profilePrivacyOption || "everyone", isContact)
    if (!profileVisible) {
        return {
            profilePrivacyOption: profile.profilePrivacyOption || "everyone",
            bio: null,
            bioPrivacyOption: profile.bioPrivacyOption || "everyone",
            userCaption: null,
            userCaptionPrivacyOption: profile.userCaptionPrivacyOption || "everyone",
            interests: [],
            lastSeenPrivacy: profile.lastSeenPrivacy || "contacts",
            onlineStatusPrivacy: profile.onlineStatusPrivacy || "me",
            profilePhoto: { filePath: null, profilePhotoPrivacyOption: profile.profilePhoto?.profilePhotoPrivacyOption || "everyone" },
        }
    }

    const photoPrivacy = profile.profilePhoto?.profilePhotoPrivacyOption || "everyone"
    return {
        profilePrivacyOption: profile.profilePrivacyOption || "everyone",
        bio: canViewField(profile.bioPrivacyOption || "everyone", isContact) ? profile.bio || null : null,
        bioPrivacyOption: profile.bioPrivacyOption || "everyone",
        userCaption: canViewField(profile.userCaptionPrivacyOption || "everyone", isContact) ? profile.userCaption || null : null,
        userCaptionPrivacyOption: profile.userCaptionPrivacyOption || "everyone",
        interests: profile.interests || [],
        lastSeenPrivacy: profile.lastSeenPrivacy || "contacts",
        onlineStatusPrivacy: profile.onlineStatusPrivacy || "me",
        profilePhoto: {
            filePath: canViewField(photoPrivacy, isContact) ? profile.profilePhoto?.filePath || null : null,
            profilePhotoPrivacyOption: photoPrivacy,
        },
    }
}

export const serializeUserPreview = (user, isContact = false) => ({
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    profile: serializeProfileForViewer(user, isContact),
})
