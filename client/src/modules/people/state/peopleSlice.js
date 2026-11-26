import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  approveContactRequest,
  blockUserRequest,
  cancelContactRequest,
  connectContactRequest,
  getBlockedUsersRequest,
  getContactsRequest,
  getPendingContactsRequest,
  getRejectedContactsRequest,
  rejectContactRequest,
  removeContactRequest,
  unblockUserRequest,
} from "../api/contacts.api"
import { discoverPeopleRequest, getPersonProfileRequest } from "../api/people.api"

const requestError = (error) => ({ message: error.message, code: error.code, status: error.status })

export const searchPeople = createAsyncThunk("people/discover", async (values = {}, { getState, rejectWithValue, signal }) => {
  try {
    const token = getState().auth.accessToken
    return await discoverPeopleRequest(values, token, signal)
  } catch (error) { return rejectWithValue(requestError(error)) }
}, { condition: (values = {}, { getState }) => {
  const state = getState().people
  if (state.loading) return false
  return values.cursor ? values.cursor === state.nextCursor : state.loadedQuery !== `${values.query || ""}|${values.sort || "recommended"}`
} })

export const loadPerson = createAsyncThunk("people/profile", async (userId, { getState, rejectWithValue, signal }) => {
  try { return await getPersonProfileRequest(userId, getState().auth.accessToken, signal) }
  catch (error) { return rejectWithValue(requestError(error)) }
})

export const fetchContacts = createAsyncThunk("people/contacts", async (_, { getState, rejectWithValue }) => {
  try { return { ...(await getContactsRequest(getState().auth.accessToken)), fetchedAt: Date.now() } }
  catch (error) { return rejectWithValue(requestError(error)) }
}, { condition: (_, { getState }) => {
  const state = getState().people
  return !state.contactsLoading && Date.now() - state.contactsFetchedAt > 60_000
} })
export const fetchPendingContacts = createAsyncThunk("people/pending", async (_, { getState, rejectWithValue }) => {
  try { return { ...(await getPendingContactsRequest(getState().auth.accessToken)), fetchedAt: Date.now() } }
  catch (error) { return rejectWithValue(requestError(error)) }
}, { condition: (_, { getState }) => {
  const state = getState().people
  return !state.pendingLoading && Date.now() - state.pendingFetchedAt > 60_000
} })
export const fetchRejectedContacts = createAsyncThunk("people/rejected", async (_, { getState, rejectWithValue }) => {
  try { return { ...(await getRejectedContactsRequest(getState().auth.accessToken)), fetchedAt: Date.now() } }
  catch (error) { return rejectWithValue(requestError(error)) }
}, { condition: (_, { getState }) => {
  const state = getState().people
  return !state.rejectedLoading && Date.now() - state.rejectedFetchedAt > 60_000
} })
export const fetchBlockedUsers = createAsyncThunk("people/blocked", async (_, { getState, rejectWithValue }) => {
  try { return { ...(await getBlockedUsersRequest(getState().auth.accessToken)), fetchedAt: Date.now() } }
  catch (error) { return rejectWithValue(requestError(error)) }
}, { condition: (_, { getState }) => {
  const state = getState().people
  return !state.blockedLoading && Date.now() - state.blockedFetchedAt > 60_000
} })

const userAction = (type, request, { reapprove = false } = {}) => createAsyncThunk(type, async (userId, { getState, rejectWithValue }) => {
  try { return { userId, data: await request(userId, getState().auth.accessToken, reapprove) } }
  catch (error) { return rejectWithValue(requestError(error)) }
})

export const connectPerson = userAction("people/connect", connectContactRequest)
export const approvePerson = userAction("people/approve", approveContactRequest)
export const reapprovePerson = userAction("people/reapprove", approveContactRequest, { reapprove: true })
export const rejectPerson = userAction("people/reject", rejectContactRequest)
export const cancelRequest = userAction("people/cancel", cancelContactRequest)
export const removePerson = userAction("people/remove", removeContactRequest)
export const blockPerson = userAction("people/block", blockUserRequest)
export const unblockPerson = userAction("people/unblock", unblockUserRequest)

const initialState = {
  query: "",
  sort: "recommended",
  results: [],
  nextCursor: null,
  selected: null,
  contacts: [],
  pending: [],
  rejected: [],
  blocked: [],
  blockedIds: [],
  loading: false,
  profileLoading: false,
  contactsLoading: false,
  pendingLoading: false,
  rejectedLoading: false,
  blockedLoading: false,
  contactsFetchedAt: 0,
  pendingFetchedAt: 0,
  rejectedFetchedAt: 0,
  blockedFetchedAt: 0,
  discoveryLoadingMore: false,
  error: null,
  profileError: null,
  contactsError: null,
  loadedQuery: null,
}

