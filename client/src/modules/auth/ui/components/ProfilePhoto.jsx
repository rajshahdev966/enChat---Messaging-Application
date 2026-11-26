import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { signedPhotoUrlRequest } from "../../api/auth.api";
import Icon from "../../../../shared/ui/Icon";

function getInitials(name) {
  const words = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return (
    words
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
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
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [signed, setSigned] = useState({ path: null, url: null });
  const [failedSrc, setFailedSrc] = useState(null);

  useEffect(() => {
    if (!photoPath || !accessToken || preview) return undefined;

    signedPhotoUrlRequest(photoPath, accessToken)
      .then((url) => setSigned({ path: photoPath, url }))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSigned({ path: photoPath, url: null });
        }
      });
  }, [accessToken, photoPath, preview]);

  const image = preview || (signed.path === photoPath ? signed.url : null);
  const visibleImage = image && failedSrc === image ? null : image;
  const content = (
    <>
      {visibleImage ? (
        <img
          src={visibleImage}
          alt={`${name || "User"} profile`}
          className="size-full object-cover"
          onError={() => setFailedSrc(visibleImage)}
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
      aria-label={visibleImage ? "Edit profile photo" : "Add profile photo"}
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
