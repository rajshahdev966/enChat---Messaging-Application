import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { PageHeader, PrivacyNote } from "../../../../shared/ui/AuthLayout";
import Button from "../../../../shared/ui/Button";
import FormField from "../../../../shared/ui/FormField";
import { useForm } from "react-hook-form";
import { clearAuthError, loginUser } from "../../state/authSlice";
export default function SignInPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const submitHandler = async (values) => {
    dispatch(clearAuthError());
    try {
      await dispatch(loginUser(values)).unwrap();
      navigate(location.state?.from || "/app", { replace: true });
    } catch (error) {
      Object.entries(error.errors || {}).forEach(([field, message]) => {
        setError(field, { type: "server", message });
      });
    }
  }
  return (
    <main className="flex min-h-svh flex-1 flex-col lg:min-h-0">
      <PageHeader title="Sign In" />
      <PrivacyNote />
      <div className="mb-6 text-center">
        <h1 className="font-heading text-headline-lg">
          Good to have you back.
        </h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Enter your details to access your personal space.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex flex-1 flex-col"
      >
        <div className="space-y-5 rounded-xl bg-white p-4 shadow-panel">
          <FormField
            label="Email"
            {...register("email", {
              required: "Please enter your email address.",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." },
            })}
            icon="at-line"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
          />
          <FormField
            label="Password"
            {...register("password", { required: "Please enter your password." })}
            type="password"
            icon="lock-line"
            autoComplete="current-password"
            error={errors.password?.message}
          />
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-label-md underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          {authError && !Object.keys(authError.errors || {}).length && (
            <p role="alert" className="text-body-sm text-error">{authError.message}</p>
          )}
        </div>
        <div className="mt-auto pt-8">
          <Button type="submit" arrow disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="pt-5 text-center text-body-sm">
            New here?{" "}
            <Link
              to="/create-account"
              className="ml-1 font-semibold underline decoration-vivid-yellow decoration-2 underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
