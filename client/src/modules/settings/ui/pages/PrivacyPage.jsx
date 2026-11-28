import { Link } from "react-router";
import Icon from "../../../../shared/ui/Icon";
import { useSettings } from "../../hooks/useSettings";
import { useState } from "react";
import { saveProfile } from "../../../auth/state/authSlice";

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

export default function PrivacyPage() {
  const { values, setSetting, saving, error } = useSettings();
  const [savedKey, setSavedKey] = useState(null);
  const changeSetting = async (key, value) => {
    const result = await setSetting(key, value);
    if (saveProfile.fulfilled.match(result)) {
      setSavedKey(key);
      window.setTimeout(
        () => setSavedKey((current) => (current === key ? null : current)),
        1800,
      );
    }
  };
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

        <h1 className="font-heading text-headline-sm">
          Your space, your rules.
        </h1>
      </header>
      <p className="max-w-xl text-body-sm text-on-surface-variant">
        Choose what others see when they connect with you on enChat. You are in
        complete control of your presence.
      </p>
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-outline">
          <h2>Profile & presence</h2>
        </div>
        <div className="rounded-2xl bg-white px-4 shadow-panel">
          <SelectRow
            title="Profile"
            description="Who can find your profile"
            value={values.profilePrivacyOption}
            onChange={(value) => changeSetting("profilePrivacyOption", value)}
          />
          <SelectRow
            title="Profile photo"
            description="Who can see your avatar"
            value={values.profilePhotoPrivacyOption}
            onChange={(value) =>
              changeSetting("profilePhotoPrivacyOption", value)
            }
          />
          <SelectRow
            title="Bio"
            description="Who can read your personal bio"
            value={values.bioPrivacyOption}
            onChange={(value) => changeSetting("bioPrivacyOption", value)}
          />
          <SelectRow
            title="Caption"
            description="Who can read your profile caption"
            value={values.userCaptionPrivacyOption}
            onChange={(value) =>
              changeSetting("userCaptionPrivacyOption", value)
            }
          />
          <SelectRow
            title="Last seen"
            description="Timestamp of when you were last active"
            value={values.lastSeenPrivacy}
            onChange={(value) => changeSetting("lastSeenPrivacy", value)}
          />
          <SelectRow
            title="Online status"
            description="Display active green indicator"
            value={values.onlineStatusPrivacy}
            onChange={(value) => changeSetting("onlineStatusPrivacy", value)}
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
      {(saving || error || savedKey) && (
        <p
          role="status"
          className={`mt-4 text-label-sm ${error ? "text-error" : "text-outline"}`}
        >
          {error?.message ||
            (saving ? "Saving privacy settings…" : "Privacy setting saved.")}
        </p>
      )}
    </section>
  );
}
