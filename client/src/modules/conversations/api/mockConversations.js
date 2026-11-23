const avatar = (id) => `https://i.pravatar.cc/160?img=${id}`

export const mockConversations = [
  { id: "aarav", userId: "u-aarav", name: "Aarav Mehta", username: "aarav.m", avatarUrl: avatar(12), type: "personal", preview: "Let's meet after college?", time: "11:42 AM", unreadCount: 2, online: true, pinned: true },
  { id: "mum", userId: "u-mum", name: "Mum", username: "mum", avatarUrl: avatar(47), type: "personal", preview: "Have you reached home?", time: "10:15 AM", unreadCount: 0, online: false },
  { id: "weekend", userId: "g-weekend", name: "The Weekend Club", username: "", avatarUrl: avatar(32), type: "group", preview: "Rohan: Who's coming on Sunday?", time: "08:30 AM", unreadCount: 5, online: false },
  { id: "ananya", userId: "u-ananya", name: "Ananya Shah", username: "ananya.s", avatarUrl: avatar(44), type: "personal", preview: "That sounds like a plan!", time: "Yesterday", unreadCount: 0, online: false },
  { id: "project", userId: "g-project", name: "Project Team", username: "", avatarUrl: null, type: "group", preview: "I've shared the updated notes.", time: "Yesterday", unreadCount: 0, online: false },
  { id: "rohan", userId: "u-rohan", name: "Rohan Patel", username: "rohan_p", avatarUrl: avatar(13), type: "personal", preview: "typing…", time: "Tuesday", unreadCount: 0, online: true, typing: true },
]

const baseMessages = {
  aarav: [
    { id: "m1", sender: "them", text: "Hey! Did you get a chance to go through the notes from morning lecture?", time: "10:14 AM" },
    { id: "m2", sender: "them", text: "The prof mentioned the submission deadline is moved to Friday.", time: "10:15 AM" },
    { id: "m3", sender: "me", text: "Yes! Just finished reading them. The interaction design case study is super thorough.", time: "10:16 AM", status: "read" },
    { id: "m4", sender: "me", text: "Let's meet after college near the campus library cafe to finalize our slides?", time: "10:18 AM", status: "delivered" },
    { id: "m5", sender: "them", text: "That sounds perfect! Let's say 4:30 PM? I'll bring the printed notes.", time: "10:20 AM" },
    { id: "m6", sender: "them", text: "This message was deleted.", time: "10:21 AM", deleted: true },
    { id: "m7", sender: "me", text: "See you in a bit!", time: "10:22 AM", status: "sending" },
  ],
  mum: [{ id: "mum1", sender: "them", text: "Have you reached home?", time: "10:15 AM" }],
  weekend: [{ id: "w1", sender: "them", text: "Rohan: Who's coming on Sunday?", time: "08:30 AM" }],
  ananya: [{ id: "a1", sender: "me", text: "That sounds like a plan!", time: "Yesterday", status: "read" }],
  project: [{ id: "p1", sender: "them", text: "I've shared the updated notes.", time: "Yesterday" }],
  rohan: [{ id: "r1", sender: "them", text: "typing…", time: "Tuesday" }],
}

export const listMockConversations = async () => mockConversations.map((item) => ({ ...item }))
export const getMockMessages = async (conversationId) => (baseMessages[conversationId] || []).map((item) => ({ ...item }))
