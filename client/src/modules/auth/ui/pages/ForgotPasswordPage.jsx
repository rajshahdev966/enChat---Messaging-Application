import { useState } from "react";
import { Link } from "react-router";
import { PageHeader, PrivacyNote } from "../../../../shared/ui/AuthLayout";
import Button from "../../../../shared/ui/Button";
import FormField from "../../../../shared/ui/FormField";
import Icon from "../../../../shared/ui/Icon";
import PasswordRules from "../components/PasswordRules";
import { useForm } from "react-hook-form";
import { passwordRules } from "../../api/mockAuth";
import {
  forgotPasswordRequest,
  resetPasswordRequest,
  verifyResetCodeRequest,
} from "../../api/auth.api";
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [devCode, setDevCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, control, handleSubmit, setError, clearErrors, formState: { errors } } = useForm({ defaultValues: {
    email: "",
    code: "",
    password: "",
    confirm: "",
  } });
  const labels = ["Email", "Code", "Password", "Done"];
  async function submit(values) {
    setLoading(true);
    setServerError("");
    clearErrors();
    try {
      if (step === 0) {
        const response = await forgotPasswordRequest(values.email);
        setDevCode(response.data?.devCode || "");
      } else if (step === 1) {
        await verifyResetCodeRequest(values.email, values.code);
      } else if (step === 2) {
        if (values.password !== values.confirm) {
          setError("confirm", { type: "validate", message: "Both passwords must match." });
          return;
        }
        await resetPasswordRequest(values.email, values.code, values.password);
      }
      setStep((previous) => previous + 1);
    } catch (error) {
      Object.entries(error.errors || {}).forEach(([field, message]) => {
        setError(field, { type: "server", message });
      });
      if (!Object.keys(error.errors || {}).length) setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="flex min-h-svh flex-1 flex-col lg:min-h-0">
      <PageHeader title="Password Reset" back="/sign-in" />
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-[10px]">
          <span className="tracking-widest text-outline">STEP NAVIGATION</span>
          <span>
            {step + 1} of 4: {labels[step]}
          </span>
        </div>
        <ol className="grid grid-cols-4 rounded-xl bg-surface-container p-1">
          {labels.map((label, index) => (
            <li
              key={label}
              aria-current={index === step ? "step" : undefined}
              className={`rounded-lg p-2 text-center text-[11px] ${index === step ? "bg-white font-semibold" : ""}`}
            >
              <span
                className={`mx-auto mb-1 flex size-5 items-center justify-center rounded-full ${index <= step ? "bg-vivid-yellow" : "bg-surface-container-high"}`}
              >
                {index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
      </div>
      <PrivacyNote>Private password recovery</PrivacyNote>
      <section className="flex flex-1 flex-col rounded-xl bg-white p-5 shadow-panel sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <Icon
            name="lock-password-line"
            className="rounded-xl bg-surface-container-low p-3 text-2xl"
          />
          <span className="rounded-full bg-sage-green/40 px-3 py-1 text-[10px]">
            Frontend demo
          </span>
        </div>
        <h1 className="font-heading text-headline-sm">
          {
            [
              "Forgot your password?",
              "Check your inbox",
              "Set new password",
              "You are all set.",
            ][step]
          }
        </h1>
        <p className="mb-6 mt-2 text-body-sm text-on-surface-variant">
          {
            [
              "Enter the email associated with your account.",
              devCode ? `Development reset code: ${devCode}` : "Enter the code sent to your email address.",
              "Choose a phrase or character sequence unique to this haven.",
              "The password reset preview is complete. No credentials were changed.",
            ][step]
          }
        </p>
        {step < 3 ? (
          <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col">
            <div className="space-y-4">
              {step === 0 && (
                <FormField
                  key="email"
                  label="Email address"
                  {...register("email", {
                    required: "Please enter your email address.",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." },
                  })} type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
              {step === 1 && (
                <FormField
                  key="code"
                  label="Verification code"
                  {...register("code", {
                    required: "Enter the reset code.",
                    pattern: { value: /^\d{6}$/, message: "Enter the 6-digit reset code." },
                  })}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  error={errors.code?.message}
                />
              )}
              {step === 2 && (
                <>
                  <FormField
                    label="New Password"
                    {...register("password", {
                      required: "Please create a new password.",
                      validate: (value) => passwordRules.every((rule) => rule.test(value)) || "Meet every password guideline.",
                    })} type="password"
                    icon="key-2-line"
                    autoComplete="new-password"
                    error={errors.password?.message}
                  />
                  <FormField
                    label="Confirm Password"
                    {...register("confirm", { required: "Please confirm your new password." })} type="password"
                    icon="lock-line"
                    autoComplete="new-password"
                    error={errors.confirm?.message}
                  />
                  <PasswordRules control={control} />
                </>
              )}
              {serverError && <p role="alert" className="text-body-sm text-error">{serverError}</p>}
            </div>
            <div className="mt-auto space-y-3 pt-8">
              <Button type="submit" arrow disabled={loading}>
                {loading ? "Please wait…" : ["Send reset code", "Verify code", "Save password & activate"][step]}
              </Button>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setServerError("");
                    clearErrors();
                    setStep((previous) => previous - 1);
                  }}
                  className="min-h-10 w-full text-center text-label-md underline"
                >
                  Previous step
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="mt-auto pt-8">
            <Link
              to="/sign-in"
              className="block rounded-lg bg-vivid-yellow p-3 text-center font-semibold"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
