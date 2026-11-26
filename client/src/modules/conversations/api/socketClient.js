import { io } from "socket.io-client"

let socket
let activeToken
const pendingSubscriptions = new Map()

export const connectSocket = (accessToken) => {
  if (!accessToken) return null
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
      autoConnect: false,
      withCredentials: true,
      auth: { accessToken },
    })
    for (const [event, handlers] of pendingSubscriptions) {
      handlers.forEach((handler) => socket.on(event, handler))
    }
    pendingSubscriptions.clear()
  }
  if (activeToken !== accessToken) {
    activeToken = accessToken
    socket.auth = { accessToken }
    if (socket.connected) socket.disconnect()
    socket.connect()
  } else if (!socket.connected) {
    socket.connect()
  }
  return socket
}

export const disconnectSocket = () => {
  activeToken = null
  socket?.disconnect()
}

export const emitSocketEvent = (event, payload, timeoutMs = 10000) => new Promise((resolve, reject) => {
  if (!socket?.connected) {
    reject(new Error("The secure connection is not ready. Try again in a moment."))
    return
  }
  const timeout = window.setTimeout(() => reject(new Error("The message took too long to send.")), timeoutMs)
  socket.emit(event, payload, (response) => {
    window.clearTimeout(timeout)
    if (!response?.success) {
      const error = new Error(response?.message || "The request could not be completed.")
      error.code = response?.code
      reject(error)
    } else {
      resolve(response.data)
    }
  })
})

export const subscribeSocketEvent = (event, handler) => {
  if (socket) socket.on(event, handler)
  else {
    const handlers = pendingSubscriptions.get(event) || new Set()
    handlers.add(handler)
    pendingSubscriptions.set(event, handlers)
  }
  return () => {
    socket?.off(event, handler)
    const handlers = pendingSubscriptions.get(event)
    handlers?.delete(handler)
    if (!handlers?.size) pendingSubscriptions.delete(event)
  }
}
