import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../../../../shared/ui/Avatar";
import Icon from "../../../../shared/ui/Icon";
import { mockPeople } from "../../../people/api/mockPeople";
import { removeBlocked } from "../../../people/state/peopleSlice";

export default function BlockedContactsPage() {
  const dispatch = useDispatch();
  const blockedIds = useSelector((state) => state.people.blockedIds);
  const people = blockedIds
    .map((id) => mockPeople.find((person) => person.id === id))
    .filter(Boolean);
  return (
    <section className="mx-auto min-h-full max-w-2xl px-4 pb-10 pt-5 sm:px-6">
      <header className="flex items-center gap-3">
        <Link
          to="/app/settings/privacy"
          className="grid size-9 place-items-center rounded-full hover:bg-surface-container"
          aria-label="Back"
        >
          <Icon name="arrow-left-s-line" className="text-xl" />
        </Link>
        <div>
          <h1 className="font-heading text-headline-sm">Blocked contacts</h1>
          <p className="text-label-sm text-outline">
            {people.length} {people.length === 1 ? "contact" : "contacts"} ·
            Protected
          </p>
        </div>
      </header>
      <div className="mt-5 space-y-2">
        {people.length ? (
          people.map((person, index) => (
            <article
              key={person.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-panel"
            >
              <Avatar
                name={person.name}
                src={person.avatarUrl}
                size="size-12"
              />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-label-lg">
                  {person.name}
                </strong>
                <small className="text-label-sm text-outline">
                  @{person.username} ·{" "}
                  {index === 0 ? "Blocked today" : "Blocked Oct 14"}
                </small>
              </div>
              <button
                onClick={() => dispatch(removeBlocked(person.id))}
                className="rounded-full bg-surface-container px-3 py-2 text-label-sm"
              >
                Unblock
              </button>
            </article>
          ))
        ) : (
          <div className="rounded-2xl bg-white px-5 py-10 text-center">
            <Icon
              name="shield-check-line"
              className="text-3xl text-sage-green"
            />
            <h2 className="mt-2 font-heading text-title-md">
              No blocked contacts
            </h2>
            <p className="mt-1 text-body-sm text-outline">
              Your boundaries will appear here.
            </p>
          </div>
        )}
      </div>
      <div className="mt-5 rounded-2xl bg-surface-container p-4 text-center">
        <Icon name="lock-2-line" />
        <p className="mt-2 text-label-md">Quiet discretion</p>
        <p className="mt-1 text-label-sm text-outline">
          No notifications are sent when you block or unblock someone.
        </p>
      </div>
    </section>
  );
}
