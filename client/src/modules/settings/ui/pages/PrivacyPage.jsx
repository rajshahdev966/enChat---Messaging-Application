import { Link } from "react-router";
import Icon from "../../../../shared/ui/Icon";
import { useSettings } from "../../hooks/useSettings";

const settingKey = {
  Everyone: "everyone",
  "My contacts": "contacts",
  Nobody: "me",
};

function SelectRow({ title, description, value, onChange }) {
  return (
    <label className="flex min-h-[62px] items-center gap-3 border-b border-sage-green/20 py-3 last:border-0">
      <span className="min-w-0 flex-1">
        <strong className="block text-label-lg">{title}</strong>
        <small className="block truncate text-label-sm text-outline">
          {description}
        </small>
      </span>
      <select
        value={settingKey[value] || value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-32 rounded-full bg-surface-container px-3 py-2 text-label-sm outline-none"
      >
        <option value="everyone">Everyone</option>
        <option value="contacts">My contacts</option>
        <option value="me">Nobody</option>
      </select>
    </label>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <label className="flex min-h-[62px] cursor-pointer items-center gap-3 border-b border-sage-green/20 py-3 last:border-0">
      <span className="min-w-0 flex-1">
        <strong className="block text-label-lg">{title}</strong>
        <small className="block text-label-sm text-outline">
          {description}
        </small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-bottle-green"
      />
    </label>
  );
}

export default function PrivacyPage() {
  const { values, setSetting } = useSettings();
  return (
    <section className="mx-auto min-h-full max-w-2xl px-4 pb-10 pt-5 sm:px-6">
      <header className="mb-5 flex items-center gap-3">
        <Link
          to="/app/you"
          className="grid size-9 place-items-center rounded-full hover:bg-surface-container"
          aria-label="Back"
        >
          <Icon name="arrow-left-s-line" className="text-xl" />
        </Link>
        <div>
          <span className="rounded-full bg-sage-green/15 px-2.5 py-1 text-[10px] font-semibold tracking-widest">
            QUIET CONTROLS
          </span>
          <h1 className="mt-2 font-heading text-headline-sm">
            Your space, your rules.
          </h1>
        </div>
      </header>
      <p className="max-w-xl text-body-sm text-on-surface-variant">
        Choose what others see when they connect with you on enChat. You are in
        complete control of your presence.
      </p>
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-outline">
          <h2>Profile & presence</h2>
          <span>Audience</span>
        </div>
        <div className="rounded-2xl bg-white px-4 shadow-panel">
          <SelectRow
            title="Profile"
            description="Who can find your profile"
            value={values.profilePrivacyOption}
            onChange={(value) => setSetting("profilePrivacyOption", value)}
          />
          <SelectRow
            title="Profile photo"
            description="Who can see your avatar"
            value={values.profilePhotoPrivacyOption}
            onChange={(value) => setSetting("profilePhotoPrivacyOption", value)}
          />
          <SelectRow
            title="Bio"
            description="Who can read your personal bio"
            value={values.bioPrivacyOption}
            onChange={(value) => setSetting("bioPrivacyOption", value)}
          />
          <SelectRow
            title="Last seen"
            description="Timestamp of when you were last active"
            value={values.lastSeenPrivacy}
            onChange={(value) => setSetting("lastSeenPrivacy", value)}
          />
          <SelectRow
            title="Online status"
            description="Display active green indicator"
            value={values.onlineStatusPrivacy}
            onChange={(value) => setSetting("onlineStatusPrivacy", value)}
          />
        </div>
      </section>
      <section className="mt-6">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-outline">
          Interactions & reach
        </div>
        <div className="rounded-2xl bg-white px-4 shadow-panel">
          <ToggleRow
            title="Read receipts"
            description="Let others know when you have seen their messages"
            checked={values.readReceipts}
            onChange={(value) => setSetting("readReceipts", value)}
          />
          <ToggleRow
            title="Let people find me by username"
            description="Allow people to look up your ID in the directory"
            checked={values.discoverableByUsername}
            onChange={(value) => setSetting("discoverableByUsername", value)}
          />
        </div>
      </section>
      <section className="mt-6">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-outline">
          Boundaries
        </div>
        <Link
          to="/app/settings/blocked"
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-panel"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-surface-container">
            <Icon name="forbid-2-line" />
          </span>
          <span className="flex-1">
            <strong className="block text-label-lg">Blocked users</strong>
            <small className="text-label-sm text-outline">
              Manage contacts you have paused or set boundaries with
            </small>
          </span>
          <Icon name="arrow-right-s-line" />
        </Link>
      </section>
      <div className="mt-6 rounded-2xl bg-surface-container p-4">
        <strong className="text-label-lg">
          <Icon name="flower-line" className="mr-2" />
          Mindful privacy
        </strong>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          These are local preview settings for now. They will take effect across
          your account when the privacy API is added.
        </p>
      </div>
    </section>
  );
}
