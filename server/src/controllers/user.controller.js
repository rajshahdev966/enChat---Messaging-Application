import { discoverPeople, getVisiblePhotoUrl, getVisibleProfile } from "../services/user.service.js"

export const getSignedPhotoUrl = async (req, res) => {
    const { filePath } = req.query
    const data = await getVisiblePhotoUrl(req.auth.id, filePath)
    return res.status(200).json({ success: true, data })
}

export const getProfile = async (req, res) => {
    const data = await getVisibleProfile(req.auth.id, req.params.userId)
    return res.json({ success: true, data })
}

export const discover = async (req, res) => {
    const data = await discoverPeople(req.auth.id, {
        query: req.query.query || "",
        sort: req.query.sort || "recommended",
        limit: req.pagination.limit,
        cursor: req.query.cursor || null,
    })
    return res.json({ success: true, data })
}
