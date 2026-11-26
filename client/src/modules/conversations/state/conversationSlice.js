import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  listConversationsRequest,
  getConversationRequest,
  listMessagesRequest,
  markConversationReadRequest,
  openDirectConversationRequest,
} from "../api/conversation.api"
import { emitSocketEvent } from "../api/socketClient"

const requestError = (error) => ({ message: error.message, code: error.code, status: error.status })
const formatTime = (value) => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value))
const normalizeMessage = (message, userId) => ({
  id: message.id,
  clientMessageId: message.clientMessageId,
  sender: message.senderId === userId ? "me" : "them",
  senderId: message.senderId,
  text: message.message,
  time: formatTime(message.createdAt),
  createdAt: message.createdAt,
  status: "sent",
})
const normalizeConversation = (item) => ({
  id: item.id,
  type: item.type,
  userId: item.participant?.id,
  name: item.participant?.name || "Conversation",
  username: item.participant?.username || "",
  profile: item.participant?.profile || null,
  preview: item.lastMessage?.message || "Say hello to start a conversation.",
  lastMessage: item.lastMessage,
  time: item.updatedAt ? formatTime(item.updatedAt) : "",
  unreadCount: item.unreadCount || 0,
  online: false,
  canSendMessages: item.canSendMessages,
  isMuted: item.isMuted,
})

export const loadConversations = createAsyncThunk("conversations/load", async ({ cursor } = {}, { getState, rejectWithValue }) => {
  try {
    const data = await listConversationsRequest(getState().auth.accessToken, { cursor })
    return { ...data, cursor }
  } catch (error) { return rejectWithValue(requestError(error)) }
}, {
  condition: ({ cursor } = {}, { getState }) => {
    const state = getState().conversations
    return !state.loading && (cursor ? cursor === state.nextCursor : !state.loaded)
  },
})

export const openConversation = createAsyncThunk("conversations/open", async (person, { getState, rejectWithValue }) => {
  try {
    const data = await openDirectConversationRequest(person.id, getState().auth.accessToken)
    return { data, person }
  } catch (error) { return rejectWithValue(requestError(error)) }
})

export const loadConversation = createAsyncThunk("conversations/detail", async (conversationId, { getState, rejectWithValue, signal }) => {
  try {
    const data = await getConversationRequest(conversationId, getState().auth.accessToken, signal)
    return normalizeConversation(data)
  } catch (error) { return rejectWithValue(requestError(error)) }
}, { condition: (conversationId, { getState }) => {
  const state = getState().conversations
  return !state.items.some((item) => item.id === conversationId) && !state.conversationDetailsLoading?.[conversationId]
} })

export const loadMessages = createAsyncThunk("conversations/messages", async ({ conversationId, cursor = null }, { getState, rejectWithValue, signal }) => {
  try {
    const data = await listMessagesRequest(conversationId, getState().auth.accessToken, { cursor, signal })
    return { ...data, conversationId, cursor, currentUserId: getState().auth.user?.id }
  } catch (error) { return rejectWithValue(requestError(error)) }
}, {
  condition: ({ conversationId, cursor = null }, { getState }) => {
    const state = getState().conversations
    return !state.messagesLoading[conversationId] && (cursor ? cursor === state.messageCursors[conversationId] : !state.messagesLoaded[conversationId])
  },
})

export const markRead = createAsyncThunk("conversations/markRead", async (conversationId, { getState, rejectWithValue }) => {
  try { return await markConversationReadRequest(conversationId, getState().auth.accessToken) }
  catch (error) { return rejectWithValue(requestError(error)) }
})

export const sendMessage = createAsyncThunk("conversations/send", async (values, { rejectWithValue }) => {
  try {
    const data = await emitSocketEvent("message:send", {
      recipientId: values.recipientId,
      message: values.text,
      clientMessageId: values.clientMessageId,
    })
    return data
  } catch (error) { return rejectWithValue(requestError(error)) }
})

