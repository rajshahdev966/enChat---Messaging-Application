import Button from "./Button";
import Icon from "./Icon";
import { PrivacyNote } from "./AuthLayout";
function ConversationArt() {
  return (
    <svg
      viewBox="0 0 320 230"
      role="img"
      aria-label="Two friends sharing a private conversation"
      className="mx-auto h-64 w-full max-w-sm text-bottle-green"
    >
      <circle
        cx="160"
        cy="112"
        r="98"
        fill="none"
        stroke="#a5c1a0"
        strokeDasharray="2 5"
        opacity=".4"
      />
      <circle cx="160" cy="112" r="72" fill="#e0f56b" opacity=".12" />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <g className="friend-sway">
          <circle cx="108" cy="77" r="16" />
          <path d="M105 94 Q85 128 98 178 M98 111 Q122 123 145 120 M94 65 Q110 52 123 70" />
        </g>
        <g className="friend-sway friend-delay">
          <circle cx="212" cy="77" r="16" />
          <path d="M215 94 Q235 128 222 178 M222 111 Q198 123 175 120 M197 70 Q213 51 226 66" />
        </g>
        <path d="M78 183 H242 M118 183 Q160 160 202 183" stroke="#a5c1a0" />
        <path
          d="M60 79 Q100 42 142 83 M178 83 Q220 42 260 79"
          strokeDasharray="3 4"
        />
      </g>
      <g className="phone-float">
        <rect
          x="147"
          y="98"
          width="26"
          height="45"
          rx="5"
          fill="#f8f6ed"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M155 104 H165" stroke="currentColor" />
        <circle cx="160" cy="132" r="2" fill="currentColor" />
        <path
          d="M160 84 C143 75 155 65 160 73 C165 65 177 75 160 84"
          fill="#e0f56b"
          stroke="currentColor"
        />
      </g>
      <circle cx="59" cy="79" r="7" fill="#f8f6ed" stroke="#a5c1a0" />
      <circle cx="59" cy="79" r="3" fill="currentColor" />
      <circle cx="261" cy="79" r="7" fill="#f8f6ed" stroke="#a5c1a0" />
      <circle cx="261" cy="79" r="3" fill="currentColor" />
    </svg>
  );
}
export default function WelcomePage() {
  return (
    <main className="flex min-h-svh flex-1 flex-col py-5 sm:py-10 lg:min-h-0">
      <PrivacyNote />
      <div className="bg-[radial-gradient(ellipse_at_center,rgba(224,245,107,.16),transparent_70%)]">
        <ConversationArt />
      </div>
      <div className="text-center">
        <span className="rounded-full bg-vivid-yellow/30 px-3 py-1 text-[10px] tracking-widest">
          JUST BETWEEN US
        </span>
        <h1 className="mt-5 font-heading text-display-lg-mobile sm:text-display-lg">
          Closer to the people who matter.
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-body-md text-on-surface-variant">
          A personal space for everyday conversations and meaningful
          connections.
        </p>
      </div>
      <div className="my-7 grid grid-cols-2 gap-3">
        {[
          ["timer-line", "Discreet", "Your space, your pace"],
          ["leaf-line", "Unrushed", "Room to reconnect"],
        ].map(([icon, title, text]) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3"
          >
            <Icon
              name={icon}
              className="rounded-lg bg-surface-container p-2 text-lg"
            />
            <div>
              <p className="text-label-md">{title}</p>
              <p className="text-[10px] text-outline">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-6">
        <div className="space-y-3">
          <Button to="/create-account" arrow>
            Create an account
          </Button>
          <Button to="/sign-in" variant="secondary">
            Sign in
          </Button>
        </div>
        <p className="mt-5 text-center text-[10px] text-outline">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline">Terms</a>{" "}
          and{" "}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
