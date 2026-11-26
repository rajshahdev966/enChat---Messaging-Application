import AppRoutes from './routes/AppRoutes'
import AuthSession from './app/AuthSession'
import { useEffect } from "react"
import { useSelector } from "react-redux"
import SocketSession from "./app/SocketSession"

export default function App() {
  const appearance = useSelector((state) => state.settings.appearance)
  useEffect(() => {
    try { localStorage.setItem("enchat:appearance", JSON.stringify(appearance)) } catch { /* Storage may be disabled by the browser. */ }
    document.documentElement.dataset.reduceMotion = String(Boolean(appearance.reduceMotion))
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    document.documentElement.style.colorScheme = appearance.colorMode === "system"
      ? (media.matches ? "dark" : "light")
      : "light"
    const updateSystemMode = () => {
      if (appearance.colorMode === "system") document.documentElement.style.colorScheme = media.matches ? "dark" : "light"
    }
    media.addEventListener?.("change", updateSystemMode)
    return () => media.removeEventListener?.("change", updateSystemMode)
  }, [appearance])
  return <AuthSession><SocketSession /><AppRoutes /></AuthSession>
}
