import { Link } from "react-router"
import { useSelector } from "react-redux"
import Icon from "../../../../shared/ui/Icon"
import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto"

export default function AccountSettingsPage() {
  const { user, profile: storedProfile } = useSelector((state) => state.auth)
  const profile = storedProfile || {}
  return (
    <section className="mx-auto min-h-full max-w-xl px-4 pb-10 pt-5 sm:px-6">
      <header className="flex items-center gap-3">
        <Link to="/app/you" className="grid size-9 place-items-center rounded-full hover:bg-surface-container" aria-label="Back">
          <Icon name="arrow-left-s-line" className="text-xl" />
        </Link>
        <h1 className="font-heading text-headline-sm">Account</h1>
      </header>
      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white p-4">
        <ProfilePhoto name={user?.name} photoPath={profile.profilePhoto?.filePath} size="size-16" />
        <div className="min-w-0">
          <h2 className="truncate font-heading text-title-md">{user?.name}</h2>
          <p className="truncate text-body-sm text-outline">@{user?.username}</p>
        </div>
        <Link to="/profile-setup" className="ml-auto rounded-full bg-surface-container px-3 py-2 text-label-sm">Edit profile</Link>
      </div>
      <div className="mt-3 divide-y divide-sage-green/20 rounded-2xl bg-white px-4">
        <div className="py-4"><span className="text-label-sm text-outline">Display name</span><p className="mt-1 text-body-md">{user?.name}</p><small className="text-label-sm text-outline">Names are currently managed by the account and cannot be edited here.</small></div>
        <div className="py-4"><span className="text-label-sm text-outline">enChat ID</span><p className="mt-1 text-body-md">@{user?.username}</p><small className="text-label-sm text-outline">Share this ID privately to receive contact requests.</small></div>
        <div className="py-4"><span className="text-label-sm text-outline">Bio</span><p className="mt-1 text-body-sm">{profile.bio || "No bio added."}</p></div>
        <div className="py-4"><span className="text-label-sm text-outline">Profile caption</span><p className="mt-1 text-body-sm">{profile.userCaption || "No caption added."}</p></div>
      </div>
      <div className="mt-4 rounded-2xl bg-sage-green/15 p-4 text-body-sm text-on-surface-variant">
        <Icon name="shield-check-line" className="mr-2" />
        Only one active account session is allowed. Signing in elsewhere replaces this session.
      </div>
    </section>
  )
}
