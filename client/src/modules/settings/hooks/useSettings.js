import { useDispatch, useSelector } from "react-redux"
import { saveProfile } from "../../auth/state/authSlice"

export function useSettings() {
  const dispatch = useDispatch()
  const values = useSelector((state) => state.auth.profile || {})
  const saving = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)
  return { values, saving, error, setSetting: (key, value) => dispatch(saveProfile({ [key]: value })) }
}
