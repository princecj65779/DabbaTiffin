import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const BITES_LINKS = [
  { to: "/home", label: "Today" },
  { to: "/menu", label: "Menu" },
  { to: "/calendar", label: "Calendar" },
  { to: "/plans", label: "Plans" },
  { to: "/orders", label: "Orders" },
];

export default function TopNav() {
  const { user } = useAuth();
  const initial = user?.full_name?.[0]?.toUpperCase() || "A";

  return (
    <header className="hidden md:block bg-white shadow-card sticky top-0 z-30">
      <div className="bg-bottle text-white">
        <div className="max-w-7xl mx-auto h-[68px] px-8 flex items-center gap-6">
          <NavLink to="/home" className="flex-none">
            <Logo />
          </NavLink>
          <div className="flex-1 max-w-3xl">
            <div className="bg-white h-11 rounded-sm flex items-center px-4 text-sm text-muted shadow-sm">
              <span className="mr-3 text-bottle font-extrabold">Search</span>
              Search Bites meals, cuisines, plans and batch points
            </div>
          </div>
          <NavLink
            to="/flipkart"
            className="text-[13px] font-extrabold text-white/90 hover:text-saffron whitespace-nowrap"
          >
            Flipkart
          </NavLink>
          <div className="text-[13px] whitespace-nowrap leading-tight">
            <span className="opacity-85">Delivering to</span>{" "}
            <strong className="block">{user?.delivery_point?.name || "Set your point"}</strong>
          </div>
          <NavLink
            to="/profile"
            className="w-9 h-9 rounded-full bg-saffron flex items-center justify-center text-[13px] font-extrabold text-ink"
          >
            {initial}
          </NavLink>
        </div>
      </div>
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto h-14 px-8 flex items-center gap-8 text-sm font-bold text-ink">
          <div className="text-xs font-extrabold tracking-wide uppercase text-mutedwarm">Flipkart Bites</div>
          <div className="flex items-center gap-8">
            {BITES_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `h-14 flex items-center border-b-[3px] ${
                    isActive
                      ? "border-saffron text-bottle"
                      : "border-transparent text-ink hover:text-bottle"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `ml-auto h-14 flex items-center border-b-[3px] ${
                isActive ? "border-saffron text-bottle" : "border-transparent text-ink hover:text-bottle"
              }`
            }
          >
            Account
          </NavLink>
        </div>
      </div>
    </header>
  );
}
