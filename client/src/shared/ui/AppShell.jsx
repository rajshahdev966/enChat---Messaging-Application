import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import Icon from "./Icon";
import Avatar from "./Avatar";

const navigation = [
  { to: "/app", label: "Chats", icon: "chat-3-line", end: true },
  { to: "/app/people", label: "People", icon: "group-line" },
  { to: "/app/you", label: "You", icon: "user-3-line" },
];

function NavItems({ vertical = false }) {
  const unread = useSelector((state) => state.conversations?.unreadTotal || 0);
  return navigation.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `relative flex ${vertical ? "size-12" : "min-w-20 flex-1 flex-col"} items-center justify-center gap-1 rounded-xl text-outline transition-colors ${isActive ? "bg-secondary-container text-bottle-green" : "hover:bg-surface-container"}`
      }
    >
      <Icon name={item.icon} className="text-xl" />
      {!vertical && (
        <span className="text-[10px] font-medium">{item.label}</span>
      )}
      {!vertical && item.label === "Chats" && unread > 0 && (
        <span className="absolute right-1/4 top-0 grid size-4 place-items-center rounded-full bg-vivid-yellow text-[9px] font-bold text-bottle-green">
          {unread}
        </span>
      )}
      {vertical && <span className="sr-only">{item.label}</span>}
    </NavLink>
  ));
}

export default function AppShell() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const isChat = location.pathname.includes("/conversations/");
  return (
    <div className="min-h-svh bg-neo-pearl text-bottle-green lg:grid lg:grid-cols-[76px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col items-center justify-between bg-bottle-green py-5 text-neo-pearl lg:flex">
        <nav className="flex flex-col gap-3">
          <NavItems vertical />
        </nav>
        <Link to="/app/you" aria-label="Your account">
          <Avatar name={user?.name} size="size-9" src={user?.avatarUrl} />
        </Link>
      </aside>
      <div className="flex min-h-svh min-w-0 flex-col lg:col-start-2 lg:h-svh lg:overflow-hidden">
        <main
          className={`min-w-0 flex-1 overflow-y-auto ${isChat ? "pb-0" : "pb-20 lg:pb-0"}`}
        >
          <Outlet />
        </main>
          <nav
            aria-label="Main navigation"
            className="fixed inset-x-0 bottom-0 z-30 flex h-[68px] items-center border-t border-sage-green/30 bg-neo-pearl/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
          >
            <NavItems />
          </nav>
      </div>
    </div>
  );
}
