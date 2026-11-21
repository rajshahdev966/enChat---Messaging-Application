import AppRoutes from './routes/AppRoutes'
import AuthSession from './app/AuthSession'

export default function App() {
  return <AuthSession><AppRoutes /></AuthSession>
}
