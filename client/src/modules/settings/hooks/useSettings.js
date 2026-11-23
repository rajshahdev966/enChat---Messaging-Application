import { useDispatch, useSelector } from "react-redux"
import { updateSetting } from "../state/settingsSlice"

export function useSettings() {
  const dispatch = useDispatch()
  const values = useSelector((state) => state.settings.values)
  return { values, setSetting: (key, value) => dispatch(updateSetting({ key, value })) }
}
