import { Link } from "react-router-dom";
import ProductTabs from "../components/ProductTabs";

const categories = [
  { label: "For You", icon: "bag" },
  { label: "Fashion", icon: "shirt" },
  { label: "Mobiles", icon: "phone" },
  { label: "Electronics", icon: "laptop" },
  { label: "Beauty", icon: "lipstick" },
  { label: "Home", icon: "lamp" },
  { label: "Appliances", icon: "screen" },
  { label: "Toys", icon: "bear" },
  { label: "Food & Health", icon: "jar" },
  { label: "Auto Acc.", icon: "helmet" },
  { label: "Sports", icon: "bat" },
];

const promoCards = [
  {
    brand: "MIVI",
    title: "Mivi One 5G",
    offer: "Launch 24th Sep",
    subtext: "Pure Android 16",
    tone: "bg-[#EAF7D9]",
    image: "/flipkart/phone-launch.jpg",
  },
  {
    brand: "POCO",
    title: "POCO X8 Series 5G",
    offer: "From ₹2,250/M",
    subtext: "Sale on 11th Sep, 12 PM",
    tone: "bg-[#513B25]",
    image: "/flipkart/electronics-sale.jpg",
    dark: true,
  },
  {
    brand: "TotalEnergies",
    title: "Power in every drop",
    offer: "Explore now",
    subtext: "Royal care for royal engines",
    tone: "bg-[#172337]",
    image: "/flipkart/travel-deals.jpg",
    dark: true,
  },
];

const suggestedCards = [
  { title: "Running shoes", price: "₹919", deal: "₹781 with bank offer", image: "/flipkart/running-shoes.jpg" },
  { title: "Smart watches", price: "₹1,299", deal: "Hot deal", image: "/flipkart/smart-watch.jpg" },
  { title: "Backpacks", price: "₹699", deal: "Student picks", image: "/flipkart/backpack.jpg" },
  { title: "Wireless earbuds", price: "₹799", deal: "New drops", image: "/flipkart/earbuds.jpg" },
];

