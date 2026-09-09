import { Link } from "react-router-dom";

const PRODUCT_TABS = [
  { label: "Flipkart", icon: "f", to: "/flipkart" },
  { label: "Minutes", icon: "🛵", to: "/flipkart" },
  { label: "Travel", icon: "✈", to: "/flipkart" },
  { label: "Bites", icon: "🍱", to: "/home" },
];

export default function ProductTabs({ active = "Flipkart", className = "" }) {
  return (
    <div className={`w-full md:w-auto flex gap-2 md:gap-3 overflow-x-auto pb-1 ${className}`}>
      {PRODUCT_TABS.map((tab) => {
        const isActive = tab.label === active;
        const className = isActive
          ? tab.label === "Flipkart"
            ? "bg-saffron text-ink shadow-card"
            : "bg-bottle text-white shadow-card"
          : "bg-surface text-ink hover:bg-canvas";
        return (
          <Link
            key={tab.label}
            to={tab.to}
            className={`h-11 min-w-[78px] md:min-w-[132px] rounded-lg flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-5 text-xs md:text-sm font-extrabold transition ${className}`}
          >
            <span className={tab.label === "Flipkart" ? "text-2xl italic text-bottle" : "text-lg"}>{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
