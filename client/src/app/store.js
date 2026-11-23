import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../modules/auth/state/authSlice"
import conversationReducer from "../modules/conversations/state/conversationSlice"
import peopleReducer from "../modules/people/state/peopleSlice"
import settingsReducer from "../modules/settings/state/settingsSlice"

export const store = configureStore({
  reducer: { auth: authReducer, conversations: conversationReducer, people: peopleReducer, settings: settingsReducer },
})
