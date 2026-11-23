import { Link } from "react-router";
import { useSelector } from "react-redux";
import Avatar from "../../../../shared/ui/Avatar";
import Icon from "../../../../shared/ui/Icon";

export default function AccountSettingsPage() {
  const { user, profile } = useSelector((state) => state.auth);
  return (
    <section className="mx-auto min-h-full max-w-xl px-4 pb-10 pt-5 sm:px-6">
      <header className="flex items-center gap-3">
        <Link
          to="/app/you"
          className="grid size-9 place-items-center rounded-full hover:bg-surface-container"
          aria-label="Back"
        >
          <Icon name="arrow-left-s-line" className="text-xl" />
        </Link>
        <h1 className="font-heading text-headline-sm">Account</h1>
      </header>
      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white p-4">
        <Avatar name={user?.name} src={user?.avatarUrl} size="size-16" />
        <div>
          <h2 className="font-heading text-title-md">
            {user?.name || "Your name"}
          </h2>
          <p className="text-body-sm text-outline">
            @{user?.username || "your-id"}
          </p>
        </div>
      </div>
      <div className="mt-3 divide-y divide-sage-green/20 rounded-2xl bg-white px-4">
        <div className="py-4">
          <span className="text-label-sm text-outline">Display name</span>
          <p className="mt-1 text-body-md">{user?.name || "Not set"}</p>
        </div>
        <div className="py-4">
          <span className="text-label-sm text-outline">enChat ID</span>
          <p className="mt-1 text-body-md">@{user?.username || "Not set"}</p>
        </div>
        <div className="py-4">
          <span className="text-label-sm text-outline">Bio</span>
          <p className="mt-1 text-body-sm">
            {profile?.bio || "Add a few words about yourself in profile setup."}
          </p>
        </div>
        <div className="py-4">
          <span className="text-label-sm text-outline">Profile visibility</span>
          <p className="mt-1 text-body-sm capitalize">
            {profile?.profilePrivacyOption || "Everyone"}
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-sage-green/15 p-4 text-body-sm text-on-surface-variant">
        <Icon name="information-line" className="mr-2" />
        Account editing is a preview. Profile and privacy APIs will be connected
        in a later backend pass.
      </div>
    </section>
  );
}
