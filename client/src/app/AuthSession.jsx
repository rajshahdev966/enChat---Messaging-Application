import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { refreshSession } from "../modules/auth/state/authSlice"

const REFRESH_INTERVAL = 14 * 60 * 1000

export default function AuthSession({ children }) {
  const dispatch = useDispatch()
  const refreshing = useRef(false)

  useEffect(() => {
    let interval
    const refreshWhenActive = async () => {
      if (refreshing.current) return
      refreshing.current = true
      try { await dispatch(refreshSession()) }
      finally { refreshing.current = false }
    }
    const scheduleVisibleRefresh = () => {
      window.clearInterval(interval)
      interval = undefined
      if (document.visibilityState === "visible") {
        refreshWhenActive()
        interval = window.setInterval(refreshWhenActive, REFRESH_INTERVAL)
      }
    }
    const refreshBeforeInactive = () => {
      window.clearInterval(interval)
      interval = undefined
      refreshWhenActive()
    }
    const handleHidden = () => {
      if (document.visibilityState === "hidden") refreshBeforeInactive()
    }
    const handleFreeze = () => {
      window.clearInterval(interval)
      interval = undefined
      refreshWhenActive()
    }
    const handleResume = () => scheduleVisibleRefresh()

    scheduleVisibleRefresh()
    // document.addEventListener("visibilitychange", scheduleVisibleRefresh)
    // document.addEventListener("visibilitychange", handleHidden)
    document.addEventListener("freeze", handleFreeze)
    document.addEventListener("resume", handleResume)
    window.addEventListener("pageshow", handleResume)

    return () => {
      window.clearInterval(interval)
      // document.removeEventListener("visibilitychange", scheduleVisibleRefresh)
      // document.removeEventListener("visibilitychange", handleHidden)
      document.removeEventListener("freeze", handleFreeze)
      document.removeEventListener("resume", handleResume)
      window.removeEventListener("pageshow", handleResume)
    }
  }, [dispatch])

  return children
}
