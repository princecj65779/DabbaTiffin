import { NavLink, useLocation } from "react-router-dom";

const TABS = [
  { to: "/home", label: "Today" },
  { to: "/menu", label: "Menu" },
  { to: "/calendar", label: "Calendar" },
  { to: "/orders", label: "Orders" },
  { to: "/profile", label: "Account" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const menuPaths = ["/menu", "/booking", "/confirmation", "/payment-success"];
  const calendarPaths = ["/calendar", "/skip"];
  const isMenuPath = menuPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isCalendarPath = calendarPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-canvas flex items-center z-20 shadow-[0_-2px_10px_rgba(23,35,55,.08)]">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex-1 h-full flex items-center justify-center text-[11px] font-extrabold ${
              isActive || (tab.to === "/menu" && isMenuPath) || (tab.to === "/calendar" && isCalendarPath)
                ? "text-bottle"
                : "text-muted/45"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
