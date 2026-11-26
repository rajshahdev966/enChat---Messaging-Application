import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto";
import Icon from "../../../../shared/ui/Icon";
import {
  approvePerson,
  cancelRequest,
  connectPerson,
  fetchContacts,
  fetchPendingContacts,
  fetchBlockedUsers,
  rejectPerson,
  refreshPeople,
  setPeopleQuery,
  setPeopleSort,
} from "../../state/peopleSlice";
import {
  openConversation,
  loadConversations,
} from "../../../conversations/state/conversationSlice";
import { usePeopleSearch } from "../../hooks/usePeopleSearch";

function PersonRow({ person, connected = false, onMessage, onConnect }) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-3 shadow-panel">
      <Link
        to={"/app/people/" + person.id}
        className="shrink-0"
        aria-label={"Open " + person.name + "'s profile"}
      >
        <ProfilePhoto
          name={person.name}
          photoPath={person.profile?.profilePhoto?.filePath}
          size="size-12"
        />
      </Link>
      <Link to={"/app/people/" + person.id} className="min-w-0 flex-1">
        <strong className="block truncate font-heading text-label-lg">
          {person.name}
        </strong>
        <span className="block truncate text-body-sm text-outline">
          @{person.username}
        </span>
        {person.profile?.userCaption && (
          <small className="block truncate text-label-sm text-outline">
            {person.profile.userCaption}
          </small>
        )}
      </Link>
      {connected ? (
        <button
          onClick={() => onMessage(person)}
          className="shrink-0 rounded-full bg-vivid-yellow px-3 py-2 text-label-sm"
        >
          <Icon name="chat-1-line" className="mr-1" /> Message
        </button>
      ) : (
        <button
          onClick={() => onConnect(person)}
          className="shrink-0 rounded-full bg-surface-container px-3 py-2 text-label-sm"
        >
          <Icon name="user-add-line" className="mr-1" /> Connect
        </button>
      )}
    </article>
  );
}