const conversationSlice = createSlice({
  name: "conversations",
  initialState: {
    items: [],
    messages: {},
    messageCursors: {},
    loaded: false,
    loading: false,
    messagesLoaded: {},
    messagesLoading: {},
    conversationDetailsLoading: {},
    filter: "all",
    statusFilter: "all",
    showUnreadOnly: false,
    unreadTotal: 0,
    error: null,
    messagesError: {},
  },
  reducers: {
    setConversationFilter(state, action) { state.filter = action.payload },
    setConversationStatus(state, action) { state.statusFilter = action.payload },
    toggleUnreadOnly(state) { state.showUnreadOnly = !state.showUnreadOnly },
    receiveMessage(state, action) {
      const { conversationId, message, currentUserId } = action.payload
      state.messages[conversationId] ||= []
      if (state.messages[conversationId].some((item) => item.id === message.id || item.clientMessageId === message.clientMessageId)) return
      state.messages[conversationId].push(normalizeMessage(message, currentUserId))
      const conversation = state.items.find((item) => item.id === conversationId)
      if (conversation) {
        conversation.preview = message.message
        conversation.lastMessage = message
        conversation.time = formatTime(message.createdAt)
        conversation.unreadCount = (conversation.unreadCount || 0) + 1
        state.unreadTotal += 1
      }
    },
  },
  extraReducers: (builder) => builder
    .addCase(loadConversations.pending, (state) => { state.loading = true; state.error = null })
    .addCase(loadConversations.fulfilled, (state, action) => {
      const items = action.payload.items.map(normalizeConversation)
      state.items = action.payload.cursor ? [...state.items, ...items] : items
      state.nextCursor = action.payload.nextCursor
      state.loaded = true
      state.loading = false
      const unreadOnPage = items.reduce((total, item) => total + item.unreadCount, 0)
      state.unreadTotal = action.payload.cursor ? state.unreadTotal + unreadOnPage : unreadOnPage
    })
    .addCase(loadConversations.rejected, (state, action) => { state.loading = false; state.error = action.payload })
    .addCase(openConversation.fulfilled, (state, action) => {
      const { data, person } = action.payload
      if (!state.items.some((item) => item.id === data.id)) {
        state.items.unshift({
          id: data.id,
          userId: person.id,
          name: person.name,
          username: person.username,
          profile: person.profile,
          type: data.type,
          preview: "Say hello to start a conversation.",
          time: "",
          unreadCount: 0,
          canSendMessages: true,
          local: true,
        })
      }
      state.messages[data.id] ||= []
      state.messagesLoaded[data.id] ||= false
    })
    .addCase(loadConversation.pending, (state, action) => { state.conversationDetailsLoading[action.meta.arg] = true })
    .addCase(loadConversation.fulfilled, (state, action) => {
      state.conversationDetailsLoading[action.meta.arg] = false
      if (!state.items.some((item) => item.id === action.payload.id)) state.items.unshift(action.payload)
    })
    .addCase(loadConversation.rejected, (state, action) => { state.conversationDetailsLoading[action.meta.arg] = false })
    .addCase(loadMessages.pending, (state, action) => { state.messagesLoading[action.meta.arg.conversationId] = true; state.messagesError[action.meta.arg.conversationId] = null })
    .addCase(loadMessages.fulfilled, (state, action) => {
      const { conversationId, cursor, items, nextCursor } = action.payload
      const userId = action.payload.currentUserId
      const normalized = items.map((item) => normalizeMessage(item, userId || ""))
      state.messages[conversationId] = cursor ? [...normalized, ...(state.messages[conversationId] || [])] : normalized
      state.messageCursors[conversationId] = nextCursor
      state.messagesLoaded[conversationId] = true
      state.messagesLoading[conversationId] = false
    })
    .addCase(loadMessages.rejected, (state, action) => { state.messagesLoading[action.meta.arg.conversationId] = false; state.messagesError[action.meta.arg.conversationId] = action.payload })
    .addCase(sendMessage.fulfilled, (state, action) => {
      const { conversationId, message } = action.payload
      const conversation = state.items.find((item) => item.id === conversationId)
      state.messages[conversationId] ||= []
      if (!state.messages[conversationId].some((item) => item.id === message.id || item.clientMessageId === message.clientMessageId)) {
        state.messages[conversationId].push(normalizeMessage(message, message.senderId))
      }
      if (conversation) { conversation.preview = message.message; conversation.lastMessage = message; conversation.time = formatTime(message.createdAt) }
    })
    .addCase(markRead.fulfilled, (state, action) => {
      const item = state.items.find((conversation) => conversation.id === action.payload.conversationId)
      if (item) {
        state.unreadTotal = Math.max(0, state.unreadTotal - item.unreadCount)
        item.unreadCount = 0
      }
    }),
})

export const { setConversationFilter, setConversationStatus, toggleUnreadOnly, receiveMessage } = conversationSlice.actions
export default conversationSlice.reducer
