import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
} from "../api/contacts.api";
import { discoverPeopleRequest, getPersonProfileRequest } from "../api/people.api";

const CACHE_TTL_MS = 60_000;

const requestError = (error) => ({
  message: error.message,
  code: error.code,
  status: error.status,
});

const buildQueryKey = ({ query = "", sort = "recommended" } = {}) => `${query}|${sort}`;

const isCacheExpired = (fetchedAt) => Date.now() - fetchedAt > CACHE_TTL_MS;

const createCachedListThunk = (typePrefix, requestFn, loadingKey, fetchedAtKey) =>
  createAsyncThunk(
    typePrefix,
    async (_, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.accessToken;
        const data = await requestFn(token);
        return { ...data, fetchedAt: Date.now() };
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    },
    {
      condition: (_, { getState }) => {
        const state = getState().people;
        return !state[loadingKey] && isCacheExpired(state[fetchedAtKey]);
      },
    }
  );

export const searchPeople = createAsyncThunk(
  "people/discover",
  async (values = {}, { getState, rejectWithValue, signal }) => {
    try {
      const token = getState().auth.accessToken;
      return await discoverPeopleRequest(values, token, signal);
    } catch (error) {
      return rejectWithValue(requestError(error));
    }
  },
  {
    condition: (values = {}, { getState }) => {
      const state = getState().people;
      if (state.loading) return false;
      return values.cursor
        ? values.cursor === state.nextCursor
        : state.loadedQuery !== buildQueryKey(values);
    },
  }
);

export const loadPerson = createAsyncThunk(
  "people/profile",
  async (userId, { getState, rejectWithValue, signal }) => {
    try {
      const token = getState().auth.accessToken;
      return await getPersonProfileRequest(userId, token, signal);
    } catch (error) {
      return rejectWithValue(requestError(error));
    }
  }
);

export const fetchContacts = createCachedListThunk(
  "people/contacts",
  getContactsRequest,
  "contactsLoading",
  "contactsFetchedAt"
);

export const fetchPendingContacts = createCachedListThunk(
  "people/pending",
  getPendingContactsRequest,
  "pendingLoading",
  "pendingFetchedAt"
);

export const fetchRejectedContacts = createCachedListThunk(
  "people/rejected",
  getRejectedContactsRequest,
  "rejectedLoading",
  "rejectedFetchedAt"
);

export const fetchBlockedUsers = createCachedListThunk(
  "people/blocked",
  getBlockedUsersRequest,
  "blockedLoading",
  "blockedFetchedAt"
);

const createUserActionThunk = (typePrefix, requestFn, { reapprove = false } = {}) =>
  createAsyncThunk(typePrefix, async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const data = await requestFn(userId, token, reapprove);
      return { userId, data };
    } catch (error) {
      return rejectWithValue(requestError(error));
    }
  });

export const connectPerson = createUserActionThunk("people/connect", connectContactRequest);
export const approvePerson = createUserActionThunk("people/approve", approveContactRequest);
export const reapprovePerson = createUserActionThunk("people/reapprove", approveContactRequest, {
  reapprove: true,
});
export const rejectPerson = createUserActionThunk("people/reject", rejectContactRequest);
export const cancelRequest = createUserActionThunk("people/cancel", cancelContactRequest);
export const removePerson = createUserActionThunk("people/remove", removeContactRequest);
export const blockPerson = createUserActionThunk("people/block", blockUserRequest);
export const unblockPerson = createUserActionThunk("people/unblock", unblockUserRequest);

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
  searchRequestId: null,
  profileRequestId: null,
};

const resetDiscoveryState = (state) => {
  state.results = [];
  state.nextCursor = null;
  state.loadedQuery = null;
  state.error = null;
};

const removeUserFromLists = (state, userId, { includeResults = false } = {}) => {
  state.contacts = state.contacts.filter((item) => item.id !== userId);
  state.pending = state.pending.filter((item) => item.id !== userId);
  if (includeResults) {
    state.results = state.results.filter((item) => item.id !== userId);
  }
};

