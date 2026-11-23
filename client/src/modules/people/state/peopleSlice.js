import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getMockPerson, searchMockPeople } from "../api/mockPeople"

export const searchPeople = createAsyncThunk("people/search", ({ query, cursor = 0 } = {}) => searchMockPeople(query, { cursor }))
export const loadPerson = createAsyncThunk("people/person", getMockPerson, {
  condition: (id, { getState }) => getState().people.selected?.id !== id,
})

const peopleSlice = createSlice({
  name: "people",
  initialState: { query: "", results: [], nextCursor: null, selected: null, blockedIds: ["u-vikram", "u-david"], loading: false, loadedQuery: null },
  reducers: {
    setPeopleQuery(state, action) { state.query = action.payload },
    appendBlocked(state, action) { if (!state.blockedIds.includes(action.payload)) state.blockedIds.push(action.payload) },
    removeBlocked(state, action) { state.blockedIds = state.blockedIds.filter((id) => id !== action.payload) },
    clearPeopleResults(state) { state.query = ""; state.results = []; state.nextCursor = null; state.loadedQuery = null },
  },
  extraReducers: (builder) => builder
    .addCase(searchPeople.pending, (state) => { state.loading = true })
    .addCase(searchPeople.fulfilled, (state, action) => {
      const { query, cursor = 0 } = action.meta.arg || {}
      state.results = cursor ? [...state.results, ...action.payload.items] : action.payload.items
      state.nextCursor = action.payload.nextCursor
      state.loadedQuery = query || ""
      state.loading = false
    })
    .addCase(searchPeople.rejected, (state) => { state.loading = false })
    .addCase(loadPerson.fulfilled, (state, action) => { state.selected = action.payload }),
})

export const { setPeopleQuery, appendBlocked, removeBlocked, clearPeopleResults } = peopleSlice.actions
export default peopleSlice.reducer
