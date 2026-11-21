import { createBrowserRouter, RouterProvider, Link } from "react-router";
import AuthLayout from "../shared/ui/AuthLayout";
import WelcomePage from "../shared/ui/WelcomePage";
import SignInPage from "../modules/auth/ui/pages/SignInPage";
import CreateAccountPage from "../modules/auth/ui/pages/CreateAccountPage";
import ForgotPasswordPage from "../modules/auth/ui/pages/ForgotPasswordPage";
import ProfileSetupPage from "../modules/auth/ui/pages/ProfileSetupPage";
import HomePage from "../modules/home/ui/pages/HomePage";
import { ProtectedRoute, PublicOnlyRoute } from "./protected-routes/RouteGuard";

function InfoPage({ title }) {
  return (
    <main className="py-12">
      <title>{title} | enChat</title>
      <h1 className="font-heading text-headline-lg">{title}</h1>
      <p className="my-5">
        This frontend preview does not yet provide a published{" "}
        {title.toLowerCase()} document.
      </p>
      <Link to="/" className="underline">
        Back to welcome
      </Link>
    </main>
  );
}

const page = (title, element) => (
  <>
    <title>{title} | enChat</title>
    {element}
  </>
);


const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: <PublicOnlyRoute>{page("Just Between Us", <WelcomePage />)}</PublicOnlyRoute>,
      },
      {
        path: "/sign-in",
        element: <PublicOnlyRoute>{page("Sign In", <SignInPage />)}</PublicOnlyRoute>,
      },
      {
        path: "/create-account",
        element: <PublicOnlyRoute>{page("Create Account", <CreateAccountPage />)}</PublicOnlyRoute>,
      },
      {
        path: "/forgot-password",
        element: <PublicOnlyRoute>{page("Reset Password", <ForgotPasswordPage />)}</PublicOnlyRoute>,
      },
      {
        path: "/profile-setup",
        element: <ProtectedRoute>{page("Profile Setup", <ProfileSetupPage />)}</ProtectedRoute>,
      },
      { path: "/terms", element: <InfoPage title="Terms" /> },
      { path: "/privacy", element: <InfoPage title="Privacy Policy" /> },
      {
        path: "*",
        element: (
          <main className="py-12">
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
    element: <ProtectedRoute>{page("Conversations", <HomePage />)}</ProtectedRoute>,
  },
]);


export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
