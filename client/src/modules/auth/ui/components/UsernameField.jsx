import { useWatch } from "react-hook-form";
import FormField from "../../../../shared/ui/FormField";
export default function UsernameField({ control, register, error }) {
  const username = useWatch({ control, name: "username" }) || "";
  return (
    <FormField
      label="Username"
      {...register("username", {
        required: "Please choose a username.",
        pattern: {
          value: /^[a-zA-Z0-9_.]{3,24}$/,
          message: "Use 3-24 letters, numbers, dots or underscores.",
        },
      })}
      hint={username.length >= 3 ? "Looks good" : undefined}
      error={error}
      placeholder="aarav.m"
      autoComplete="username"
      title="3-24 letters, numbers, dots or underscores"
    />
  );
}
