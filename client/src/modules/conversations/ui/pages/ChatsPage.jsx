import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../../../shared/ui/Button";
import Icon from "../../../../shared/ui/Icon";
import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto";
import {
  loadConversations,
  setConversationFilter,
  setConversationStatus,
  toggleUnreadOnly,
} from "../../state/conversationSlice";
import { useConversationFilters } from "../../hooks/useConversationFilters";

const filters = [
  ["all", "All"],
  ["personal", "Personal"],
  ["group", "Groups"],
];

function EmptyChats({ onStart }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-14 text-center sm:py-20">
      <div className="mb-5 grid size-32 place-items-center rounded-full bg-surface-container">
        <div className="relative grid size-16 place-items-center rounded-t-full border-2 border-bottle-green">
          <span className="size-5 rounded-full bg-vivid-yellow" />
          <span className="absolute -bottom-1 size-2 rounded-full bg-sage-green" />
        </div>
      </div>
      <span className="mb-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold tracking-widest text-outline">
        TRANQUIL
      </span>
      <h1 className="font-heading text-headline-sm">
        Every connection starts with a hello.
      </h1>
      <p className="mt-3 text-body-sm text-on-surface-variant">
        Your space is calm and waiting. Reach out to friends, family, or people
        you know to begin an unhurried conversation.
      </p>
      <Button onClick={onStart} className="mt-6 w-full max-w-sm">
        <Icon name="add-box-line" className="mr-2" /> Start a conversation{" "}
        <Icon name="arrow-right-line" className="ml-auto" />
      </Button>
      <Link
        to="/app/people"
        className="mt-4 text-label-md text-outline hover:text-bottle-green"
      >
        <Icon name="user-search-line" className="mr-1" /> Browse directory or
        invite someone
      </Link>
      <div className="mt-12 w-full text-left">
        <div className="mb-3 flex items-center justify-between text-label-sm uppercase tracking-widest text-outline">
          <span>Spark an introduction</span>
          <button
            type="button"
            onClick={() => {}}
            className="normal-case tracking-normal"
          >
            <Icon name="shuffle-line" /> Shuffle
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-xl bg-surface-container p-4 text-left text-label-sm">
            <span className="block text-outline">Family & Kin</span>“Thinking of
            you...”
          </button>
          <button className="rounded-xl bg-surface-container p-4 text-left text-label-sm">
            <span className="block text-outline">Inner Circle</span>“Free for a
            quiet tea...”
          </button>
        </div>
      </div>
      <p className="mt-8 rounded-full bg-sage-green/15 px-4 py-2 text-label-sm text-outline">
        <span className="mr-2 inline-block size-1.5 rounded-full bg-sage-green" />
        Zero logs · Your personal conversations remain private
      </p>
    </div>
  );
}

