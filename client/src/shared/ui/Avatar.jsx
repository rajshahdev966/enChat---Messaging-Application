import { useState } from "react";

export default function Avatar({
  name,
  src,
  size = "size-12",
  online = false,
  className = "",
}) {
  const [failed, setFailed] = useState(false);
  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={`relative inline-flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-sage-green/30 font-heading text-label-lg text-bottle-green ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials || "?"
      )}
      {online && (
        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-neo-pearl bg-vivid-yellow" />
      )}
    </span>
  );
}
