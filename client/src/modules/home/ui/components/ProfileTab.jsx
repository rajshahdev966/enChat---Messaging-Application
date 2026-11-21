import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto";

/** Renders normalized user profile records; a future profiles API can pass its response directly. */
export default function ProfileTab({ profiles = [] }) {
  if (!profiles.length) {
    return (
      <p className="text-body-sm text-on-surface-variant">
        Your conversations will live here.
      </p>
    );
  }

  return (
    <section aria-label="Profiles" className="space-y-4">
      {profiles.map((profile) => (
        <article
          key={profile.id || profile._id || profile.username}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-panel"
        >
          <ProfilePhoto
            name={profile.name}
            photoPath={profile.profile?.profilePhoto}
            size="size-14"
          />
          <div className="min-w-0">
            <h2 className="truncate text-label-lg">{profile.name}</h2>
            {profile.username && (
              <p className="text-body-sm text-outline">@{profile.username}</p>
            )}
            {profile.profile?.userCaption && (
              <p className="mt-1 truncate text-body-sm text-on-surface-variant">
                {profile.profile.userCaption}
              </p>
            )}
            {profile.profile?.bio && (
              <p className="mt-1 line-clamp-2 text-body-sm text-on-surface-variant">
                {profile.profile.bio}
              </p>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
