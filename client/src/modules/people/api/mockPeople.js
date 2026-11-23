const avatar = (id) => `https://i.pravatar.cc/160?img=${id}`

const person = ({ id, name, username, avatarId, userCaption = "", bio = "", status, connection, sharedGroups = 0, profilePrivacyOption = "everyone", profilePhotoPrivacyOption = "everyone" }) => ({
  id,
  name,
  username,
  avatarUrl: avatar(avatarId),
  status,
  connection,
  sharedGroups,
  profile: {
    profilePrivacyOption,
    bio,
    userCaption,
    profilePhoto: { filePath: `/enChat_dev/mock-${id}.jpg`, profilePhotoPrivacyOption },
  },
})

// Fixture records deliberately mirror the user.profile schema returned by profile APIs.
export const mockPeople = [
  person({ id: "u-aarav", name: "Aarav Mehta", username: "aarav.m", avatarId: 12, userCaption: "Interaction designer", bio: "Curious about people, places, and the small details that make a day feel special.", status: "online", connection: true, sharedGroups: 2 }),
  person({ id: "u-ananya", name: "Ananya Shah", username: "ananya.s", avatarId: 44, userCaption: "Architecture student & slow living advocate", bio: "Designing spaces that breathe.", status: "online", connection: true, sharedGroups: 2 }),
  person({ id: "u-mum", name: "Mum", username: "mum", avatarId: 47, userCaption: "A little note from home", status: "online", connection: true, profilePrivacyOption: "contacts", profilePhotoPrivacyOption: "contacts" }),
  person({ id: "u-rohan", name: "Rohan Patel", username: "rohan_p", avatarId: 13, userCaption: "Coffee, code, repeat", bio: "Building thoughtful things.", status: "last seen yesterday", connection: true, sharedGroups: 1 }),
  person({ id: "u-priya", name: "Priya Sharma", username: "priya.sharma", avatarId: 25, userCaption: "Kindness, with a little curiosity.", status: "last seen recently", connection: true }),
  person({ id: "u-kavi", name: "Kavi Verma", username: "kavi_v", avatarId: 49, userCaption: "Slow mornings and good books", status: "offline", connection: true, sharedGroups: 1, profilePrivacyOption: "contacts" }),
  person({ id: "u-dev", name: "Dev Malhotra", username: "dev.m", avatarId: 68, userCaption: "Here for the good conversations", status: "online", connection: false }),
  person({ id: "u-vikram", name: "Vikram Malhotra", username: "vikram.m", avatarId: 60, status: "last seen Oct 14", connection: false }),
  person({ id: "u-david", name: "David Miller", username: "david.m", avatarId: 15, status: "last seen Sep 28", connection: false }),
]

export async function searchMockPeople(query = "", { cursor = 0, limit = 20 } = {}) {
  const value = query.trim().toLowerCase()
  const matches = mockPeople.filter((item) => !value || item.name.toLowerCase().includes(value) || item.username.toLowerCase().includes(value) || item.id.toLowerCase() === value)
  return { items: matches.slice(cursor, cursor + limit), nextCursor: cursor + limit < matches.length ? cursor + limit : null }
}

export async function getMockPerson(id) {
  return mockPeople.find((item) => item.id === id || item.username === id) || null
}
