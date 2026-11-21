import { Navigate, useLocation } from "react-router"
import { useSelector } from "react-redux"

function SessionLoader() {
  return <main className="grid min-h-svh place-items-center text-body-sm">Restoring your private session…</main>
}

export function ProtectedRoute({ children }) {
  const { initialized, accessToken } = useSelector((state) => state.auth)
  const location = useLocation()
  if (!initialized) return <SessionLoader />
  if (!accessToken) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  return children
}

export function PublicOnlyRoute({ children }) {
  const { initialized, accessToken } = useSelector((state) => state.auth)
  if (!initialized) return <SessionLoader />
  if (accessToken) return <Navigate to="/app" replace />
  return children
}