const peopleSlice = createSlice({
  name: "people",
  initialState,
  reducers: {
    setPeopleQuery(state, action) {
      state.query = action.payload;
      resetDiscoveryState(state);
    },
    setPeopleSort(state, action) {
      state.sort = action.payload;
      resetDiscoveryState(state);
    },
    refreshPeople(state) {
      state.loadedQuery = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPeople.pending, (state, action) => {
        state.searchRequestId = action.meta.requestId;
        state.loading = true;
        state.discoveryLoadingMore = Boolean(action.meta.arg?.cursor);
        state.error = null;
      })
      .addCase(searchPeople.fulfilled, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;
        const { cursor } = action.meta.arg || {};
        state.results = cursor
          ? [...state.results, ...action.payload.items]
          : action.payload.items;
        state.nextCursor = action.payload.nextCursor;
        state.loadedQuery = buildQueryKey(action.meta.arg);
        state.loading = false;
        state.discoveryLoadingMore = false;
      })
      .addCase(searchPeople.rejected, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;
        if (action.meta.aborted) {
          state.loading = false;
          state.discoveryLoadingMore = false;
          return;
        }
        state.loading = false;
        state.discoveryLoadingMore = false;
        state.error = action.payload || { message: "Unable to load people." };
      })
      .addCase(loadPerson.pending, (state, action) => {
        state.profileRequestId = action.meta.requestId;
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(loadPerson.fulfilled, (state, action) => {
        if (state.profileRequestId !== action.meta.requestId) return;
        state.selected = action.payload;
        state.profileLoading = false;
      })
      .addCase(loadPerson.rejected, (state, action) => {
        if (state.profileRequestId !== action.meta.requestId) return;
        state.profileLoading = false;
        if (!action.meta.aborted) {
          state.profileError = action.payload || { message: "Unable to load this profile." };
        }
      })
      .addCase(fetchContacts.pending, (state) => {
        state.contactsLoading = true;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contacts = action.payload.items;
        state.contactsLoading = false;
        state.contactsFetchedAt = action.payload.fetchedAt;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.contactsLoading = false;
        state.contactsError = action.payload;
      })
      .addCase(fetchPendingContacts.pending, (state) => {
        state.pendingLoading = true;
      })
      .addCase(fetchPendingContacts.fulfilled, (state, action) => {
        state.pending = action.payload.items;
        state.pendingLoading = false;
        state.pendingFetchedAt = action.payload.fetchedAt;
      })
      .addCase(fetchPendingContacts.rejected, (state) => {
        state.pendingLoading = false;
      })
      .addCase(fetchRejectedContacts.pending, (state) => {
        state.rejectedLoading = true;
      })
      .addCase(fetchRejectedContacts.fulfilled, (state, action) => {
        state.rejected = action.payload.items;
        state.rejectedLoading = false;
        state.rejectedFetchedAt = action.payload.fetchedAt;
      })
      .addCase(fetchRejectedContacts.rejected, (state) => {
        state.rejectedLoading = false;
      })
      .addCase(fetchBlockedUsers.pending, (state) => {
        state.blockedLoading = true;
      })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.blocked = action.payload.items;
        state.blockedIds = action.payload.items.map((item) => item.id);
        state.blockedLoading = false;
        state.blockedFetchedAt = action.payload.fetchedAt;
      })
      .addCase(fetchBlockedUsers.rejected, (state) => {
        state.blockedLoading = false;
      })
      .addCase(connectPerson.fulfilled, (state, action) => {
        const { userId, data } = action.payload;
        const person = state.results.find((item) => item.id === userId);
        if (person) {
          person.relationshipStatus = data.status;
        }
        if (
          data.status === "accepted" &&
          person &&
          !state.contacts.some((item) => item.id === person.id)
        ) {
          state.contacts.unshift({ ...person, status: "accepted" });
        }
        if (
          data.status === "pending" &&
          person &&
          !state.pending.some((item) => item.id === person.id)
        ) {
          state.pending.push({ ...person, requestedByMe: true });
        }
      })
      .addCase(approvePerson.fulfilled, (state, action) => {
        const { userId } = action.payload;
        const item = state.pending.find((person) => person.id === userId);
        if (item) {
          state.contacts.unshift({ ...item, status: "accepted" });
        }
        state.pending = state.pending.filter((person) => person.id !== userId);
      })
      .addCase(rejectPerson.fulfilled, (state, action) => {
        state.pending = state.pending.filter((person) => person.id !== action.payload.userId);
      })
      .addCase(cancelRequest.fulfilled, (state, action) => {
        state.pending = state.pending.filter((person) => person.id !== action.payload.userId);
      })
      .addCase(removePerson.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter((person) => person.id !== action.payload.userId);
      })
      .addCase(blockPerson.fulfilled, (state, action) => {
        const { userId } = action.payload;
        if (!state.blockedIds.includes(userId)) {
          state.blockedIds.push(userId);
        }
        if (
          state.selected?.user?.id === userId &&
          !state.blocked.some((item) => item.id === userId)
        ) {
          state.blocked.push(state.selected.user);
        }
        removeUserFromLists(state, userId, { includeResults: true });
      })
      .addCase(unblockPerson.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.blockedIds = state.blockedIds.filter((item) => item !== userId);
        state.blocked = state.blocked.filter((item) => item !== userId);
      });
  },
});

export const { setPeopleQuery, setPeopleSort, refreshPeople } = peopleSlice.actions;
export default peopleSlice.reducer;