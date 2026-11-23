import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getMockMessages, listMockConversations, mockConversations } from "../api/mockConversations"

export const loadConversations = createAsyncThunk("conversations/load", listMockConversations, {
  condition: (_, { getState }) => !getState().conversations.loaded && !getState().conversations.loading,
})
export const loadMessages = createAsyncThunk("conversations/messages", getMockMessages, {
  condition: (id, { getState }) => !getState().conversations.messagesLoaded[id] && !getState().conversations.messagesLoading[id],
})

const conversationSlice = createSlice({
  name: "conversations",
  initialState: { items: [], messages: {}, loaded: false, loading: false, messagesLoaded: {}, messagesLoading: {}, filter: "all", statusFilter: "all", showUnreadOnly: false, unreadTotal: 0 },
  reducers: {
    setConversationFilter(state, action) { state.filter = action.payload },
    setConversationStatus(state, action) { state.statusFilter = action.payload },
    toggleUnreadOnly(state) { state.showUnreadOnly = !state.showUnreadOnly },
    markConversationRead(state, action) {
      const item = state.items.find((conversation) => conversation.id === action.payload)
      if (item) { state.unreadTotal -= item.unreadCount || 0; item.unreadCount = 0 }
    },
    sendLocalMessage(state, action) {
      const { conversationId, text } = action.payload
      state.messages[conversationId] ||= []
      state.messages[conversationId].push({ id: `local-${Date.now()}`, sender: "me", text, time: "Now", status: "sending" })
      const item = state.items.find((conversation) => conversation.id === conversationId)
      if (item) { item.preview = text; item.time = "Now" }
    },
    startConversation(state, action) {
      const person = action.payload
      const id = person.id.replace(/^u-/, "")
      if (!state.items.some((item) => item.id === id)) {
        state.items.unshift({ id, userId: person.id, name: person.name, username: person.username, avatarUrl: person.avatarUrl, type: "personal", preview: "Say hello to start a conversation.", time: "Now", unreadCount: 0, online: person.status === "online", local: true })
        if (!mockConversations.some((item) => item.id === id)) {
          state.messages[id] = []
          state.messagesLoaded[id] = true
        }
      }
    },
  },
  extraReducers: (builder) => builder
    .addCase(loadConversations.pending, (state) => { state.loading = true })
    .addCase(loadConversations.fulfilled, (state, action) => {
      const loadedIds = new Set(action.payload.map((item) => item.id))
      const localOnly = state.items.filter((item) => item.local && !loadedIds.has(item.id))
      state.items = [...localOnly, ...action.payload]
      state.loaded = true
      state.loading = false
      state.unreadTotal = action.payload.reduce((total, item) => total + item.unreadCount, 0)
    })
    .addCase(loadConversations.rejected, (state) => { state.loading = false })
    .addCase(loadMessages.pending, (state, action) => { state.messagesLoading[action.meta.arg] = true })
    .addCase(loadMessages.fulfilled, (state, action) => {
      state.messages[action.meta.arg] = action.payload
      state.messagesLoaded[action.meta.arg] = true
      state.messagesLoading[action.meta.arg] = false
    })
    .addCase(loadMessages.rejected, (state, action) => { state.messagesLoading[action.meta.arg] = false }),
})

export const { setConversationFilter, setConversationStatus, toggleUnreadOnly, markConversationRead, sendLocalMessage, startConversation } = conversationSlice.actions
export default conversationSlice.reducer
