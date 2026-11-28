import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Icon from "../../../../shared/ui/Icon";
import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto";
import { logoutUser } from "../../../auth/state/authSlice";
import { fetchBlockedUsers } from "../../../people/state/peopleSlice";

function MenuRow({ to, icon, title, description, trailing }) {
  return (
    <Link
      to={to}
      className="flex min-h-[62px] items-center gap-3 border-b border-sage-green/20 py-3 last:border-0"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-container">
        <Icon name={icon} className="text-lg" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-label-lg">{title}</strong>
        <small className="block truncate text-label-sm text-outline">
          {description}
        </small>
      </span>
      <span className="text-label-sm text-outline">
        {trailing || <Icon name="arrow-right-s-line" className="text-lg" />}
      </span>
    </Link>
  );
}

export default function YouPage() {
  const dispatch = useDispatch();
  const { user, profile: storedProfile } = useSelector((state) => state.auth);
  const profile = storedProfile || {};
  const blockedCount = useSelector((state) => state.people.blockedIds.length);
  const appearance = useSelector((state) => state.settings.appearance);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(fetchBlockedUsers());
  }, [dispatch]);

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.origin + "/app/people/" + user.id,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard access may be unavailable in this browser context. */
    }
  };

  return (
    <section className="mx-auto min-h-full max-w-2xl px-4 pb-8 pt-5 sm:px-6">
      <h1 className="sr-only">Your account</h1>
      <div className="mx-auto max-w-md rounded-3xl bg-white p-5 text-center shadow-panel">
        <h2 className="mt-4 font-heading text-headline-sm">
          Your little corner of enChat.
        </h2>
        <p className="mt-2 text-body-sm text-outline">
          An unhurried space tuned for privacy, deep focus, and your quiet
          circle.
        </p>
        <div className="flex justify-center pt-4">
          <ProfilePhoto
            name={user?.name}
            photoPath={profile.profilePhoto?.filePath}
            size="size-25"
          />
        </div>
        <p className="mt-3 font-heading text-title-md">{user?.name}</p>
        <p className="text-body-sm text-outline">
          @{user?.username} · Single active session
        </p>
        <p className="mx-auto mt-3 max-w-sm text-body-sm text-on-surface-variant">
          {profile.userCaption ||
            profile.bio ||
            "Your profile is ready for a few words about you."}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-surface-container p-3">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-outline">
              Session policy
            </span>
            <strong className="text-label-md">One active session</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-outline">
              Your enChat ID
            </span>
            <strong className="text-label-md">@{user?.username}</strong>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            to="/profile-setup"
            state={{ from: "/app/you" }}
            className="rounded-xl bg-surface-container py-3 text-label-md"
          >
            <Icon name="edit-line" /> Edit profile
          </Link>
          <Link
            to={"/app/people/" + user?.id}
            className="rounded-xl bg-vivid-yellow py-3 text-label-md"
          >
            <Icon name="user-3-line" /> Show profile
          </Link>
          <button
            onClick={copyProfileLink}
            className="col-span-2 rounded-xl bg-surface-container py-3 text-label-md"
          >
            <Icon name="file-copy-line" />{" "}
            {copied ? "Profile link copied" : "Copy profile link"}
          </button>
        </div>
      </div>
      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-outline">
          <span>Privacy & account</span>
        </div>
        <div className="rounded-2xl bg-white px-4 shadow-panel">
          <MenuRow
            to="/app/settings/account"
            icon="user-settings-line"
            title="Account"
            description="Account details and security"
          />
          <MenuRow
            to="/app/settings/privacy"
            icon="shield-keyhole-line"
            title="Privacy"
            description="Profile visibility and presence"
            trailing={blockedCount + " blocked ›"}
          />
        </div>
      </div>
      <div className="mt-6">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-outline">
          Experience & app
        </div>
        <div className="rounded-2xl bg-white px-4 shadow-panel">
          <MenuRow
            to="/app/settings/appearance"
            icon="contrast-2-line"
            title="Appearance"
            description={
              appearance.colorMode === "system"
                ? "Following device preference"
                : appearance.colorMode === "dark"
                  ? "Sanctuary Nocturne"
                  : "Sanctuary Quietude"
            }
          />
          <MenuRow
            to="/app/settings/notifications"
            icon="notification-3-line"
            title="Notifications"
            description="Notification preferences"
          />
          <MenuRow
            to="/app/settings/help"
            icon="question-line"
            title="Help and support"
            description="FAQ and contact trust & safety"
          />
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-sage-green/15 p-4 text-label-sm text-on-surface-variant">
        <Icon name="shield-check-line" className="mr-2 text-bottle-green" />
        Signing out revokes this session and disconnects it.
      </div>
      <button
        onClick={() => dispatch(logoutUser())}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-error/10 text-error"
      >
        <Icon name="logout-box-r-line" /> Sign out
      </button>
    </section>
  );
}