const peopleSlice = createSlice({
  name: "people",
  initialState,
  reducers: {
    setPeopleQuery(state, action) { state.query = action.payload; state.results = []; state.nextCursor = null; state.loadedQuery = null; state.error = null },
    setPeopleSort(state, action) { state.sort = action.payload; state.results = []; state.nextCursor = null; state.loadedQuery = null; state.error = null },
    refreshPeople(state) { state.loadedQuery = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPeople.pending, (state, action) => {
        state.searchRequestId = action.meta.requestId
        state.loading = true
        state.discoveryLoadingMore = Boolean(action.meta.arg?.cursor)
        state.error = null
      })
      .addCase(searchPeople.fulfilled, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return
        const { query = "", sort = "recommended", cursor } = action.meta.arg || {}
        state.results = cursor ? [...state.results, ...action.payload.items] : action.payload.items
        state.nextCursor = action.payload.nextCursor
        state.loadedQuery = `${query}|${sort}`
        state.loading = false
        state.discoveryLoadingMore = false
      })
      .addCase(searchPeople.rejected, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return
        if (action.meta.aborted) {
          if (state.searchRequestId === action.meta.requestId) state.loading = false
          return
        }
        state.loading = false
        state.discoveryLoadingMore = false
        state.error = action.payload || { message: "Unable to load people." }
      })
      .addCase(loadPerson.pending, (state, action) => { state.profileRequestId = action.meta.requestId; state.profileLoading = true; state.profileError = null })
      .addCase(loadPerson.fulfilled, (state, action) => {
        if (state.profileRequestId !== action.meta.requestId) return
        state.selected = action.payload
        state.profileLoading = false
      })
      .addCase(loadPerson.rejected, (state, action) => {
        if (state.profileRequestId !== action.meta.requestId) return
        state.profileLoading = false
        if (!action.meta.aborted) state.profileError = action.payload || { message: "Unable to load this profile." }
      })
      .addCase(fetchContacts.pending, (state) => { state.contactsLoading = true })
      .addCase(fetchContacts.fulfilled, (state, action) => { state.contacts = action.payload.items; state.contactsLoading = false; state.contactsFetchedAt = action.payload.fetchedAt })
      .addCase(fetchContacts.rejected, (state, action) => { state.contactsLoading = false; state.contactsError = action.payload })
      .addCase(fetchPendingContacts.pending, (state) => { state.pendingLoading = true })
      .addCase(fetchPendingContacts.fulfilled, (state, action) => { state.pending = action.payload.items; state.pendingLoading = false; state.pendingFetchedAt = action.payload.fetchedAt })
      .addCase(fetchPendingContacts.rejected, (state) => { state.pendingLoading = false })
      .addCase(fetchRejectedContacts.pending, (state) => { state.rejectedLoading = true })
      .addCase(fetchRejectedContacts.fulfilled, (state, action) => { state.rejected = action.payload.items; state.rejectedLoading = false; state.rejectedFetchedAt = action.payload.fetchedAt })
      .addCase(fetchRejectedContacts.rejected, (state) => { state.rejectedLoading = false })
      .addCase(fetchBlockedUsers.pending, (state) => { state.blockedLoading = true })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.blocked = action.payload.items
        state.blockedIds = action.payload.items.map((item) => item.id)
        state.blockedLoading = false
        state.blockedFetchedAt = action.payload.fetchedAt
      })
      .addCase(fetchBlockedUsers.rejected, (state) => { state.blockedLoading = false })
      .addCase(connectPerson.fulfilled, (state, action) => {
        const person = state.results.find((item) => item.id === action.payload.userId)
        if (person) person.relationshipStatus = action.payload.data.status
        if (action.payload.data.status === "accepted" && person && !state.contacts.some((item) => item.id === person.id)) {
          state.contacts.unshift({ ...person, status: "accepted" })
        }
        if (action.payload.data.status === "pending" && person && !state.pending.some((item) => item.id === person.id)) {
          state.pending.push({ ...person, requestedByMe: true })
        }
      })
      .addCase(approvePerson.fulfilled, (state, action) => {
        const item = state.pending.find((person) => person.id === action.payload.userId)
        if (item) state.contacts.unshift({ ...item, status: "accepted" })
        state.pending = state.pending.filter((person) => person.id !== action.payload.userId)
      })
      .addCase(rejectPerson.fulfilled, (state, action) => { state.pending = state.pending.filter((person) => person.id !== action.payload.userId) })
      .addCase(cancelRequest.fulfilled, (state, action) => { state.pending = state.pending.filter((person) => person.id !== action.payload.userId) })
      .addCase(removePerson.fulfilled, (state, action) => { state.contacts = state.contacts.filter((person) => person.id !== action.payload.userId) })
      .addCase(blockPerson.fulfilled, (state, action) => {
        const id = action.payload.userId
        if (!state.blockedIds.includes(id)) state.blockedIds.push(id)
        if (state.selected?.user?.id === id && !state.blocked.some((item) => item.id === id)) state.blocked.push(state.selected.user)
        state.contacts = state.contacts.filter((item) => item.id !== id)
        state.pending = state.pending.filter((item) => item.id !== id)
        state.results = state.results.filter((item) => item.id !== id)
      })
      .addCase(unblockPerson.fulfilled, (state, action) => {
        const id = action.payload.userId
        state.blockedIds = state.blockedIds.filter((item) => item !== id)
        state.blocked = state.blocked.filter((item) => item.id !== id)
      })
  },
})

export const { setPeopleQuery, setPeopleSort, refreshPeople } = peopleSlice.actions
export default peopleSlice.reducer
