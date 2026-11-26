import mongoose from "mongoose";


const profileSchema = new mongoose.Schema({
    profilePrivacyOption: {
        type:String,
        enum: ["everyone", "contacts", "me"],
        default: "everyone",
    },
    profilePhoto: {
        filePath: {
            type: String,
            default: null,
        },
        profilePhotoPrivacyOption: {
            type: String,
            enum: ["everyone", "contacts", "me"],
            default: "everyone",
        }
    },
    bioPrivacyOption: {
        type: String,
        enum: ["everyone", "contacts", "me"],
        default: "everyone",
    },
    userCaptionPrivacyOption: {
        type: String,
        enum: ["everyone", "contacts", "me"],
        default: "everyone",
    },
    lastSeenPrivacy: {
        type: String,
        enum: ["everyone", "contacts", "me"],
        default: "contacts",
    },
    onlineStatusPrivacy: {
        type: String,
        enum: ["everyone", "contacts", "me"],
        default: "me",
    },
    interests: {
        type: [{ type: String, trim: true, maxlength: 40 }],
        default: [],
        validate: (items) => items.length <= 20,
    },
    bio: {
        type: String,
        maxLength: 500,
        default: null,
    }, 
    userCaption: {
        type: String,
        maxLength: 100,
        default: null,
    }
})


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxLength: 50,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter valid email address"]
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    refreshTokenHash: {
        type: String,
        select: false,
    },
    activeSessionId: {
        type: String,
        select: false,
    },
    passwordResetTokenHash: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    profile: {
       type: profileSchema,
       default: ()=> ({}),
    }
}, { timestamps: true })

userSchema.index({ "profile.profilePhoto.filePath": 1 }, { sparse: true })
userSchema.index({ "profile.profilePrivacyOption": 1, _id: 1 })


export const userModel = mongoose.model("users", userSchema)
