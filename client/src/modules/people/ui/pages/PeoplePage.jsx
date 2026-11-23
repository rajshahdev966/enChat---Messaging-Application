import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../../../../shared/ui/Avatar";
import Button from "../../../../shared/ui/Button";
import Icon from "../../../../shared/ui/Icon";
import { mockPeople } from "../../api/mockPeople";
import { setPeopleQuery } from "../../state/peopleSlice";
import { usePeopleSearch } from "../../hooks/usePeopleSearch";
import { startConversation } from "../../../conversations/state/conversationSlice";

function PersonRow({ person, action = "Message", onAction }) {
  return (
    <article className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-panel">
      <Link to={`/app/people/${person.id}`} className="shrink-0">
        <Avatar
          name={person.name}
          src={person.avatarUrl}
          size="size-12"
          online={person.status === "online"}
        />
      </Link>
      <Link to={`/app/people/${person.id}`} className="min-w-0 flex-1">
        <strong className="block truncate font-heading text-label-lg">
          {person.name}
        </strong>
        <span className="block truncate text-body-sm text-outline">
          @{person.username}
        </span>
      </Link>
      <button
        onClick={() => onAction(person)}
        className={`shrink-0 rounded-full px-3 py-2 text-label-sm ${action === "Chat open" ? "bg-surface-container" : "bg-vivid-yellow text-bottle-green"}`}
      >
        <Icon
          name={action === "Chat open" ? "lock-2-line" : "chat-1-line"}
          className="mr-1"
        />
        {action}
      </button>
    </article>
  );
}

export default function PeoplePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { query, results, loading, searchMore, nextCursor } = usePeopleSearch();
  const blockedIds = useSelector((state) => state.people.blockedIds);
  const connections = useMemo(
    () =>
      mockPeople.filter(
        (person) => person.connection && !blockedIds.includes(person.id),
      ),
    [blockedIds],
  );
  function message(person) {
    dispatch(startConversation(person));
    navigate(`/app/conversations/${person.id.replace(/^u-/, "")}`);
  }

  return (
    <section className="mx-auto min-h-full max-w-3xl px-4 pb-8 pt-5 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-label-sm uppercase tracking-widest text-outline">
            People · enChat
          </p>
          <h1 className="mt-1 font-heading text-headline-lg">
            Find your people.
          </h1>
        </div>
        <Link
          to="/app/settings/privacy"
          aria-label="Discovery settings"
          className="grid size-10 place-items-center rounded-full hover:bg-surface-container"
        >
          <Icon name="equalizer-2-line" className="text-xl" />
        </Link>
      </div>
      <p className="max-w-xl text-body-sm text-on-surface-variant">
        Search with someone's enChat ID or discover people who are open to being
        found.
      </p>
      <label className="mt-5 flex h-12 items-center gap-3 rounded-2xl bg-white px-4 shadow-panel">
        <Icon name="search-line" className="text-xl text-outline" />
        <input
          value={query}
          onChange={(event) => dispatch(setPeopleQuery(event.target.value))}
          placeholder="Search by name or @enChat ID..."
          className="min-w-0 flex-1 bg-transparent text-body-sm outline-none placeholder:text-outline"
        />
        <kbd className="hidden rounded bg-surface-container px-2 py-1 text-[10px] text-outline sm:inline">
          ID
        </kbd>
        {query && (
          <button
            onClick={() => dispatch(setPeopleQuery(""))}
            aria-label="Clear search"
          >
            <Icon name="close-circle-fill" />
          </button>
        )}
      </label>
      {!query && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-label-sm uppercase tracking-widest text-outline">
              Recent sanctuary
            </h2>
            <button className="text-label-sm text-outline" onClick={() => {}}>
              Clear all
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {connections.slice(0, 6).map((person) => (
              <Link
                to={`/app/people/${person.id}`}
                key={person.id}
                className="flex w-14 shrink-0 flex-col items-center gap-1.5"
              >
                <Avatar
                  name={person.name}
                  src={person.avatarUrl}
                  online={person.status === "online"}
                  size="size-12"
                />
                <span className="w-full truncate text-center text-[10px]">
                  {person.name.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-heading text-title-md">
          {query ? "Directory results" : `Connections (${connections.length})`}
        </h2>
        <span className="text-label-sm text-outline">
          <Icon name="shield-check-line" /> Encrypted handshakes
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {(query
          ? results.filter((person) => !blockedIds.includes(person.id))
          : connections
        ).map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            action={person.id === "u-aarav" ? "Chat open" : "Message"}
            onAction={message}
          />
        ))}
      </div>
      {query && !loading && !results.length && (
        <div className="rounded-2xl bg-white px-5 py-10 text-center">
          <Icon name="user-search-line" className="text-3xl text-outline" />
          <p className="mt-2 font-heading text-title-md">No results yet</p>
          <p className="mt-1 text-body-sm text-outline">
            Try their exact enChat ID, or check the spelling.
          </p>
        </div>
      )}
      {loading && (
        <p className="py-4 text-center text-label-md text-outline">
          Searching the directory…
        </p>
      )}
      {query && nextCursor !== null && (
        <button
          onClick={searchMore}
          className="mt-3 w-full rounded-xl border border-sage-green/40 bg-white py-3 text-label-md"
        >
          Show more
        </button>
      )}
      {!query && (
        <div className="mt-6 rounded-3xl bg-surface-container p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-label-lg">
                @raj.shah{" "}
                <Icon name="checkbox-circle-fill" className="text-secondary" />
              </p>
              <p className="mt-1 text-label-sm text-on-surface-variant">
                Your Sanctuary ID · Share it privately so people can reach you.
              </p>
            </div>
            <Icon name="qr-code-line" className="text-2xl" />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-full bg-white py-2.5 text-label-md">
              <Icon name="file-copy-line" /> Copy ID
            </button>
            <button className="flex-1 rounded-full bg-bottle-green py-2.5 text-label-md text-white">
              <Icon name="share-line" /> Share invite
            </button>
          </div>
        </div>
      )}
      {!query && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-title-md">Discover people</h2>
            <span className="text-label-sm text-outline">
              Based on their visibility setting
            </span>
          </div>
          <div className="space-y-2">
            {results
              .filter(
                (person) =>
                  !person.connection && !blockedIds.includes(person.id),
              )
              .slice(0, 4)
              .map((person) => (
                <PersonRow key={person.id} person={person} onAction={message} />
              ))}
          </div>
        </div>
      )}
      <Button className="sr-only" onClick={() => navigate("/app/you")}>
        Your account
      </Button>
    </section>
  );
}
