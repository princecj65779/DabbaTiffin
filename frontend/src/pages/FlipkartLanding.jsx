import { Link } from "react-router-dom";

const topTabs = [
  { label: "Flipkart", icon: "f", active: true, to: "/flipkart" },
  { label: "Minutes", icon: "🛵", active: false, to: "/flipkart" },
  { label: "Travel", icon: "✈", active: false, to: "/flipkart" },
  { label: "Bites", icon: "🍱", active: false, to: "/home", highlight: true },
];

const categories = [
  { label: "For You", icon: "🛍" },
  { label: "Grocery", icon: "🛒" },
  { label: "Mobiles", icon: "📱" },
  { label: "Electronics", icon: "💻" },
  { label: "Beauty", icon: "🧴" },
  { label: "Home", icon: "🏠" },
  { label: "Travel", icon: "✈" },
];

const promoCards = [
  {
    title: "Phone launches",
    offer: "Sale tomorrow, 12 PM",
    color: "from-[#123B5D] to-[#2874F0]",
    visual: "📱",
  },
  {
    title: "Top electronics",
    offer: "Up to 70% off",
    color: "from-[#DFF5D7] to-[#91D67E]",
    visual: "🎧",
  },
  {
    title: "Travel deals",
    offer: "Flights from ₹1,499",
    color: "from-[#FFE7CC] to-[#FF9D55]",
    visual: "✈",
  },
];

const suggestedCards = [
  { title: "Running shoes", price: "₹919", visual: "👟", deal: "Bank offer" },
  { title: "Smart watches", price: "₹1,299", visual: "⌚", deal: "Hot deal" },
  { title: "Backpacks", price: "₹699", visual: "🎒", deal: "Student picks" },
  { title: "Wireless earbuds", price: "₹799", visual: "🎧", deal: "New drops" },
];

export default function FlipkartLanding() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <div className="max-w-[1440px] mx-auto px-5 py-4 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-full md:w-auto flex gap-2 md:gap-3 overflow-x-auto pb-1">
              {topTabs.map((tab) => {
                const className = tab.active
                  ? "bg-saffron text-ink shadow-card"
                  : tab.highlight
                  ? "bg-bottle text-white shadow-card hover:bg-bottle-dark"
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
                    className="relative h-full min-w-[76px] flex flex-col items-center justify-center gap-1 text-sm font-bold text-ink transition hover:text-bottle"
                  >
                    <span className="text-2xl">{category.icon}</span>
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

        <section className="mt-5 grid lg:grid-cols-[1.3fr_1.3fr_.72fr] gap-5">
          {promoCards.map((card, index) => (
            <button
              key={card.title}
              className={`relative min-h-[220px] md:min-h-[270px] overflow-hidden rounded-lg bg-gradient-to-br ${card.color} p-6 text-left smooth-card`}
            >
              <div className="relative z-10 max-w-[70%]">
                <div className="inline-flex rounded bg-white/90 px-3 py-1 text-xs font-extrabold text-bottle">
                  Sponsored
                </div>
                <div className="mt-5 text-2xl md:text-3xl font-black text-ink">{card.title}</div>
                <div className="mt-2 text-base font-extrabold text-ink/80">{card.offer}</div>
              </div>
              <div className="absolute bottom-4 right-5 text-[96px] md:text-[124px] leading-none opacity-90">
                {card.visual}
              </div>
              {index === 0 && (
                <div className="absolute bottom-4 left-6 text-[11px] font-bold text-white/90">AD</div>
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
                <div className="h-48 w-full bg-surface flex items-center justify-center text-[92px]">
                  {card.visual}
                </div>
                <div className="p-4">
                  <div className="text-sm font-extrabold text-ink">{card.title}</div>
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
