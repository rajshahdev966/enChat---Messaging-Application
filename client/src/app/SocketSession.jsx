import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser } from "../modules/auth/state/authSlice"
import { receiveMessage } from "../modules/conversations/state/conversationSlice"
import { connectSocket, disconnectSocket } from "../modules/conversations/api/socketClient"

export default function SocketSession() {
  const dispatch = useDispatch()
  const { accessToken, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket()
      return undefined
    }

    const socket = connectSocket(accessToken)
    if (!socket) return undefined
    const onMessage = (event) => {
      if (event?.success && event.data?.message) {
        dispatch(receiveMessage({
          conversationId: event.data.conversationId,
          message: event.data.message,
          currentUserId: user?.id,
        }))
      }
    }
    const onConnectError = (error) => {
      if (["SESSION_REPLACED", "INVALID_ACCESS_TOKEN", "AUTH_REQUIRED"].includes(error.data?.code)) {
        dispatch(logoutUser())
      }
    }
    const onDisconnect = (reason) => {
      if (reason === "io server disconnect") dispatch(logoutUser())
    }

    socket.on("message:new", onMessage)
    socket.on("connect_error", onConnectError)
    socket.on("disconnect", onDisconnect)
    return () => {
      socket.off("message:new", onMessage)
      socket.off("connect_error", onConnectError)
      socket.off("disconnect", onDisconnect)
    }
  }, [accessToken, dispatch, user?.id])

  return null
}
