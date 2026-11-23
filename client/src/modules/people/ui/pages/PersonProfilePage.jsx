import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../../../../shared/ui/Avatar";
import Button from "../../../../shared/ui/Button";
import Icon from "../../../../shared/ui/Icon";
import {
  appendBlocked,
  loadPerson,
  removeBlocked,
} from "../../state/peopleSlice";
import { startConversation } from "../../../conversations/state/conversationSlice";

function BlockDialog({ person, onClose, onBlock }) {
  const [report, setReport] = useState(false);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bottle-green/40 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-title"
        className="w-full max-w-md rounded-t-3xl bg-neo-pearl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-dialog sm:rounded-3xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-outline/30 sm:hidden" />
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-error-container text-error">
          <Icon name="forbid-2-line" className="text-2xl" />
        </div>
        <h2 id="block-title" className="text-center font-heading text-title-md">
          Set your boundaries
        </h2>
        <p className="mt-2 text-center text-body-sm text-on-surface-variant">
          Blocking {person.name} will prevent future messages and hide your
          online presence from them.
        </p>
        <div className="mt-4 rounded-2xl bg-surface-container p-4 text-body-sm text-on-surface-variant">
          <p>• They won't be notified that you blocked them.</p>
          <p className="mt-2">• Messages and status updates will be paused.</p>
          <p className="mt-2">• You can unblock them anytime from settings.</p>
        </div>
        <label className="mt-4 flex items-center justify-between rounded-xl bg-white p-3 text-label-md">
          <span>Also report recent messages</span>
          <input
            type="checkbox"
            checked={report}
            onChange={(event) => setReport(event.target.checked)}
            className="size-4 accent-bottle-green"
          />
        </label>
        <button
          onClick={() => onBlock(report)}
          className="mt-4 h-12 w-full rounded-xl bg-error text-white"
        >
          Block {person.name.split(" ")[0]}
        </button>
        <button
          onClick={onClose}
          className="mt-2 h-11 w-full rounded-xl bg-surface-container text-label-md"
        >
          Keep connection
        </button>
      </section>
    </div>
  );
}

