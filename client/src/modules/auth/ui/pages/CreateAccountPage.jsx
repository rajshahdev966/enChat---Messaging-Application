import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { PageHeader } from "../../../../shared/ui/AuthLayout";
import Button from "../../../../shared/ui/Button";
import FormField from "../../../../shared/ui/FormField";
import { passwordRules } from "../../api/mockAuth";
import PasswordRules from "../components/PasswordRules";
import UsernameField from "../components/UsernameField";
import { clearAuthError, registerUser } from "../../state/authSlice";

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  async function submit(values) {
    dispatch(clearAuthError());
    try {
      await dispatch(registerUser({
        name: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
      })).unwrap();
      navigate("/profile-setup", { replace: true });
    } catch (error) {
      const fieldMap = { name: "fullName", username: "username", email: "email", password: "password" };
      Object.entries(error.errors || {}).forEach(([field, message]) => {
        setError(fieldMap[field] || field, { type: "server", message });
      });
    }
  }

  return (
    <main className="flex min-h-svh flex-1 flex-col lg:min-h-0">
      <PageHeader title="Create Account" />
      <span className="rounded-full bg-sage-green/15 px-3 py-1 text-[10px]">
        Your personal sanctuary
      </span>
      <h1 className="mt-3 font-heading text-headline-lg">
        Let's get to know you.
      </h1>
      <p className="mb-6 mt-2 text-body-sm text-on-surface-variant">
        Step into your private space. Just a few details to get started.
      </p>
      <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col" noValidate>
        <div className="space-y-4">
          <FormField
          label="Full name (visible only to contacts)"
          {...register("fullName", {
            required: "Please enter your full name.",
            minLength: {
              value: 2,
              message: "Your name must contain at least 2 characters.",
            },
          })}
          placeholder="Aarav Mehta"
          autoComplete="name"
          error={errors.fullName?.message}
          />
          <UsernameField
          control={control}
          register={register}
          error={errors.username?.message}
          />
          <FormField
          label="Email address"
          {...register("email", {
            required: "Please enter your email address.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address.",
            },
          })}
          type="email"
          placeholder="aarav.mehta@college.edu"
          autoComplete="email"
          error={errors.email?.message}
          />
          <FormField
          label="Password"
          {...register("password", {
            required: "Please create a passkey.",
            validate: (value) =>
              passwordRules.every((rule) => rule.test(value)) ||
              "Your passkey must meet every strength guideline.",
          })}
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          />
          <PasswordRules control={control} />
        </div>
        <div className="mt-auto pt-8">
          <label className="flex items-center gap-3 py-1 text-label-md">
            <input
              type="checkbox"
              {...register("terms", {
                required: "You must accept the Terms and Privacy Policy.",
              })}
              className="size-5 accent-secondary"
            />
            <span>
              I agree to enChat's <Link to="/terms" className="underline">Terms</Link>{" "}
              and <Link to="/privacy" className="underline">Privacy Policy</Link>.
            </span>
          </label>
          {errors.terms && (
            <p role="alert" className="mt-2 text-body-sm text-error">{errors.terms.message}</p>
          )}
          {authError && !Object.keys(authError.errors || {}).length && (
            <p role="alert" className="mt-2 text-body-sm text-error">{authError.message}</p>
          )}
          <Button type="submit" arrow disabled={isSubmitting || loading} className="mt-4">
            {loading ? "Creating account…" : "Create account"}
          </Button>
          <p className="mt-5 text-center text-body-sm">
            Already have an account?{" "}
            <Link to="/sign-in" className="font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </form>
    </main>
  );
}
