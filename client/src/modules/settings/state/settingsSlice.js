import { createSlice } from "@reduxjs/toolkit"

const storedAppearance = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("enchat:appearance") || "null") || {}
    return {
      colorMode: ["light", "dark", "system"].includes(stored.colorMode) ? stored.colorMode : "system",
      reduceMotion: Boolean(stored.reduceMotion),
    }
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
