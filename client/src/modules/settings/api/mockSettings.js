export const initialMockSettings = {
  profilePrivacyOption: "everyone",
  profilePhotoPrivacyOption: "everyone",
  bioPrivacyOption: "everyone",
  lastSeenPrivacy: "contacts",
  onlineStatusPrivacy: "me",
  readReceipts: false,
  discoverableByUsername: true,
  notificationsMuted: false,
  disappearingMessages: "24 hours",
  quietHours: "22:00 – 07:30",
  reportRecentMessages: false,
}

export async function getMockSettings() { return { ...initialMockSettings } }