export default function PeoplePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sentinel = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const { contacts, pending, blockedIds, contactsLoading, contactsError } =
    useSelector((state) => state.people);
  const {
    query,
    sort,
    results,
    loading,
    nextCursor,
    error,
    discoveryLoadingMore,
    searchMore,
  } = usePeopleSearch();
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchPendingContacts());
    dispatch(fetchBlockedUsers());
  }, [dispatch]);

  useEffect(() => {
    if (!sentinel.current || !nextCursor || loading) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) searchMore();
      },
      { rootMargin: "240px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [nextCursor, loading, searchMore]);

  const recent = useMemo(
    () => contacts.filter((person) => person.status !== "blocked").slice(0, 12),
    [contacts],
  );
  const contactIds = useMemo(
    () => new Set(contacts.map((person) => person.id)),
    [contacts],
  );

  const runAction = async (promise) => {
    setActionError("");
    const action = await dispatch(promise);
    if (action.error || action.payload?.message)
      setActionError(
        action.payload?.message || "The request could not be completed.",
      );
    return action;
  };

  const message = async (person) => {
    if (!person.id) return;
    const action = await runAction(openConversation(person));
    if (openConversation.fulfilled.match(action)) {
      const conversationId = action.payload.data.id;
      dispatch(loadConversations());
      navigate("/app/conversations/" + conversationId);
    }
  };

  const connect = async (person) => {
    const action = await runAction(connectPerson(person.id));
    if (
      connectPerson.fulfilled.match(action) &&
      action.payload.data.status === "accepted"
    )
      dispatch(fetchContacts());
  };

  const accept = async (person) => {
    await runAction(approvePerson(person.id));
    dispatch(fetchContacts());
    dispatch(fetchPendingContacts());
  };

  const reject = async (person) => {
    await runAction(rejectPerson(person.id));
    dispatch(fetchPendingContacts());
  };

  return (
    <section className="mx-auto min-h-full max-w-3xl overflow-x-hidden px-4 pb-8 pt-5 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-label-sm uppercase tracking-widest text-outline">
            People · enChat
          </p>
          <h1 className="mt-1 font-heading text-headline-lg">
            Find your people.
          </h1>
        </div>
      </div>
      <p className="max-w-xl text-body-sm text-on-surface-variant">
        Search by name, caption, or bio, or discover people who are open to
        being found.
      </p>

      <label className="mt-5 flex h-12 min-w-0 items-center gap-3 rounded-2xl bg-white px-4 shadow-panel">
        <Icon name="search-line" className="shrink-0 text-xl text-outline" />
        <input
          value={query}
          onChange={(event) => dispatch(setPeopleQuery(event.target.value))}
          placeholder="Search people..."
          className="min-w-0 flex-1 bg-transparent text-body-sm outline-none placeholder:text-outline"
          aria-label="Search people"
        />
        {query && (
          <button
            type="button"
            onClick={() => dispatch(setPeopleQuery(""))}
            aria-label="Clear search"
          >
            <Icon name="close-circle-fill" />
          </button>
        )}
      </label>

      {!query && (
        <section className="mt-6 min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-title-md">Recent sanctuary</h2>
            <span className="text-label-sm text-outline">
              {contacts.length} contacts
            </span>
          </div>
          {contactsLoading && contacts.length === 0 ? (
            <p className="py-4 text-label-sm text-outline">Loading contacts…</p>
          ) : contactsError ? (
            <p role="alert" className="py-4 text-label-sm text-error">
              {contactsError.message}
            </p>
          ) : recent.length ? (
            <div className="flex w-full flex-nowrap gap-4 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recent.map((person) => (
                <Link
                  key={person.id}
                  to={"/app/people/" + person.id}
                  className="flex w-14 shrink-0 flex-col items-center gap-1.5"
                >
                  <ProfilePhoto
                    name={person.name}
                    photoPath={person.profile?.profilePhoto?.filePath}
                    size="size-12"
                  />
                  <span className="w-full truncate text-center text-[10px]">
                    {person.name.split(" ")[0]}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white px-4 py-5 text-body-sm text-on-surface-variant">
              Your contacts will appear here after they accept a request.
            </div>
          )}
        </section>
      )}

      {pending.length > 0 && !query && (
        <section className="mt-5">
          <h2 className="mb-3 font-heading text-title-md">
            Contact requests{" "}
            <span className="text-label-sm text-outline">{pending.length}</span>
          </h2>
          <div className="space-y-2">
            {pending.map((person) => (
              <article
                key={person.id}
                className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-3 shadow-panel"
              >
                <ProfilePhoto
                  name={person.name}
                  photoPath={person.profile?.profilePhoto?.filePath}
                  size="size-11"
                />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-label-lg">
                    {person.name}
                  </strong>
                  <small className="text-label-sm text-outline">
                    @{person.username}
                  </small>
                </div>
                {person.requestedByMe ? (
                  <button
                    onClick={() => runAction(cancelRequest(person.id))}
                    className="rounded-full bg-surface-container px-3 py-2 text-label-sm"
                  >
                    Cancel
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => reject(person)}
                      className="rounded-full bg-surface-container px-3 py-2 text-label-sm"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => accept(person)}
                      className="rounded-full bg-vivid-yellow px-3 py-2 text-label-sm"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-title-md">
              {query ? "Search results" : "Discover people"}
            </h2>
            <p className="text-label-sm text-outline">
              {query
                ? "Name, then caption and bio"
                : "Recommended for your circle"}
            </p>
          </div>
          <select
            aria-label="Sort people"
            value={sort}
            onChange={(event) => dispatch(setPeopleSort(event.target.value))}
            className="max-w-36 rounded-full bg-white px-3 py-2 text-label-sm shadow-panel"
          >
            <option value="recommended">Recommended</option>
            <option value="alphabetical">A to Z</option>
          </select>
        </div>
        {error && !loading && (
          <p
            role="alert"
            className="rounded-xl bg-error/10 p-3 text-body-sm text-error"
          >
            {error.message}{" "}
            <button
              className="ml-2 underline"
              onClick={() => dispatch(refreshPeople())}
            >
              Try again
            </button>
          </p>
        )}
        <div className="space-y-2">
          {results
            .filter((person) => !blockedIds.includes(person.id))
            .map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                connected={contactIds.has(person.id)}
                onMessage={message}
                onConnect={connect}
              />
            ))}
        </div>
        {loading && (
          <p className="py-5 text-center text-label-sm text-outline">
            {discoveryLoadingMore
              ? "Loading more people…"
              : "Searching the directory…"}
          </p>
        )}
        {!loading && !error && results.length === 0 && (
          <div className="rounded-2xl bg-white px-5 py-10 text-center">
            <Icon name="user-search-line" className="text-3xl text-outline" />
            <p className="mt-2 font-heading text-title-md">
              {query ? "No matches yet" : "No one to discover yet"}
            </p>
            <p className="mt-1 text-body-sm text-outline">
              {query
                ? "Try another name, caption, or bio phrase."
                : "People who allow discovery will appear here."}
            </p>
          </div>
        )}
        <div ref={sentinel} className="h-2" />
        {!loading && nextCursor && (
          <button
            onClick={searchMore}
            className="w-full rounded-xl border border-sage-green/40 bg-white py-3 text-label-md"
          >
            Load more people
          </button>
        )}
        {!loading && !nextCursor && results.length > 0 && (
          <p className="py-4 text-center text-label-sm text-outline">
            You’re all caught up.
          </p>
        )}
      </section>

      <div className="mt-7 rounded-3xl bg-surface-container p-4">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-heading text-label-lg">@{user?.username}</p>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Share your enChat ID privately to receive a request.
            </p>
          </div>
          <Icon name="qr-code-line" className="text-2xl" />
        </div>
        <button
          onClick={() => navigator.clipboard?.writeText("@" + user?.username)}
          className="mt-3 w-full rounded-full bg-white py-3 text-label-md"
        >
          <Icon name="file-copy-line" /> Copy your enChat ID
        </button>
      </div>
      {actionError && (
        <p role="alert" className="mt-4 text-label-sm text-error">
          {actionError}
        </p>
      )}
    </section>
  );
}
