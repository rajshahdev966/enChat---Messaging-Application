import { createSlice } from "@reduxjs/toolkit"
import { initialMockSettings } from "../api/mockSettings"

const settingsSlice = createSlice({
  name: "settings",
  initialState: { values: initialMockSettings },
  reducers: {
    updateSetting(state, action) { state.values[action.payload.key] = action.payload.value },
  },
})

export const { updateSetting } = settingsSlice.actions
export default settingsSlice.reducer
