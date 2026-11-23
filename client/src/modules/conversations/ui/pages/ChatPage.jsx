import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../../../../shared/ui/Avatar";
import Icon from "../../../../shared/ui/Icon";
import {
  loadConversations,
  loadMessages,
  markConversationRead,
  sendLocalMessage,
} from "../../state/conversationSlice";

export default function ChatPage() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const feedEnd = useRef(null);
  const [text, setText] = useState("");
  const { items, messages, loaded, messagesLoaded } = useSelector(
    (state) => state.conversations,
  );
  const conversation = items.find((item) => item.id === conversationId);
  const blockedIds = useSelector((state) => state.people.blockedIds);
  const blocked = conversation && blockedIds.includes(conversation.userId);
  const thread = messages[conversationId] || [];

  useEffect(() => {
    if (!loaded) dispatch(loadConversations());
  }, [dispatch, loaded]);
  useEffect(() => {
    dispatch(loadMessages(conversationId));
  }, [dispatch, conversationId]);
  useEffect(() => {
    if (loaded) dispatch(markConversationRead(conversationId));
  }, [dispatch, conversationId, loaded]);
  useEffect(() => {
    feedEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.length]);

  function send(event) {
    event.preventDefault();
    const message = text.trim();
    if (!message) return;
    dispatch(sendLocalMessage({ conversationId, text: message }));
    setText("");
  }

  if (!conversation)
    return (
      <div className="grid min-h-[70svh] place-items-center text-body-sm text-outline">
        {loaded ? "Conversation not found." : "Opening conversation…"}
      </div>
    );
  return (
    <section className="mx-auto flex h-[calc(100svh-56px)] max-w-4xl flex-col border-x border-sage-green/15 bg-neo-pearl">
      <header className="flex h-[68px] shrink-0 items-center gap-3 border-b border-sage-green/20 bg-neo-pearl px-4 sm:px-6">
        <Link
          to="/app"
          aria-label="Back to chats"
          className="grid size-9 place-items-center rounded-full hover:bg-surface-container"
        >
          <Icon name="arrow-left-s-line" className="text-xl" />
        </Link>
        <Avatar
          name={conversation.name}
          src={conversation.avatarUrl}
          online={conversation.online}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-label-lg">
            {conversation.name}
          </p>
          <p className="text-label-sm text-outline">
            {conversation.online ? "online" : "Just between us"}
          </p>
        </div>
        <Link
          to={
            conversation.type === "personal"
              ? `/app/people/${conversation.userId}`
              : "/app/people"
          }
          className="grid size-9 place-items-center rounded-full hover:bg-surface-container"
          aria-label="View profile"
        >
          <Icon name="user-3-line" className="text-xl" />
        </Link>
        <button
          aria-label="More conversation options"
          className="grid size-9 place-items-center rounded-full hover:bg-surface-container"
        >
          <Icon name="more-2-fill" className="text-xl" />
        </button>
      </header>
      {blocked ? (
        <div className="mx-3 mt-2 rounded-xl bg-surface-container p-3 text-center">
          <p className="text-label-md">
            <Icon name="shield-keyhole-line" /> Sanctuary boundary active
          </p>
          <p className="mt-1 text-label-sm text-outline">
            Messages are paused while this contact is blocked.
          </p>
          <Link
            to={`/app/people/${conversation.userId}`}
            className="mt-2 inline-block text-label-sm underline"
          >
            Review boundary
          </Link>
        </div>
      ) : (
        <div className="mx-3 mt-2 flex items-center justify-center gap-1.5 rounded-full bg-sage-green/15 py-1 text-[10px]">
          <Icon name="lock-2-line" /> Messages are end-to-end encrypted. Just
          between us.
        </div>
      )}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-5 sm:px-8">
        {!messagesLoaded[conversationId] && thread.length === 0 ? (
          <p className="py-12 text-center text-label-md text-outline">
            Loading messages…
          </p>
        ) : (
          <>
            <div className="mb-5 text-center">
              <span className="rounded-full bg-surface-container px-3 py-1 text-label-sm">
                TODAY
              </span>
            </div>
            {thread.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <article
                  className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[72%] ${message.sender === "me" ? "rounded-br-sm bg-vivid-yellow" : "rounded-bl-sm border border-sage-green/30 bg-white"}`}
                >
                  <p
                    className={`whitespace-pre-wrap text-body-sm ${message.deleted ? "italic text-outline" : ""}`}
                  >
                    {message.deleted && (
                      <Icon name="forbid-2-line" className="mr-1" />
                    )}
                    {message.text}
                  </p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${message.sender === "me" ? "text-bottle-green/60" : "text-outline"}`}
                  >
                    {message.time}
                    {message.sender === "me" && (
                      <Icon
                        name={
                          message.status === "read"
                            ? "check-double-line"
                            : message.status === "sending"
                              ? "time-line"
                              : "check-line"
                        }
                      />
                    )}
                  </div>
                </article>
                {message.sender === "them" && index === 0 && (
                  <span className="ml-1 self-end rounded-full bg-bottle-green px-1.5 py-1 text-[9px] text-white">
                    {conversation.name.slice(0, 1)}
                  </span>
                )}
              </div>
            ))}
            <div ref={feedEnd} />
          </>
        )}
      </div>
      <form
        onSubmit={send}
        className="sticky bottom-0 flex shrink-0 items-center gap-2 border-t border-sage-green/20 bg-neo-pearl px-3 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] sm:px-5"
      >
        <div className="flex h-12 min-w-0 flex-1 items-center rounded-full border border-sage-green/40 bg-white px-4 focus-within:border-bottle-green">
          <Icon
            name="emotion-happy-line"
            className="mr-3 shrink-0 text-xl text-outline"
          />
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              blocked
                ? "Messages paused while blocked"
                : "Type a quiet message..."
            }
            disabled={blocked}
            className="min-w-0 flex-1 bg-transparent text-body-sm outline-none placeholder:text-outline"
            aria-label="Message"
          />
        </div>
        <button
          type="submit"
          disabled={blocked || !text.trim()}
          aria-label="Send message"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-vivid-yellow text-bottle-green disabled:bg-sage-green/40"
        >
          <Icon name="arrow-up-line" className="text-xl" />
        </button>
      </form>
    </section>
  );
}
