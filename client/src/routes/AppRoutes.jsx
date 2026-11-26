import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Link } from "react-router";
import AuthLayout from "../shared/ui/AuthLayout";
import AppShell from "../shared/ui/AppShell";
import { ProtectedRoute, PublicOnlyRoute } from "./protected-routes/RouteGuard";

const WelcomePage = lazy(() => import("../shared/ui/WelcomePage"));
const SignInPage = lazy(() => import("../modules/auth/ui/pages/SignInPage"));
const CreateAccountPage = lazy(
  () => import("../modules/auth/ui/pages/CreateAccountPage"),
);
const ForgotPasswordPage = lazy(
  () => import("../modules/auth/ui/pages/ForgotPasswordPage"),
);
const ProfileSetupPage = lazy(
  () => import("../modules/auth/ui/pages/ProfileSetupPage"),
);
const ChatsPage = lazy(
  () => import("../modules/conversations/ui/pages/ChatsPage"),
);
const ChatPage = lazy(
  () => import("../modules/conversations/ui/pages/ChatPage"),
);
const PeoplePage = lazy(() => import("../modules/people/ui/pages/PeoplePage"));
const PersonProfilePage = lazy(
  () => import("../modules/people/ui/pages/PersonProfilePage"),
);
const YouPage = lazy(() => import("../modules/settings/ui/pages/YouPage"));
const PrivacyPage = lazy(
  () => import("../modules/settings/ui/pages/PrivacyPage"),
);
const BlockedContactsPage = lazy(
  () => import("../modules/settings/ui/pages/BlockedContactsPage"),
);
const AccountSettingsPage = lazy(
  () => import("../modules/settings/ui/pages/AccountSettingsPage"),
);
const AppearancePage = lazy(
  () => import("../modules/settings/ui/pages/AppearancePage"),
);

function RouteContent({ title, children }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[55svh] place-items-center text-body-sm text-outline">
          Opening your private space…
        </div>
      }
    >
      <title>{title} | enChat</title>
      {children}
    </Suspense>
  );
}

function InfoPage({ title }) {
  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <h1 className="font-heading text-headline-lg">{title}</h1>
      <p className="my-5 text-body-sm text-outline">
        This preview page will be completed in a later frontend pass.
      </p>
      <Link to="/app/you" className="underline">
        Back to your space
      </Link>
    </main>
  );
}

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: (
          <PublicOnlyRoute>
            <RouteContent title="Just Between Us">
              <WelcomePage />
            </RouteContent>
          </PublicOnlyRoute>
        ),
      },
      {
        path: "/sign-in",
        element: (
          <PublicOnlyRoute>
            <RouteContent title="Sign In">
              <SignInPage />
            </RouteContent>
          </PublicOnlyRoute>
        ),
      },
      {
        path: "/create-account",
        element: (
          <PublicOnlyRoute>
            <RouteContent title="Create Account">
              <CreateAccountPage />
            </RouteContent>
          </PublicOnlyRoute>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <PublicOnlyRoute>
            <RouteContent title="Reset Password">
              <ForgotPasswordPage />
            </RouteContent>
          </PublicOnlyRoute>
        ),
      },
      {
        path: "/profile-setup",
        element: (
          <ProtectedRoute>
            <RouteContent title="Profile Setup">
              <ProfileSetupPage />
            </RouteContent>
          </ProtectedRoute>
        ),
      },
      { path: "/terms", element: <InfoPage title="Terms" /> },
      { path: "/privacy", element: <InfoPage title="Privacy Policy" /> },
      {
        path: "*",
        element: (
          <main className="mx-auto max-w-xl px-5 py-12">
            <h1 className="font-heading text-headline-lg">Page not found</h1>
            <Link to="/" className="mt-4 block underline">
              Return home
            </Link>
          </main>
        ),
      },
    ],
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RouteContent title="Chats">
            <ChatsPage />
          </RouteContent>
        ),
      },
      {
        path: "people",
        element: (
          <RouteContent title="People">
            <PeoplePage />
          </RouteContent>
        ),
      },
      {
        path: "people/:userId",
        element: (
          <RouteContent title="Profile">
            <PersonProfilePage />
          </RouteContent>
        ),
      },
      {
        path: "conversations/:conversationId",
        element: (
          <RouteContent title="Conversation">
            <ChatPage />
          </RouteContent>
        ),
      },
      {
        path: "you",
        element: (
          <RouteContent title="Your Account">
            <YouPage />
          </RouteContent>
        ),
      },
      {
        path: "settings/privacy",
        element: (
          <RouteContent title="Privacy">
            <PrivacyPage />
          </RouteContent>
        ),
      },
      {
        path: "settings/blocked",
        element: (
          <RouteContent title="Blocked Contacts">
            <BlockedContactsPage />
          </RouteContent>
        ),
      },
      {
        path: "settings/account",
        element: (
          <RouteContent title="Account">
            <AccountSettingsPage />
          </RouteContent>
        ),
      },
      {
        path: "settings/appearance",
        element: (
          <RouteContent title="Appearance">
            <AppearancePage />
          </RouteContent>
        ),
      },
      {
        path: "settings/notifications",
        element: <InfoPage title="Notifications" />,
      },
      { path: "settings/help", element: <InfoPage title="Help and Support" /> },
      { path: "*", element: <InfoPage title="Page not found" /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