export default function ChatsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items,
    loaded,
    loading,
    filter,
    statusFilter,
    showUnreadOnly,
    unreadTotal,
    nextCursor,
    error,
  } = useSelector((state) => state.conversations);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const visible = useConversationFilters(search);
  useEffect(() => {
    if (!loaded) dispatch(loadConversations());
  }, [dispatch, loaded]);

  return (
    <section className="mx-auto min-h-full max-w-5xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
      {error && <p role="alert" className="mb-3 rounded-xl bg-error/10 p-3 text-body-sm text-error">{error.message}</p>}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-headline-lg">
            Chats{" "}
            <span className="ml-1 rounded-full bg-surface-container px-2 py-0.5 align-middle text-label-sm font-normal">
              {items.length}
            </span>
          </h1>
          <p className="mt-1 text-body-sm text-outline">
            Your private conversations
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => navigate("/app/people")}
            aria-label="Start new chat"
            className="grid size-10 place-items-center rounded-full hover:bg-surface-container"
          >
            <Icon name="edit-box-line" className="text-xl" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filter chats"
            className="grid size-10 place-items-center rounded-full hover:bg-surface-container"
          >
            <Icon name="equalizer-2-line" className="text-xl" />
          </button>
        </div>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map(([value, label]) => (
          <button
            key={value}
            onClick={() => dispatch(setConversationFilter(value))}
            className={`shrink-0 rounded-full px-4 py-1.5 text-label-md ${filter === value ? "bg-vivid-yellow text-bottle-green" : "bg-surface-container text-on-surface-variant"}`}
          >
            {label}
            {value === "all" ? ` ${unreadTotal ? `· ${unreadTotal}` : ""}` : ""}
          </button>
        ))}
        <button
          onClick={() => dispatch(toggleUnreadOnly())}
          className={`shrink-0 rounded-full px-4 py-1.5 text-label-md ${showUnreadOnly ? "bg-vivid-yellow" : "bg-surface-container"}`}
        >
          Unread{" "}
          {unreadTotal > 0 && <span className="ml-1">{unreadTotal}</span>}
        </button>
      </div>
      {showFilters && (
        <div className="mt-3 rounded-xl bg-white p-3">
          <p className="mb-2 text-label-sm text-outline">Conversation status</p>
          <div className="flex gap-2">
            {[
              ["all", "All"],
              ["unread", "Unread"],
              ["read", "Read"],
              ["blocked", "Blocked"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => dispatch(setConversationStatus(value))}
                className={`rounded-full px-3 py-1.5 text-label-sm ${statusFilter === value ? "bg-vivid-yellow" : "bg-surface-container"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => dispatch(toggleUnreadOnly())}
            aria-pressed={showUnreadOnly}
            className="mt-3 text-label-sm underline underline-offset-4"
          >
            {showUnreadOnly ? "Clear unread-only filter" : "Show unread only"}
          </button>
        </div>
      )}

      <label className="mt-4 flex h-11 items-center gap-3 rounded-full bg-white px-4 shadow-panel">
        <Icon name="search-line" className="text-lg text-outline" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search conversations..."
          className="min-w-0 flex-1 bg-transparent text-body-sm outline-none placeholder:text-outline"
        />
        <span className="hidden text-[10px] text-outline sm:inline">
          PRIVATE SPACE
        </span>
      </label>



      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-surface-container/70 px-3 py-2 text-label-sm text-on-surface-variant">
        <Icon name="lock-2-line" />
        <span>All conversations end-to-end sealed</span>
        <span className="text-outline">· ZERO LOGS</span>
      </div>


      {loading && !loaded ? (
        <div className="py-16 text-center text-body-sm text-outline">
          Opening your conversations…
        </div>
      ) : visible.length === 0 && items.length === 0 ? (
        <EmptyChats onStart={() => navigate("/app/people")} />
      ) : visible.length === 0 ? (
        <div className="py-16 text-center text-body-sm text-outline">
          No conversations match these filters.
        </div>
      ) : (
        <div className="mt-3 divide-y divide-sage-green/20">
          {visible.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/app/conversations/${conversation.id}`}
              className="flex min-h-[76px] items-center gap-3 py-3 hover:bg-white/60"
            >
              <ProfilePhoto
                name={conversation.name}
                photoPath={conversation.profile?.profilePhoto?.filePath}
                size="size-12"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <strong className="truncate font-heading text-label-lg">
                    {conversation.name}
                  </strong>
                  {conversation.type === "group" && (
                    <Icon name="group-line" className="text-xs text-outline" />
                  )}
                </span>
                <span
                  className={`mt-0.5 block truncate text-body-sm ${conversation.typing ? "italic text-bottle-green" : "text-on-surface-variant"}`}
                >
                  {conversation.preview}
                </span>
              </span>
              <span className="flex h-12 shrink-0 flex-col items-end justify-between">
                <span
                  className={`text-label-sm ${conversation.unreadCount ? "text-secondary" : "text-outline"}`}
                >
                  {conversation.time}
                </span>
                {conversation.unreadCount ? (
                  <span className="grid min-w-5 place-items-center rounded-full bg-vivid-yellow px-1.5 py-0.5 text-[10px] font-bold">
                    {conversation.unreadCount}
                  </span>
                ) : (
                  conversation.type === "direct" && conversation.lastMessage && (
                    <Icon
                      name="check-double-line"
                      className="text-xs text-outline"
                    />
                  )
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <Button
          onClick={() => navigate("/app/people")}
          className="fixed bottom-[84px] right-2 z-10 h-12 w-max px-5 shadow-action lg:bottom-8 lg:right-8"
        >
          <Icon name="edit-box-line" className="mr-2" />
          New Chat
        </Button>
      )}
      {nextCursor && <button disabled={loading} onClick={() => dispatch(loadConversations({ cursor: nextCursor }))} className="mb-4 w-full rounded-xl border border-sage-green/40 bg-white py-3 text-label-md disabled:opacity-50">{loading ? "Loading…" : "Load more conversations"}</button>}
    </section>
  );
}