export default function PersonProfilePage() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: person, blockedIds } = useSelector((state) => state.people);
  const [showBlock, setShowBlock] = useState(false);
  const isBlocked = blockedIds.includes(userId);
  useEffect(() => {
    dispatch(loadPerson(userId));
  }, [dispatch, userId]);
  if (!person || person.id !== userId)
    return (
      <div className="grid min-h-[70svh] place-items-center text-body-sm text-outline">
        Loading profile…
      </div>
    );
  const startChat = () => {
    dispatch(startConversation(person));
    navigate(`/app/conversations/${person.id.replace(/^u-/, "")}`);
  };
  return (
    <section className="mx-auto min-h-full max-w-xl px-4 pb-8 pt-4 sm:px-6">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="grid size-10 place-items-center rounded-full hover:bg-surface-container"
          aria-label="Go back"
        >
          <Icon name="arrow-left-s-line" className="text-2xl" />
        </button>
        <span className="font-heading text-label-lg">{person.name}</span>
        <button
          className="grid size-10 place-items-center rounded-full hover:bg-surface-container"
          aria-label="More options"
        >
          <Icon name="more-2-fill" className="text-xl" />
        </button>
      </header>
      <div className="mt-3 flex rounded-full bg-surface-container p-1 text-label-sm">
        <span className="flex-1 rounded-full bg-white py-2 text-center">
          <Icon name="shield-check-line" /> Full profile
        </span>
        <span className="flex-1 py-2 text-center text-outline">
          <Icon name="lock-2-line" /> Restricted
        </span>
      </div>
      <div className="flex flex-col items-center pt-7 text-center">
        <Avatar
          name={person.name}
          src={person.avatarUrl}
          size="size-24"
          online={person.status === "online"}
          className="ring-4 ring-white shadow-panel"
        />
        <h1 className="mt-4 font-heading text-headline-sm">{person.name}</h1>
        <p className="mt-1 text-body-sm text-outline">
          @{person.username}{" "}
          <span className="ml-1 rounded-full bg-sage-green/20 px-2 py-0.5 text-[10px] text-bottle-green">
            <Icon name="verified-badge-fill" /> SANCTUARY
          </span>
        </p>
        <p className="mt-3 text-label-sm text-outline">
          <Icon name="time-line" />{" "}
          {person.status === "online" ? "online now" : person.status}
        </p>
        {person.profile?.bio && (
          <p className="mt-4 max-w-sm rounded-2xl bg-white px-4 py-3 text-body-sm">
            {person.profile.bio}
          </p>
        )}
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {person.profile?.userCaption}
        </p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button onClick={startChat}>
          <Icon name="chat-1-line" className="mr-2" />
          Message
        </Button>
        <Link
          to={`/app/conversations/${person.id.replace(/^u-/, "")}`}
          onClick={() => dispatch(startConversation(person))}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-sage-green/40 bg-white text-label-md"
        >
          <Icon name="history-line" /> Conversation
        </Link>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-surface-container p-3">
        <span className="grid size-10 place-items-center rounded-full bg-white">
          <Icon name="lock-2-line" />
        </span>
        <span className="flex-1">
          <strong className="block text-label-md">End-to-End Encrypted</strong>
          <span className="text-label-sm text-outline">
            Handshake established · Just between us
          </span>
        </span>
        <Icon name="checkbox-circle-line" className="text-secondary" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="rounded-2xl bg-white p-4 text-left">
          <Icon name="group-line" />
          <span className="mt-3 block text-label-sm text-outline">
            Shared Groups
          </span>
          <strong className="text-label-md">
            {person.sharedGroups || 0} shared
          </strong>
        </button>
        <button className="rounded-2xl bg-white p-4 text-left">
          <Icon name="links-line" />
          <span className="mt-3 block text-label-sm text-outline">
            Media & Links
          </span>
          <strong className="text-label-md">No shared media</strong>
        </button>
      </div>
      <div className="mt-3 divide-y divide-sage-green/20 rounded-2xl bg-white px-4">
        <button className="flex min-h-14 w-full items-center gap-3 text-left">
          <Icon name="notification-3-line" />
          <span className="flex-1">
            <strong className="block text-label-md">Mute notifications</strong>
            <small className="text-label-sm text-outline">
              Pause sound & vibration alerts
            </small>
          </span>
          <input
            aria-label="Mute notifications"
            type="checkbox"
            className="size-4 accent-bottle-green"
          />
        </button>
        <button className="flex min-h-14 w-full items-center gap-3 text-left">
          <Icon name="timer-line" />
          <span className="flex-1">
            <strong className="block text-label-md">
              Disappearing messages
            </strong>
            <small className="text-label-sm text-outline">
              Ephemerality timer
            </small>
          </span>
          <span className="text-label-sm">24 hours ›</span>
        </button>
        <button className="flex min-h-14 w-full items-center gap-3 text-left">
          <Icon name="safe-line" />
          <span className="flex-1">
            <strong className="block text-label-md">Sanctuary Vault</strong>
            <small className="text-label-sm text-outline">
              Shared private notes & tokens
            </small>
          </span>
          <Icon name="arrow-right-s-line" />
        </button>
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl bg-white">
        <button className="flex min-h-12 w-full items-center gap-3 px-4 text-left text-label-md">
          <Icon name="flag-line" />
          Report {person.name.split(" ")[0]}
        </button>
        <button
          onClick={() =>
            isBlocked ? dispatch(removeBlocked(userId)) : setShowBlock(true)
          }
          className="flex min-h-12 w-full items-center gap-3 bg-error/5 px-4 text-left text-label-md text-error"
        >
          {isBlocked ? (
            <>
              <Icon name="checkbox-circle-line" />
              Unblock {person.name.split(" ")[0]}
            </>
          ) : (
            <>
              <Icon name="forbid-2-line" />
              Block {person.name.split(" ")[0]}
              <small className="ml-auto text-[10px]">Cease contact</small>
            </>
          )}
        </button>
      </div>
      {showBlock && (
        <BlockDialog
          person={person}
          onClose={() => setShowBlock(false)}
          onBlock={() => {
            dispatch(appendBlocked(userId));
            setShowBlock(false);
          }}
        />
      )}
    </section>
  );
}