export default function FlipkartLanding() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <div className="max-w-[1440px] mx-auto px-5 py-4 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <ProductTabs active="Flipkart" />
            <div className="ml-auto flex items-center gap-4 text-sm">
              <span className="font-bold text-ink">Location not set</span>
              <button className="font-extrabold text-bottle">Select delivery location</button>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex-1 h-12 rounded-lg border-2 border-bottle flex items-center px-5 text-mutedwarm text-base">
              <span className="mr-3 text-2xl text-muted">⌕</span>
              Search for Products, Brands, Meals and More
            </div>
            <button className="hidden md:flex items-center gap-2 font-bold text-ink">
              <span className="text-xl">◎</span> Login
            </button>
            <button className="hidden md:flex items-center gap-2 font-bold text-ink">
              <span className="text-xl">🛒</span> Cart
            </button>
          </div>

          <div className="border-y border-line overflow-x-auto">
            <div className="min-w-max flex items-center gap-8 px-2 h-[82px]">
              {categories.map((category) => {
                const content = (
                  <div
                    className="relative h-full min-w-[92px] flex flex-col items-center justify-center gap-1.5 text-sm font-bold text-ink transition hover:text-bottle"
                  >
                    <CategoryIcon type={category.icon} active={category.label === "For You"} />
                    <span>{category.label}</span>
                    {category.label === "For You" && <span className="absolute bottom-0 h-1 w-full rounded-t bg-bottle" />}
                  </div>
                );
                return category.to ? (
                  <Link key={category.label} to={category.to}>
                    {content}
                  </Link>
                ) : (
                  <button key={category.label}>{content}</button>
                );
              })}
            </div>
          </div>
        </div>

        <section className="mt-5 grid lg:grid-cols-[1.25fr_1.25fr_.72fr] gap-5">
          {promoCards.map((card, index) => (
            <button
              key={card.title}
              className={`relative min-h-[220px] md:min-h-[250px] overflow-hidden rounded-lg ${card.tone} text-left smooth-card`}
            >
              <img
                src={card.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className={`absolute inset-0 ${card.dark ? "bg-gradient-to-r from-black/72 via-black/42 to-transparent" : "bg-gradient-to-r from-white/92 via-white/58 to-transparent"}`} />
              <div className="relative z-10 max-w-[62%] p-6">
                <div className={`inline-flex rounded px-3 py-1 text-[11px] font-extrabold ${card.dark ? "bg-saffron text-ink" : "bg-white text-bottle"}`}>
                  {card.brand}
                </div>
                <div className={`mt-5 text-2xl md:text-3xl font-black leading-tight ${card.dark ? "text-white" : "text-ink"}`}>
                  {card.title}
                </div>
                <div className={`mt-2 text-base font-extrabold ${card.dark ? "text-white/90" : "text-ink/80"}`}>{card.offer}</div>
                <div className={`mt-2 text-sm font-semibold ${card.dark ? "text-white/80" : "text-mutedwarm"}`}>{card.subtext}</div>
              </div>
              {index === 0 && (
                <div className="absolute bottom-4 left-6 text-[11px] font-bold text-ink/55">AD</div>
              )}
            </button>
          ))}
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-ink">Suggested for you</h2>
            <button className="h-9 w-12 rounded-full bg-bottle text-white flex items-center justify-center text-2xl font-black">
              →
            </button>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedCards.map((card) => (
              <button key={card.title} className="rounded-lg bg-white border border-line overflow-hidden text-left smooth-card">
                <img src={card.image} alt="" className="h-48 w-full object-cover bg-surface" />
                <div className="p-4">
                  <div className="text-sm font-extrabold text-ink truncate">{card.title}</div>
                  <div className="mt-1 text-xs text-mutedwarm">{card.deal}</div>
                  <div className="mt-2 font-black text-ink">{card.price}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function CategoryIcon({ type, active }) {
  return (
    <span className={`h-12 w-12 rounded-lg flex items-center justify-center ${active ? "bg-[#EAF4FF]" : "bg-transparent"}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="#333333" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <CategoryIconPaths type={type} />
      </svg>
    </span>
  );
}

function CategoryIconPaths({ type }) {
  const yellow = "#F7D417";
  if (type === "shirt") {
    return (
      <>
        <path d="M16 13l5 3h6l5-3 6 5-4 6-3-2v15H17V22l-3 2-4-6 6-5z" />
        <path d="M17 34h14" stroke={yellow} strokeWidth="4" />
      </>
    );
  }
  if (type === "phone") {
    return (
      <>
        <rect x="17" y="8" width="14" height="32" rx="4" />
        <path d="M21 35h6" stroke={yellow} strokeWidth="4" />
      </>
    );
  }
  if (type === "laptop") {
    return (
      <>
        <rect x="12" y="13" width="24" height="17" rx="2" />
        <path d="M8 36h32" />
        <path d="M18 32h12" stroke={yellow} strokeWidth="4" />
      </>
    );
  }
  if (type === "lipstick") {
    return (
      <>
        <path d="M22 18l5-5 3 3-5 5" />
        <rect x="17" y="20" width="13" height="20" rx="2" />
        <path d="M18 32h11" stroke={yellow} strokeWidth="4" />
      </>
    );
  }
  if (type === "lamp") {
    return (
      <>
        <path d="M17 11h14l4 14H13l4-14z" />
        <path d="M24 25v12M17 37h14" />
        <path d="M20 14h8" stroke={yellow} strokeWidth="4" />
      </>
    );
  }
  if (type === "screen") {
    return (
      <>
        <rect x="9" y="14" width="30" height="20" rx="1" />
        <path d="M20 39h8M24 34v5" />
        <path d="M12 31h24" stroke={yellow} strokeWidth="4" />
      </>
    );
  }
  if (type === "bear") {
    return (
      <>
        <circle cx="17" cy="15" r="4" />
        <circle cx="31" cy="15" r="4" />
        <circle cx="24" cy="25" r="13" />
        <path d="M20 25h.1M28 25h.1M21 31c2 2 4 2 6 0" />
        <path d="M18 19c4-3 8-3 12 0" stroke={yellow} strokeWidth="4" />
      </>
    );
  }
  if (type === "jar") {
    return (
      <>
        <path d="M19 9h10v6H19z" />
        <rect x="15" y="15" width="18" height="25" rx="5" />
        <path d="M17 30h14" stroke={yellow} strokeWidth="5" />
      </>
    );
  }
  if (type === "helmet") {
    return (
      <>
        <path d="M9 29c1-10 7-16 16-16 8 0 13 5 14 13l-7 6H18l-9-3z" />
        <path d="M31 18v11" />
        <path d="M32 31l-9-5" stroke={yellow} strokeWidth="4" />
      </>
    );
  }
  if (type === "bat") {
    return (
      <>
        <path d="M30 9l5 5-17 17-5-5L30 9z" />
        <path d="M13 31l-4 4" />
        <circle cx="13" cy="34" r="4" fill={yellow} stroke="#333333" />
      </>
    );
  }
  return (
    <>
      <path d="M15 18h18l-2 22H17L15 18z" />
      <path d="M18 18c0-7 12-7 12 0" />
      <path d="M19 21c2 5 8 5 10 0" stroke={yellow} strokeWidth="4" />
    </>
  );
}
