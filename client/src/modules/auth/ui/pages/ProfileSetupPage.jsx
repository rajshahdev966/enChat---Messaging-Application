import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { PageHeader } from "../../../../shared/ui/AuthLayout";
import Button from "../../../../shared/ui/Button";
import Icon from "../../../../shared/ui/Icon";
import { fetchCurrentUser, saveProfile } from "../../state/authSlice";
import ProfilePhoto from "../components/ProfilePhoto";

const MAX_PHOTO_BYTES = 500 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PRIVACY_OPTIONS = [
  {
    value: "everyone",
    title: "Everyone",
    description: "Anyone on enChat can find your profile.",
  },
  {
    value: "contacts",
    title: "Contacts",
    description: "People you connect with can find your profile.",
  },
  {
    value: "me",
    title: "Only me",
    description: "Your profile will not appear in search.",
  },
];

export default function ProfileSetupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const { user, profile, loading } = useSelector((state) => state.auth);
  const [photoFile, setPhotoFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [serverError, setServerError] = useState("");
  const preview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      bio: profile?.bio || "",
      userCaption: profile?.userCaption || "",
      profilePrivacyOption: profile?.profilePrivacyOption || "everyone",
      profilePhotoPrivacyOption:
        profile?.profilePhoto?.profilePhotoPrivacyOption || "everyone",
      interests: profile?.interests?.join(", ") || "",
    },
  });

  useEffect(() => {
    if (!profile) dispatch(fetchCurrentUser());
  }, [dispatch, profile]);

  useEffect(() => {
    if (!profile) return;
    reset({
      bio: profile.bio || "",
      userCaption: profile.userCaption || "",
      profilePrivacyOption: profile.profilePrivacyOption || "everyone",
      profilePhotoPrivacyOption:
        profile.profilePhoto?.profilePhotoPrivacyOption || "everyone",
      interests: profile.interests?.join(", ") || "",
    });
  }, [profile, reset]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Choose an image smaller than 500 KB.");
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setPhotoError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    setPhotoError("");
    setRemovePhoto(false);
    setPhotoFile(file);
  }

  async function submit(values) {
    setPhotoError("");
    setServerError("");
    try {
      const interests = [
        ...new Set(
          values.interests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ];
      if (interests.length > 20 || interests.some((item) => item.length > 40)) {
        setError("interests", {
          type: "validate",
          message: "Use up to 20 interests, each 40 characters or fewer.",
        });
        return;
      }
      await dispatch(
        saveProfile({
          ...values,
          interests,
          profilePhoto: photoFile,
          removeProfilePhoto: removePhoto,
        }),
      ).unwrap();
      navigate(location.state?.from || "/app", { replace: true });
    } catch (error) {
      for (const [field, message] of Object.entries(error.errors || {})) {
        if (field === "profilePhoto") setPhotoError(message);
        else setError(field, { type: "server", message });
      }
      if (!Object.keys(error.errors || {}).length)
        setServerError(error.message);
    }
  }

  return (
    <main className="flex min-h-svh flex-1 flex-col pb-6 lg:min-h-0">
      <PageHeader title="Profile Setup" back="/create-account" />
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded-full bg-sage-green/15 px-3 py-1 text-[10px]">
          Your profile
        </span>
        <span className="text-label-sm text-outline">
          Private by your choice
        </span>
      </div>
      <h1 className="font-heading text-headline-lg">Make this space yours.</h1>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        Choose a photo and decide who can see your profile.
      </p>

      <section className="my-6 rounded-2xl bg-white p-5 shadow-panel">
        <div className="flex items-center gap-4">
          <ProfilePhoto
            name={user?.name}
            photoPath={removePhoto ? null : profile?.profilePhoto?.filePath}
            preview={preview}
            onChoose={() => inputRef.current?.click()}
            editable
          />
          <div className="min-w-0">
            <p className="text-label-lg">Profile photo</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Optional · JPG, PNG, or WebP · Up to 500 KB
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 text-label-md underline underline-offset-4"
            >
              {preview || profile?.profilePhoto?.filePath
                ? "Choose a different photo"
                : "Add a photo"}
            </button>
            {!removePhoto && (preview || profile?.profilePhoto?.filePath) && (
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setRemovePhoto(true);
                  setPhotoError("");
                }}
                className="ml-4 mt-2 text-label-md text-error underline underline-offset-4"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={choosePhoto}
          className="sr-only"
          aria-label="Select profile photo"
        />
        {photoError && (
          <p role="alert" className="mt-3 text-body-sm text-error">
            {photoError}
          </p>
        )}
      </section>

      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="flex flex-1 flex-col"
      >
        <div className="space-y-5">
          <div className="rounded-xl bg-white p-4">
            <label htmlFor="interests" className="mb-2 block text-label-md">
              Interests{" "}
              <span className="font-normal text-outline">
                (optional, separated by commas)
              </span>
            </label>
            <input
              id="interests"
              maxLength={900}
              placeholder="Design, hiking, quiet cafés"
              {...register("interests")}
              className="min-h-11 w-full bg-transparent text-body-sm outline-none placeholder:text-outline/60"
            />
            {errors.interests && (
              <p role="alert" className="mt-1 text-label-md text-error">
                {errors.interests.message}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-white p-4">
            <label htmlFor="bio" className="mb-2 block text-label-md">
              About you
            </label>
            <textarea
              id="bio"
              maxLength={500}
              placeholder="A few words about yourself…"
              {...register("bio", {
                maxLength: {
                  value: 500,
                  message: "Bio cannot exceed 500 characters.",
                },
              })}
              className="min-h-24 w-full resize-y bg-transparent text-body-sm outline-none placeholder:text-outline/60"
            />
            {errors.bio && (
              <p role="alert" className="mt-1 text-label-md text-error">
                {errors.bio.message}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-white p-4">
            <label htmlFor="userCaption" className="mb-2 block text-label-md">
              Profile caption{" "}
              <span className="font-normal text-outline">(optional)</span>
            </label>
            <input
              id="userCaption"
              maxLength={100}
              placeholder="A short line that feels like you"
              {...register("userCaption", {
                maxLength: {
                  value: 100,
                  message: "Caption cannot exceed 100 characters.",
                },
              })}
              className="min-h-11 w-full bg-transparent text-body-sm outline-none placeholder:text-outline/60"
            />
            {errors.userCaption && (
              <p role="alert" className="mt-1 text-label-md text-error">
                {errors.userCaption.message}
              </p>
            )}
          </div>

          {!profile && (
            <fieldset>
              <legend className="mb-3 font-heading text-title-md">
                Who can find your profile?
              </legend>
              <div className="space-y-2">
                {PRIVACY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-sage-green/30 bg-white p-3.5 has-[:checked]:border-bottle-green has-[:checked]:bg-sage-green/10"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("profilePrivacyOption", {
                        required: "Choose a profile privacy setting.",
                      })}
                      className="mt-1 size-4 accent-bottle-green"
                    />
                    <span className="flex-1">
                      <span className="block text-label-lg">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                        {option.description}
                      </span>
                    </span>
                    <Icon
                      name={
                        option.value === "everyone"
                          ? "earth-line"
                          : option.value === "contacts"
                            ? "group-line"
                            : "lock-2-line"
                      }
                      className="mt-0.5 text-lg text-outline"
                    />
                  </label>
                ))}
              </div>
              {errors.profilePrivacyOption && (
                <p role="alert" className="mt-2 text-label-md text-error">
                  {errors.profilePrivacyOption.message}
                </p>
              )}
            </fieldset>
          )}

          {!profile && (
            <fieldset>
              <legend className="mb-3 font-heading text-title-md">
                Who can see your photo?
              </legend>
              <div className="space-y-2">
                {PRIVACY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-sage-green/30 bg-white p-3.5 has-[:checked]:border-bottle-green has-[:checked]:bg-sage-green/10"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("profilePhotoPrivacyOption", {
                        required: "Choose a photo privacy setting.",
                      })}
                      className="mt-1 size-4 accent-bottle-green"
                    />
                    <span className="flex-1">
                      <span className="block text-label-lg">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                        {option.description}
                      </span>
                    </span>
                    <Icon
                      name={
                        option.value === "everyone"
                          ? "earth-line"
                          : option.value === "contacts"
                            ? "group-line"
                            : "lock-2-line"
                      }
                      className="mt-0.5 text-lg text-outline"
                    />
                  </label>
                ))}
              </div>
              {errors.profilePhotoPrivacyOption && (
                <p role="alert" className="mt-2 text-label-md text-error">
                  {errors.profilePhotoPrivacyOption.message}
                </p>
              )}
            </fieldset>
          )}
        </div>
        <div className="mt-auto pt-8">
          {serverError && (
            <p role="alert" className="mb-3 text-body-sm text-error">
              {serverError}
            </p>
          )}
          <Button type="submit" arrow disabled={loading}>
            {loading ? "Saving profile…" : "Save profile"}
          </Button>
        </div>
      </form>
    </main>
  );
}
