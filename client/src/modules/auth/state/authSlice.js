import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
  updateProfileRequest,
  authenticatedRequest,
} from "../api/auth.api"

const rejectApiError = (error, rejectWithValue) => rejectWithValue({
  message: error.message,
  code: error.code,
  errors: error.errors,
  status: error.status,
})

export const registerUser = createAsyncThunk("auth/register", async (values, { rejectWithValue }) => {
  try { return (await registerRequest(values)).data }
  catch (error) { return rejectApiError(error, rejectWithValue) }
})

export const loginUser = createAsyncThunk("auth/login", async (values, { rejectWithValue }) => {
  try { return (await loginRequest(values)).data }
  catch (error) { return rejectApiError(error, rejectWithValue) }
})

export const refreshSession = createAsyncThunk("auth/refresh", async (_, { rejectWithValue }) => {
  try { return (await refreshRequest()).data }
  catch (error) { return rejectApiError(error, rejectWithValue) }
})

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try { await logoutRequest() }
  catch { /* Local session state is cleared even if the server is unavailable. */ }
})

export const saveProfile = createAsyncThunk("auth/saveProfile", async (values, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken
    return (await updateProfileRequest(values, token)).data
  } catch (error) { return rejectApiError(error, rejectWithValue) }
})

export const fetchCurrentUser = createAsyncThunk("auth/me", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken
    return (await authenticatedRequest("/auth/me", token)).data
  } catch (error) { return rejectApiError(error, rejectWithValue) }
})

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    profile: null,
    accessToken: null,
    initialized: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const authenticated = (state, action) => {
      state.loading = false
      state.initialized = true
      state.user = action.payload.user
      state.profile = action.payload.profile || action.payload.user?.profile || null
      state.accessToken = action.payload.accessToken
    }
    const rejected = (state, action) => {
      state.loading = false
      state.error = action.payload || { message: "Unable to complete the request.", errors: {} }
    }

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, authenticated)
      .addCase(registerUser.rejected, rejected)
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, authenticated)
      .addCase(loginUser.rejected, rejected)
      .addCase(refreshSession.fulfilled, authenticated)
      .addCase(refreshSession.rejected, (state, action) => {
        state.loading = false
        state.initialized = true
        if (!action.payload || action.payload.status === 401) {
          state.user = null
          state.profile = null
          state.accessToken = null
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.error = action.payload || null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.profile = null
        state.accessToken = null
        state.initialized = true
        state.error = null
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.profile = action.payload.profile || action.payload.user?.profile || null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.profile = action.payload.profile || action.payload.user?.profile || null
      })
  },
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
