import Icon from "../../../../shared/ui/Icon";

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "?"
  );
}

export default function ProfilePhoto({
  name,
  photoPath,
  preview,
  onChoose,
  size = "size-20",
  editable = false,
}) {
  const image = preview || photoPath || null;
  const content = (
    <>
      {image ? (
        <img
          src={image}
          alt={`${name || "User"} profile`}
          className="size-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
      {editable && (
        <span className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-bottle-green text-vivid-yellow">
          <Icon name="camera-line" className="text-sm" />
        </span>
      )}
    </>
  );

  return editable ? (
    <button
      type="button"
      onClick={onChoose}
      aria-label={image ? "Edit profile photo" : "Add profile photo"}
      className={`relative flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-sage-green/30 font-heading text-xl text-bottle-green ring-4 ring-neo-pearl`}
    >
      {content}
    </button>
  ) : (
    <div
      className={`relative flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-sage-green/30 font-heading text-xl text-bottle-green`}
    >
      {content}
    </div>
  );
}
