import mongoose from "mongoose";


const profileSchema = new mongoose.Schema({
    privacyOption: {
        type:String,
        enum: ["everyone", "contacts", "me"],
        default: "everyone",
    },
    profilePhoto: {
        type: String,
        default: null,
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


export const userModel = mongoose.model("users", userSchema)
