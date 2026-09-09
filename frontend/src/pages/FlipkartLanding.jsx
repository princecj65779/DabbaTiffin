import { Link } from "react-router-dom";
import ProductTabs from "../components/ProductTabs";

const categories = [
  { label: "For You", icon: "bag" },
  { label: "Fashion", icon: "tee" },
  { label: "Mobiles", icon: "phone" },
  { label: "Electronics", icon: "laptop" },
  { label: "Beauty", icon: "bottle" },
  { label: "Home", icon: "lamp" },
  { label: "Appliances", icon: "screen" },
  { label: "Travel", icon: "plane" },
];

const promoCards = [
  {
    brand: "MIVI",
    title: "Mivi One 5G",
    offer: "Launch 24th Sep",
    subtext: "Pure Android 16",
    tone: "bg-[#EAF7D9]",
    accent: "bg-[#BDEB85]",
    product: "phone",
  },
  {
    brand: "POCO",
    title: "POCO X8 Series 5G",
    offer: "From ₹2,250/M",
    subtext: "Sale on 11th Sep, 12 PM",
    tone: "bg-[#513B25]",
    accent: "bg-[#F7D417]",
    product: "phones",
    dark: true,
  },
  {
    brand: "TotalEnergies",
    title: "Power in every drop",
    offer: "Explore now",
    subtext: "Royal care for royal engines",
    tone: "bg-[#172337]",
    accent: "bg-[#2874F0]",
    product: "fuel",
    dark: true,
  },
];

const suggestedCards = [
  { title: "Running shoes", price: "₹919", deal: "₹781 with bank offer", product: "shoe", bg: "bg-[#F2F5F8]" },
  { title: "Smart watches", price: "₹1,299", deal: "Hot deal", product: "watch", bg: "bg-[#EEF7F2]" },
  { title: "Backpacks", price: "₹699", deal: "Student picks", product: "bag", bg: "bg-[#F5F0EA]" },
  { title: "Wireless earbuds", price: "₹799", deal: "New drops", product: "earbuds", bg: "bg-[#EEF3FF]" },
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
                    className="relative h-full min-w-[76px] flex flex-col items-center justify-center gap-1 text-sm font-bold text-ink transition hover:text-bottle"
                  >
                    <CategoryIcon type={category.icon} />
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
              className={`relative min-h-[220px] md:min-h-[250px] overflow-hidden rounded-lg ${card.tone} p-6 text-left smooth-card`}
            >
              <div className="relative z-10 max-w-[62%]">
                <div className={`inline-flex rounded px-3 py-1 text-[11px] font-extrabold ${card.dark ? "bg-saffron text-ink" : "bg-white text-bottle"}`}>
                  {card.brand}
                </div>
                <div className={`mt-5 text-2xl md:text-3xl font-black leading-tight ${card.dark ? "text-white" : "text-ink"}`}>
                  {card.title}
                </div>
                <div className={`mt-2 text-base font-extrabold ${card.dark ? "text-white/90" : "text-ink/80"}`}>{card.offer}</div>
                <div className={`mt-2 text-sm font-semibold ${card.dark ? "text-white/80" : "text-mutedwarm"}`}>{card.subtext}</div>
              </div>
              <div className="absolute bottom-0 right-0 h-full w-[42%] flex items-center justify-center">
                <ProductVisual type={card.product} accent={card.accent} dark={card.dark} />
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
                <div className={`h-48 w-full ${card.bg} flex items-center justify-center`}>
                  <ProductVisual type={card.product} compact />
                </div>
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

function CategoryIcon({ type }) {
  const base = "mx-auto h-8 w-8 rounded-md border-2 border-muted/75 bg-white";
  if (type === "phone") return <div className={`${base} w-5 rounded`} />;
  if (type === "laptop") return <div className="mx-auto mt-1 h-7 w-10 rounded-sm border-2 border-muted/75 border-b-4" />;
  if (type === "tee") return <div className="mx-auto mt-1 h-8 w-8 rounded-t-lg border-2 border-muted/75" />;
  if (type === "bottle") return <div className={`${base} w-4 rounded-full`} />;
  if (type === "lamp") return <div className="mx-auto mt-1 h-8 w-8 border-b-2 border-muted/75 before:block before:h-5 before:w-7 before:border-2 before:border-muted/75 before:rounded-t-full" />;
  if (type === "screen") return <div className="mx-auto mt-1 h-7 w-10 rounded-sm border-2 border-muted/75" />;
  if (type === "plane") return <div className="text-2xl leading-none">✈</div>;
  return <div className={`${base} before:block before:mx-auto before:mt-1 before:h-2 before:w-4 before:rounded-b-full before:border-2 before:border-muted/75`} />;
}

function ProductVisual({ type, accent = "bg-saffron", dark = false, compact = false }) {
  if (type === "phones" || type === "phone") {
    return (
      <div className={`relative ${compact ? "h-28 w-28" : "h-40 w-36"}`}>
        <div className={`absolute right-3 top-3 h-28 w-16 rounded-xl ${accent} shadow-phone`} />
        <div className="absolute left-3 bottom-2 h-32 w-20 rounded-xl bg-white shadow-phone border border-line">
          <div className="mx-auto mt-3 h-4 w-4 rounded-full bg-ink/80" />
          <div className="mx-auto mt-2 h-16 w-12 rounded bg-surface" />
        </div>
      </div>
    );
  }
  if (type === "shoe") return <div className="h-20 w-36 rounded-[42px_18px_22px_18px] bg-white border border-line shadow-card rotate-[-8deg]" />;
  if (type === "watch") return <div className="h-28 w-16 rounded-2xl bg-ink shadow-card before:block before:h-7 before:w-10 before:mx-auto before:-mt-6 before:bg-muted after:block after:h-7 after:w-10 after:mx-auto after:mt-24 after:bg-muted" />;
  if (type === "bag") return <div className="h-28 w-24 rounded-lg bg-saffron shadow-card border border-[#DDBB00] before:block before:h-6 before:w-12 before:mx-auto before:-mt-4 before:rounded-t-full before:border-4 before:border-saffron" />;
  if (type === "earbuds") return <div className="h-20 w-28 rounded-3xl bg-white shadow-card border border-line before:block before:h-8 before:w-8 before:rounded-full before:bg-bottle before:translate-x-5 before:translate-y-6 after:block after:h-8 after:w-8 after:rounded-full after:bg-bottle after:translate-x-16 after:-translate-y-2" />;
  if (type === "fuel") return <div className={`h-28 w-28 rounded-full ${accent} shadow-phone flex items-center justify-center text-4xl font-black ${dark ? "text-white" : "text-ink"}`}>E</div>;
  return <div className="h-24 w-24 rounded-lg bg-white shadow-card" />;
}
