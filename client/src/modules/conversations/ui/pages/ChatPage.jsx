import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import Button from "../../../../shared/ui/Button"
import Icon from "../../../../shared/ui/Icon"
import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto"
import { loadConversation, loadConversations, loadMessages, markRead, sendMessage } from "../../state/conversationSlice"
import { subscribeSocketEvent } from "../../api/socketClient"

export default function ChatPage() {
  const { conversationId } = useParams()
  const dispatch = useDispatch()
  const [text, setText] = useState("")
  const [sendError, setSendError] = useState("")
  const conversation = useSelector((state) => state.conversations.items.find((item) => item.id === conversationId))
  const messages = useSelector((state) => state.conversations.messages[conversationId] || [])
  const cursor = useSelector((state) => state.conversations.messageCursors[conversationId])
  const loading = useSelector((state) => state.conversations.messagesLoading[conversationId])
  const error = useSelector((state) => state.conversations.messagesError[conversationId])
  const canSend = Boolean(conversation?.canSendMessages)
  const recipientId = conversation?.userId
  const olderCursor = cursor || null

  useEffect(() => {
    dispatch(loadConversation(conversationId))
    dispatch(loadConversations())
    dispatch(loadMessages({ conversationId }))
    dispatch(markRead(conversationId))
  }, [conversationId, dispatch])

  useEffect(() => subscribeSocketEvent("message:new", (event) => {
    if (event?.data?.conversationId === conversationId) dispatch(markRead(conversationId))
  }), [conversationId, dispatch])

  const submit = async (event) => {
    event.preventDefault()
    const message = text.trim()
    if (!message || !canSend || !recipientId) return
    setSendError("")
    const result = await dispatch(sendMessage({
      recipientId,
      text: message,
      clientMessageId: globalThis.crypto?.randomUUID?.().replaceAll("-", "") || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    }))
    if (sendMessage.fulfilled.match(result)) setText("")
    else setSendError(result.payload?.message || "Message could not be sent.")
  }

  return (
    <section className="mx-auto flex h-[calc(100svh-68px)] max-w-4xl flex-col px-3 sm:px-5 lg:h-full">
      <header className="flex min-h-[68px] items-center gap-3 border-b border-sage-green/20">
        <Link to="/app" aria-label="Back to chats" className="grid size-10 place-items-center rounded-full hover:bg-surface-container"><Icon name="arrow-left-s-line" className="text-xl" /></Link>
        <ProfilePhoto name={conversation?.name} photoPath={conversation?.profile?.profilePhoto?.filePath} size="size-10" />
        <div className="min-w-0 flex-1"><h1 className="truncate font-heading text-label-lg">{conversation?.name || "Conversation"}</h1><p className="text-label-sm text-outline">{canSend ? "Private conversation" : "Read only"}</p></div>
        {conversation?.userId && <Link to={`/app/people/${conversation.userId}`} aria-label="View profile" className="grid size-10 place-items-center rounded-full hover:bg-surface-container"><Icon name="more-2-fill" /></Link>}
      </header>
      <div className="my-2 rounded-full bg-surface-container px-3 py-2 text-center text-label-sm text-on-surface-variant"><Icon name="lock-2-line" className="mr-1" /> Messages are private between you.</div>
      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto py-3">
        <div className="space-y-3">
          {error && <p role="alert" className="rounded-xl bg-error/10 p-3 text-body-sm text-error">{error.message}</p>}
          {[...messages].reverse().map((message) => (
            <div key={message.id || message.clientMessageId} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
              <article className={`max-w-[86%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-body-sm ${message.sender === "me" ? "rounded-br-md bg-vivid-yellow" : "rounded-bl-md bg-white shadow-panel"}`}>
                {message.text}<time className="mt-1 block text-right text-[10px] text-outline">{message.time}</time>
              </article>
            </div>
          ))}
          {!loading && !messages.length && <div className="py-16 text-center text-body-sm text-outline">Say hello to begin this conversation.</div>}
          {olderCursor && <button disabled={loading} onClick={() => dispatch(loadMessages({ conversationId, cursor: olderCursor }))} className="w-full py-3 text-label-sm text-outline">{loading ? "Loading…" : "Load older messages"}</button>}
        </div>
      </div>
      {!canSend && <p className="mb-2 rounded-xl bg-surface-container p-3 text-center text-label-sm text-on-surface-variant">You can read the conversation, but new messages are unavailable until you reconnect.</p>}
      {sendError && <p role="alert" className="mb-2 text-label-sm text-error">{sendError}</p>}
      <form onSubmit={submit} className="flex min-h-[64px] items-center gap-2 border-t border-sage-green/20 py-2">
        <label className="flex min-h-12 min-w-0 flex-1 items-center rounded-full bg-white px-4 shadow-panel">
          <span className="sr-only">Message</span><input value={text} onChange={(event) => setText(event.target.value)} maxLength={4000} disabled={!canSend} placeholder={canSend ? "Type a quiet message…" : "Messaging unavailable"} className="w-full bg-transparent text-body-sm outline-none disabled:cursor-not-allowed" />
        </label>
        <Button type="submit" disabled={!canSend || !text.trim()} className="size-12 shrink-0 rounded-full px-0" aria-label="Send message"><Icon name="arrow-up-line" className="text-xl" /></Button>
      </form>
    </section>
  )
}
