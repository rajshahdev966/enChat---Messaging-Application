import { useDispatch, useSelector } from "react-redux";
import Button from "../../../../shared/ui/Button";
import { logoutUser } from "../../../auth/state/authSlice";
import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto";
import ProfileTab from "../components/ProfileTab";

export default function HomePage() {
  const dispatch = useDispatch();
  const {user} = useSelector((state) => state.auth);
  return (
    <main className="mx-auto flex min-h-svh max-w-chat flex-col px-4 py-8">
      <p className="text-label-md text-outline">SIGNED IN AS</p>
      <div className="my-6 flex items-center gap-4">
        <ProfilePhoto
          name={user?.name}
          photoPath={user?.profile?.profilePhoto?.filePath}
        />
        <div>
          <h1 className="font-heading text-headline-lg">
            Welcome, {user?.name}.
          </h1>
          <p className="text-body-sm text-outline">@{user?.username}</p>
        </div>
      </div>
      <ProfileTab
        profiles={user ? [{ ...user, profile: user?.profile || {} }] : []}
      />
      <Button
        className="mt-auto"
        variant="secondary"
        onClick={() => dispatch(logoutUser())}
      >
        Sign out
      </Button>
    </main>
  );
}
