import { memo, useId, useState } from "react";
import Icon from "./Icon";
const FormField = memo(function FormField({
  ref,
  label,
  name,
  value,
  onChange,
  type = "text",
  hint,
  error,
  icon,
  className = "",
  ...props
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-label-md">
        <label htmlFor={id}>{label}</label>
        {hint && <span className="text-[11px] text-outline">{hint}</span>}
      </div>
      <div
        className={`flex items-center gap-2 rounded-xl bg-surface-container-low px-3.5 ring-1 ring-transparent focus-within:ring-bottle-green border-2 border-surface-container-high ${error ? "ring-error" : ""}`}
      >
        {icon && <Icon name={icon} className="text-lg" />}
        <input
          ref={ref}
          id={id}
          name={name}
          type={type === "password" && visible ? "text" : type}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-h-12 w-full min-w-0 bg-transparent text-body-sm outline-none placeholder:text-outline/60"
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-2"
          >
            <Icon name={visible ? "eye-off-line" : "eye-line"} />
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-label-md text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});
export default FormField;
