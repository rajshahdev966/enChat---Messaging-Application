// Frontend fixtures only. No authentication or email delivery is performed.
export const demoProfile = { id: 'demo-user-001', displayName: 'Aarav Mehta', username: 'aarav.m', email: 'aarav.mehta@college.edu', bio: '', avatarUrl: null }
export const passwordRules = [
  { label: '8+ characters in length', test: value => value.length >= 8 },
  { label: 'At least one number (0-9)', test: value => /[0-9]/.test(value) },
  { label: 'At least one symbol (!, @, #, etc.)', test: value => /[^a-zA-Z0-9\s]/.test(value) },
]
