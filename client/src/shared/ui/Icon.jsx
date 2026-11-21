export default function Icon({ name, className = "" }) {
  return <i aria-hidden="true" className={`ri-${name} ${className}`} />;
}
