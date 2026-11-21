import { Link, Outlet } from "react-router";
import Icon from "./Icon";
import logo from "../../assets/enChat_logo.png";
export default function AuthLayout() {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-bottle-green p-14 text-neo-pearl lg:flex">
        <Link
          to="/"
          aria-label="enChat home"
          className="w-fit rounded-xl bg-neo-pearl p-3"
        >
          <img src={logo} alt="enChat" className="h-10 w-auto" />
        </Link>
        <div className="relative z-10 max-w-md">
          <span className="text-label-md uppercase tracking-[.2em] text-vivid-yellow">
            Just between us
          </span>
          <h2 className="mt-5 font-heading text-5xl leading-tight tracking-tight">
            A little closer.
            <br />A little quieter.
            <br />A space for you.
          </h2>
          <p className="mt-6 max-w-xs text-body-lg text-neo-pearl/70">
            Meaningful conversations begin with a place that feels like your
            own.
          </p>
        </div>
        <div className="absolute -right-48 top-1/3 size-[32rem] rounded-full border border-sage-green/20" />
        <div className="absolute -right-36 top-[38%] size-96 rounded-full border border-sage-green/20" />
        <p className="text-label-md text-sage-green">
          Personal by design. Quiet by nature.
        </p>
      </aside>
      <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 lg:py-8">
        <Outlet />
      </div>
    </div>
  );
}


export function PageHeader({ title, back = "/" }) {
  return (
    <header className="mb-4 flex h-16 shrink-0 items-center justify-between sm:mb-6">
      <Link
        to={back}
        aria-label="Go back"
        className="flex size-10 items-center justify-center rounded-full hover:bg-surface-container"
      >
        <Icon name="arrow-left-s-line" className="text-2xl" />
      </Link>
      <span className="font-heading text-label-lg">{title}</span>
      <span className="flex size-8 items-center justify-center rounded-full bg-transparent text-white">
      </span>
    </header>
  );
}



export function PrivacyNote({
  children = "Private sanctuary - Just between us",
}) {
  return (
    <p className="mx-auto mb-5 flex w-fit items-center gap-1.5 rounded-full bg-sage-green/15 px-3 py-1 text-[10px] tracking-wide">
      <Icon name="shield-check-line" />
      {children}
    </p>
  );
}
