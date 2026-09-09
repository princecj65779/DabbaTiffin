import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import ProductTabs from "./ProductTabs";
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
      <div className="bg-white">
        <div className="max-w-7xl mx-auto min-h-[76px] px-8 py-3 flex items-center gap-6">
          <ProductTabs active="Bites" className="flex-none" />
          <div className="ml-auto text-[13px] whitespace-nowrap leading-tight text-ink">
            <span className="text-mutedwarm">Delivering to</span>{" "}
            <strong className="block text-bottle">{user?.delivery_point?.name || "Set your point"}</strong>
          </div>
          <NavLink
            to="/profile"
            className="w-10 h-10 rounded-full bg-saffron flex items-center justify-center text-[13px] font-extrabold text-ink"
          >
            {initial}
          </NavLink>
        </div>
      </div>
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto h-16 px-8 flex items-center gap-6 text-sm font-bold text-ink">
          <NavLink to="/home" className="flex-none w-[154px] flex items-center">
            <Logo size="nav" onDark={false} />
          </NavLink>
          <div className="flex-1 max-w-2xl">
            <div className="bg-white h-11 rounded-lg border-2 border-bottle flex items-center gap-3 px-4 text-sm shadow-sm overflow-hidden">
              <span className="flex-none text-bottle font-extrabold">Search</span>
              <span className="min-w-0 flex-1 truncate text-muted">
                Search Bites meals, cuisines, plans and batch points
              </span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            {BITES_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `h-16 flex items-center border-b-[3px] ${
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
              `h-16 flex items-center border-b-[3px] ${
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
