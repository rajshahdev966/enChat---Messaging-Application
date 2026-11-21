import { useWatch } from "react-hook-form";
import Icon from "../../../../shared/ui/Icon";
import { passwordRules } from "../../api/mockAuth";
export default function PasswordRules({ control }) {
  const password = useWatch({ control, name: "password", defaultValue: "" });
  return (
    <div className="space-y-2 rounded-xl bg-surface-container-low p-4">
      <p className="text-[10px] uppercase tracking-wider text-outline">
        Vault integrity check
      </p>
      {passwordRules.map((rule) => (
        <p key={rule.label} className="flex items-center gap-2 text-label-md">
          <Icon
            name={
              rule.test(password)
                ? "checkbox-circle-fill"
                : "checkbox-blank-circle-line"
            }
            className={rule.test(password) ? "text-secondary" : "text-outline"}
          />
          {rule.label}
        </p>
      ))}
    </div>
  );
}
