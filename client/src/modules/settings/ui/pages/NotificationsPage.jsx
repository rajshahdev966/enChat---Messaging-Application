import { Link } from "react-router";
import Icon from "../../../../shared/ui/Icon";

const notificationPrinciples = [
  {
    title: "Quiet Delivery",
    description:
      "Messages wait quietly until your designated sanctuary hours without pinging you.",
    label: "Peace",
    icon: "moon-line",
  },
  {
    title: "Zero-Knowledge Previews",
    description:
      "A privacy-first preview concept that keeps message content and sender details off your lock screen.",
    label: "Shielded",
    icon: "lock-line",
  },
  {
    title: "Boundary Controls",
    description:
      "Set granular alert rules for individual circles, contacts, or temporary chats.",
    label: "Granular",
    icon: "equalizer-2-line",
  },
];

export default function NotificationsPage() {
  return (
    <section className="mx-auto min-h-full max-w-4xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
      <header className="mb-5 flex items-center gap-3">
        <Link
          to="/app/you"
          aria-label="Back"
          className="grid size-9 place-items-center rounded-full hover:bg-surface-container"
        >
          <Icon name="arrow-left-s-line" className="text-xl" />
        </Link>
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-outline">
            EXPERIENCE & APP
          </p>
          <h1 className="font-heading text-headline-sm">NOTIFICATION</h1>
        </div>
      </header>
      <header className="mx-auto max-w-2xl text-center">
        <div
          aria-hidden="true"
          className="relative mx-auto mb-6 grid size-40 place-items-center sm:mb-7 sm:size-44"
        >
          <span className="absolute inset-0 rounded-full border border-secondary/15" />
          <span className="absolute inset-4 rounded-full border border-secondary/25" />
          <span className="relative grid size-24 place-items-center rounded-full border border-border-subtle bg-surface-container-lowest text-primary shadow-panel sm:size-28">
            <Icon name="notification-off-line" className="text-3xl sm:text-4xl" />
            <span className="absolute bottom-3 right-3 size-2.5 rounded-full bg-vivid-yellow sm:bottom-4 sm:right-4" />
          </span>
        </div>

        <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-surface-container px-4 py-1.5 text-label-sm font-semibold tracking-[.12em] text-on-surface-variant">
          <Icon name="arrow-left-right-line" /> IN CRAFT · PRIVACY FIRST
        </p>
        <h1 className="mx-auto mt-4 max-w-xl font-heading text-headline-lg sm:text-display-lg">
          Thoughtful notifications are on the way.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-body-sm leading-relaxed text-on-surface-variant sm:text-body-lg">
          We’re designing notifications around quiet hours, private previews,
          and per-contact controls, so alerts can respect your peace.
        </p>
      </header>

      <div className="mt-7 grid gap-3 sm:mt-8 md:grid-cols-3 md:gap-4">
        {notificationPrinciples.map((item) => (
          <article
            key={item.title}
            className="flex min-h-28 items-start gap-3 rounded-2xl border border-border-subtle bg-surface-container-lowest p-4 shadow-panel sm:p-5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-container text-on-surface">
              <Icon name={item.icon} className="text-lg" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
                <h2 className="font-heading text-title-md">{item.title}</h2>
                <span className="rounded-full bg-surface-container px-2.5 py-1 text-label-sm text-on-surface-variant">
                  {item.label}
                </span>
              </div>
              <p className="mt-1 text-body-sm leading-relaxed text-on-surface-variant">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
