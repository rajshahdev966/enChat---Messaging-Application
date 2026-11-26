import { createSlice } from "@reduxjs/toolkit"

const storedAppearance = () => {
  try {
    return JSON.parse(localStorage.getItem("enchat:appearance") || "null")
      || { colorMode: "system", reduceMotion: false }
  } catch {
    return { colorMode: "system", reduceMotion: false }
  }
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: { appearance: storedAppearance() },
  reducers: {
    setAppearance(state, action) { state.appearance = { ...state.appearance, ...action.payload } },
  },
})

export const { setAppearance } = settingsSlice.actions
export default settingsSlice.reducer
