import { Link } from "react-router";
import Icon from "./Icon";
export default function Button({
  children,
  to,
  variant = "primary",
  arrow = false,
  className = "",
  type = "button",
  ...props
}) {
  const styles = `inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg px-5 text-label-lg transition hover:brightness-95 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bottle-green disabled:cursor-not-allowed disabled:opacity-50 ${variant === "primary" ? "bg-vivid-yellow text-bottle-green shadow-panel" : "bg-surface-container-low text-bottle-green"} ${className}`;
  const content = (
    <>
      {children}
      {arrow && <Icon name="arrow-right-line" className="text-lg" />}
    </>
  );
  return to ? (
    <Link to={to} className={styles} {...props}>
      {content}
    </Link>
  ) : (
    <button type={type} className={styles} {...props}>
      {content}
    </button>
  );
}
