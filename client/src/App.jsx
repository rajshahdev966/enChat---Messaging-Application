import AppRoutes from "./routes/AppRoutes";
import AuthSession from "./app/AuthSession";
import { useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import SocketSession from "./app/SocketSession";

export default function App() {
  const appearance = useSelector((state) => state.settings.appearance);
  useLayoutEffect(() => {
    try {
      localStorage.setItem("enchat:appearance", JSON.stringify(appearance));
    } catch {
      /* Storage may be disabled by the browser. */
    }
    document.documentElement.dataset.reduceMotion = String(
      Boolean(appearance.reduceMotion),
    );
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyColorMode = () => {
      const dark =
        appearance.colorMode === "dark" ||
        (appearance.colorMode === "system" && media.matches);
      document.documentElement.classList.toggle("theme-dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    applyColorMode();
    const updateSystemMode = () => {
      if (appearance.colorMode === "system") applyColorMode();
    };
    media.addEventListener?.("change", updateSystemMode);
    return () => media.removeEventListener?.("change", updateSystemMode);
  }, [appearance]);
  return (
    <AuthSession>
      <SocketSession />
      <AppRoutes />
    </AuthSession>
  );
}
