import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../../../../shared/ui/Avatar";
import Icon from "../../../../shared/ui/Icon";
import { logoutUser } from "../../../auth/state/authSlice";
import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto";

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
  const { user, profile } = useSelector((state) => state.auth);
  const blockedCount = useSelector((state) => state.people.blockedIds.length);
  return (
    <section className="mx-auto min-h-full max-w-2xl px-4 pb-8 pt-5 sm:px-6">
      <h1 className="sr-only">Your account</h1>
      <div className="mx-auto max-w-md rounded-3xl bg-white p-5 text-center shadow-panel">
        <span className="rounded-full bg-sage-green/15 px-3 py-1 text-[10px] font-semibold tracking-widest">
          <Icon name="sparkling-2-fill" /> SANCTUARY QUIETUDE
        </span>
        <h2 className="mt-4 font-heading text-headline-sm">
          Your little corner of enChat.
        </h2>
        <p className="mt-2 text-body-sm text-outline">
          An unhurried space tuned for privacy, deep focus, and your quiet
          circle.
        </p>
        <div className="pt-3 flex justify-center">
          <ProfilePhoto
            name={profile.name}
            photoPath={profile.profilePhoto?.filePath}
            size="size-25"
          />
        </div>
        <p className="mt-3 font-heading text-title-md">
          {user?.name || "Raj Shah"}{" "}
          <Icon name="verified-badge-fill" className="text-secondary" />
        </p>
        <p className="text-body-sm text-outline">
          @{user?.username || "raj.shah"} · Session Active
        </p>
        <p className="mx-auto mt-3 max-w-sm text-body-sm text-on-surface-variant">
          Mindful technologist & writer. Designing quiet spaces in noisy places.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-surface-container p-3">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-outline">
              Device keys
            </span>
            <strong className="text-label-md">Ed25519 · Session 1</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-outline">
              Quiet cadence
            </span>
            <strong className="text-label-md">22:00 – 07:30</strong>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            to="/app/settings/account"
            className="rounded-xl bg-surface-container py-3 text-label-md"
          >
            <Icon name="edit-line" /> Edit profile
          </Link>
          <button className="rounded-xl bg-vivid-yellow py-3 text-label-md">
            <Icon name="qr-code-line" /> Share profile
          </button>
        </div>
      </div>
      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-outline">
          <span>Privacy & devices</span>
          <span className="text-secondary">● Zero telemetry</span>
        </div>
        <div className="rounded-2xl bg-white px-4 shadow-panel">
          <MenuRow
            to="/app/settings/account"
            icon="user-settings-line"
            title="Account"
            description="Profile information and account details"
          />
          <MenuRow
            to="/app/settings/privacy"
            icon="shield-keyhole-line"
            title="Privacy"
            description="Quiet hours, blocked contacts, profile visibility"
            trailing={`${blockedCount} blocked ›`}
          />
          <MenuRow
            to="/app/settings/devices"
            icon="device-line"
            title="Connected devices"
            description="This session · Multi-device later"
            trailing="1 active"
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
            description="Sanctuary Quietude · Light mode"
          />
          <MenuRow
            to="/app/settings/notifications"
            icon="notification-3-line"
            title="Notifications"
            description="Mute rules, quiet hours, unread design"
          />
          <MenuRow
            to="/app/settings/help"
            icon="question-line"
            title="Help and support"
            description="FAQ, contact trust & safety"
          />
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-sage-green/15 p-4 text-label-sm text-on-surface-variant">
        <Icon name="shield-check-line" className="mr-2 text-bottle-green" />
        Unhurried by design. Read receipts and active typing broadcasts are
        muted by default in your quiet circle.
      </div>
      <button
        onClick={() => dispatch(logoutUser())}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-error/10 text-error"
      >
        <Icon name="logout-box-r-line" />
        Sign out
      </button>
      <p className="mt-4 text-center text-[10px] text-outline">
        Signing out will clear local session encryption cache on this device.
      </p>
    </section>
  );
}
