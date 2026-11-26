import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Icon from "../../../../shared/ui/Icon";
import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto";
import {
  loadPerson,
  fetchContacts,
  fetchPendingContacts,
  fetchBlockedUsers,
  connectPerson,
  approvePerson,
  removePerson,
  blockPerson,
  unblockPerson,
} from "../../state/peopleSlice";
import { openConversation } from "../../../conversations/state/conversationSlice";

export default function PersonProfilePage() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState("");
  const {
    selected,
    profileLoading,
    profileError,
    contacts,
    pending,
    blockedIds,
  } = useSelector((state) => state.people);

  const person = selected?.user?.id === userId ? selected.user : null;
  const isSelf = selected?.user?.id === userId && selected.isSelf;

  const contact = useMemo(
    () => contacts.find((item) => item.id === userId),
    [contacts, userId],
  );
  const request = useMemo(
    () => pending.find((item) => item.id === userId),
    [pending, userId],
  );
  const blocked = blockedIds.includes(userId);

  useEffect(() => {
    const request = dispatch(loadPerson(userId));
    dispatch(fetchContacts());
    dispatch(fetchPendingContacts());
    dispatch(fetchBlockedUsers());
    return () => request.abort();
  }, [dispatch, userId]);

  const run = async (action) => {
    setActionError("");
    const result = await dispatch(action);
    if (result.error) {
      setActionError(
        result.payload?.message || "This action could not be completed.",
      );
    }
    return result;
  };

  const message = async () => {
    const result = await run(openConversation(person));
    if (openConversation.fulfilled.match(result)) {
      navigate(`/app/conversations/${result.payload.data.id}`);
    }
  };

  if (profileLoading && !person) {
    return (
      <p className="p-8 text-center text-body-sm text-outline">
        Loading profile…
      </p>
    );
  }

  if (profileError || !person) {
    return (
      <section className="mx-auto max-w-xl p-6">
        <p
          role="alert"
          className="rounded-xl bg-surface-container p-4 text-body-sm"
        >
          {profileError?.message || "This profile is unavailable."}
        </p>
        <Link to="/app/people" className="mt-4 inline-block underline">
          Back to people
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-full max-w-xl flex-col px-4 pb-8 pt-4 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Link
          to="/app/people"
          className="grid size-10 place-items-center rounded-full text-on-surface hover:bg-surface-container"
          aria-label="Back"
        >
          <Icon name="arrow-left-s-line" className="text-xl" />
        </Link>
        <h1 className="font-heading text-title-md text-on-surface">
          {isSelf ? "Your profile" : "Profile"}
        </h1>
        <span
          className="grid size-10 place-items-center rounded-full text-on-surface-variant"
          aria-hidden="true"
        >
          <Icon name="more-2-fill" className="text-xl" />
        </span>
      </header>

      <article className="mt-4 rounded-3xl border border-outline-variant/40 bg-white px-6 py-7 text-center shadow-panel">
        <div className="relative inline-flex justify-center">
          <ProfilePhoto
            name={person.name}
            photoPath={person.profile?.profilePhoto?.filePath}
            size="size-28"
          />
          <span
            className="absolute bottom-1 right-1 size-4 rounded-full border-2 border-white bg-primary/70"
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-4 font-heading text-headline-lg font-bold text-on-surface">
          {person.name}
        </h2>
        <p className="mt-0.5 text-body-sm text-on-surface-variant">
          @{person.username}
        </p>

        {!!person.profile?.interests?.length && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {person.profile.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-surface-container px-4 py-1.5 text-label-sm text-on-surface-variant"
              >
                {interest}
              </span>
            ))}
          </div>
        )}


        {(person.profile?.userCaption || person.profile?.bio) && (
          <div className="mx-auto mt-4 max-w-md border-t border-outline-variant/40 pt-4">
            {person.profile?.userCaption && (
              <p className="font-medium text-body-md text-on-surface p-2">
                {person.profile.userCaption}
              </p>
            )}
            {person.profile?.bio && (
              <p className="mt-1 whitespace-pre-wrap text-body-sm text-on-surface-variant text-left p-3 bg-surface border-l-4 border-y-vivid-yellow rounded-r-lg">
                {person.profile.bio}
              </p>
            )}
          </div>
        )}


        <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-outline-variant/40 pt-4 text-label-sm text-outline">
          <Icon name="lock-line" className="text-base" />
          <span>Quiet Sanctuary · End-to-end encrypted</span>
        </div>
      </article>

      {!isSelf && (
        <div className="mt-5 flex flex-col gap-3">
          {contact ? (
            <button
              onClick={message}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-vivid-yellow px-5 py-3.5 text-label-md font-semibold text-on-surface shadow-sm transition hover:brightness-95"
            >
              <Icon name="message-2-line" className="text-lg" />
              <span>Message</span>
            </button>
          ) : request && !request.requestedByMe ? (
            <button
              onClick={() => run(approvePerson(userId))}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-vivid-yellow px-5 py-3.5 text-label-md font-semibold text-on-surface shadow-sm transition hover:brightness-95"
            >
              <Icon name="check-line" className="text-lg" />
              <span>Accept request</span>
            </button>
          ) : (
            <button
              disabled={blocked || Boolean(request)}
              onClick={() => run(connectPerson(userId))}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-vivid-yellow px-5 py-3.5 text-label-md font-semibold text-on-surface shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-75"
            >
              <Icon
                name={
                  blocked
                    ? "prohibited-line"
                    : request
                      ? "time-line"
                      : "user-add-line"
                }
                className="text-lg"
              />
              <span>
                {blocked ? "Blocked" : request ? "Request sent" : "Connect"}
              </span>
            </button>
          )}

          {contact && (
            <button
              onClick={() => run(removePerson(userId))}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-outline-variant/60 bg-surface-container px-5 py-3.5 text-label-md font-medium text-on-surface transition hover:bg-surface-container-high"
            >
              <Icon name="user-unfollow-line" className="text-lg" />
              <span>Remove contact</span>
            </button>
          )}

          <button
            onClick={() =>
              run(blocked ? unblockPerson(userId) : blockPerson(userId))
            }
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-error/25 bg-error/5 px-5 py-3.5 text-label-md font-semibold text-error transition hover:bg-error/10"
          >
            <Icon name="prohibited-line" className="text-lg" />
            <span>
              {blocked ? "Unblock" : "Block"} {person.name}
            </span>
          </button>
        </div>
      )}

      {actionError && (
        <p role="alert" className="mt-3 text-center text-body-sm text-error">
          {actionError}
        </p>
      )}

      <p className="mt-5 text-center text-label-sm text-outline">
        Profile visible under strict sanctuary discretion
      </p>
    </section>
  );
}
