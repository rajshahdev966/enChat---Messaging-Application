import {
    approveContact,
    cancelContactRequest,
    connectContact,
    getBlockedUsers,
    getContactList,
    createBlockForUser,
    rejectContact,
    removeBlockForUser,
    removeContact,
} from "../services/contact.service.js"

const list = (status) => async (req, res) => {
    const data = await getContactList(req.auth.id, status, req.pagination)
    return res.json({ success: true, data })
}

export const connect = async (req, res) => {
    const data = await connectContact(req.auth.id, req.params.userId)
    return res.status(201).json({ success: true, message: "Contact request sent.", data })
}

export const approve = async (req, res) => {
    const data = await approveContact(req.auth.id, req.params.userId)
    return res.json({ success: true, message: "Contact request approved.", data })
}

export const reapprove = async (req, res) => {
    const data = await approveContact(req.auth.id, req.params.userId, true)
    return res.json({ success: true, message: "Contact request approved.", data })
}

export const reject = async (req, res) => {
    const data = await rejectContact(req.auth.id, req.params.userId)
    return res.json({ success: true, message: "Contact request rejected.", data })
}

export const cancelRequest = async (req, res) => {
    const data = await cancelContactRequest(req.auth.id, req.params.userId)
    return res.json({ success: true, message: "Contact request cancelled.", data })
}

export const remove = async (req, res) => {
    const data = await removeContact(req.auth.id, req.params.userId)
    return res.json({ success: true, message: "Contact removed.", data })
}

export const approvedContacts = list("accepted")
export const pendingContacts = list("pending")
export const rejectedContacts = list("rejected")

export const blockUser = async (req, res) => {
    const data = await createBlockForUser(req.auth.id, req.params.userId)
    return res.status(201).json({ success: true, message: "User blocked.", data })
}

export const unblockUser = async (req, res) => {
    const data = await removeBlockForUser(req.auth.id, req.params.userId)
    return res.json({ success: true, message: "User unblocked.", data })
}

export const blockedUsers = async (req, res) => {
    const data = await getBlockedUsers(req.auth.id)
    return res.json({ success: true, data })
}
