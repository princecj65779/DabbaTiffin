import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import AppShell from "../components/AppShell";
import { Card, Notice, PrimaryButton } from "../components/ui";
import { money, formatDateFull } from "../lib/format";
import { istDateFromOffset, IST_TIME_ZONE } from "../lib/time";
import { DishThumb } from "./Home";

const CUISINE_FILTERS = ["All", "Jain", "Gujarati", "Punjabi", "South Indian", "Maharashtrian", "Healthy"];

const DISH_META = {
  "Poha with sev": { cuisine: "Maharashtrian", spice: "Mild", tags: ["Popular", "Light"] },
  "Jain poha": { cuisine: "Jain", spice: "Mild", tags: ["No onion/garlic", "Light"] },
  Upma: { cuisine: "South Indian", spice: "Mild", tags: ["Light"] },
  "Idli with sambhar": { cuisine: "South Indian", spice: "Mild", tags: ["Popular"] },
  "Masala dosa tiffin": { cuisine: "South Indian", spice: "Medium", tags: ["Popular"] },
  "Thepla with curd": { cuisine: "Gujarati", spice: "Mild", tags: ["Travel friendly"] },
  "Paneer paratha": { cuisine: "Punjabi", spice: "Medium", tags: ["High protein"] },
  "Sprouts bowl": { cuisine: "Healthy", spice: "Mild", tags: ["Protein"] },
  "Sabudana khichdi": { cuisine: "Maharashtrian", spice: "Mild", tags: ["Fasting"] },
  "Misal pav": { cuisine: "Maharashtrian", spice: "Spicy", tags: ["Popular"] },
  "Rajma chawal": { cuisine: "Punjabi", spice: "Medium", tags: ["Comfort"] },
  "Chole chawal": { cuisine: "Punjabi", spice: "Medium", tags: ["Popular"] },
  "Jain mini thali": { cuisine: "Jain", spice: "Mild", tags: ["No onion/garlic"] },
  "Gujarati mini thali": { cuisine: "Gujarati", spice: "Mild", tags: ["Balanced"] },
  "Khichdi kadhi": { cuisine: "Gujarati", spice: "Mild", tags: ["Light"] },
  "Dal dhokli": { cuisine: "Gujarati", spice: "Medium", tags: ["Homestyle"] },
  "Dal makhani rice": { cuisine: "Punjabi", spice: "Medium", tags: ["Rich"] },
  "Curd rice": { cuisine: "South Indian", spice: "Mild", tags: ["Light"] },
  "Lemon rice": { cuisine: "South Indian", spice: "Mild", tags: ["Light"] },
  "Millet khichdi": { cuisine: "Healthy", spice: "Mild", tags: ["Millet"] },
  "Varan bhaat": { cuisine: "Maharashtrian", spice: "Mild", tags: ["Comfort"] },
};

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const mealType = params.get("meal") === "lunch" ? "lunch" : "breakfast";
  const requestedDate = params.get("date");
  const navigate = useNavigate();
  const cart = useCart();
  const dateOptions = useMemo(() => Array.from({ length: 7 }, (_, offset) => istDateFromOffset(offset)), []);
  const date = requestedDate || dateOptions[0];

  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cuisine, setCuisine] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setOrders([]);
    Promise.all([
      api.menu(date, mealType),
      api.ordersForDay(date).catch(() => []),
    ])
      .then(([menuItems, dayOrders]) => {
        setMenu(menuItems);
        setOrders(dayOrders);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date, mealType]);

  const selectedForMeal = cart.date === date ? cart.items[mealType] : null;
  const alreadyBooked = orders.some((order) => order.meal_type === mealType && order.status !== "skipped");
  const filteredMenu = menu.filter((item) => {
    const meta = DISH_META[item.dish.name] || {};
    return cuisine === "All" || meta.cuisine === cuisine || meta.tags?.includes(cuisine);
  });

  const toggleAdd = (item) => {
    if (selectedForMeal?.id === item.id) {
      cart.setItem(mealType, null, date);
    } else {
      cart.setItem(mealType, item, date);
    }
  };

  const updateParams = (next) => {
    const merged = {
      meal: next.meal || mealType,
      date: next.date || date,
    };
    setParams(merged);
  };

  return (
    <AppShell>
      <div className="bg-bottle text-white px-5 pt-4 pb-5 md:px-10 md:py-7">
        <div className="max-w-6xl mx-auto">
          <div className="text-[11px] font-extrabold tracking-wide text-saffron uppercase">Choose service day</div>
          <div className="mt-1 text-lg md:text-3xl font-extrabold">Menu for {formatDateFull(date)}</div>
          <div className="text-xs md:text-sm opacity-90 mt-1">
            Pick today if a slot is still available, or pre-book any open upcoming batch.
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-line">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col gap-3 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {dateOptions.map((option, index) => (
              <button
                key={option}
                onClick={() => updateParams({ date: option })}
                className={`flex-none rounded px-4 py-2 text-xs font-extrabold transition ${
                  date === option ? "bg-bottle text-white" : "bg-surface text-ink"
                }`}
              >
                <span className="block">{index === 0 ? "Today" : index === 1 ? "Tomorrow" : formatShortDay(option)}</span>
                <span className={`block mt-0.5 text-[10px] ${date === option ? "text-white/80" : "text-muted"}`}>
                  {formatTinyDate(option)}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
          {["breakfast", "lunch"].map((m) => (
            <button
              key={m}
              onClick={() => updateParams({ meal: m })}
              className={`min-w-[112px] rounded px-4 py-2 text-sm font-extrabold capitalize ${
                mealType === m ? "bg-bottle text-white" : "bg-surface text-ink"
              }`}
            >
              {m}
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 text-xs font-bold text-mutedwarm">
            <span className="bg-cream px-2.5 py-1.5 rounded">Veg only</span>
            <span className="bg-cream px-2.5 py-1.5 rounded">Final price</span>
            <span className="bg-cream px-2.5 py-1.5 rounded">No delivery fee</span>
          </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-4 pb-28">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CUISINE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setCuisine(filter)}
              className={`flex-none rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                cuisine === filter ? "border-bottle bg-bottle text-white" : "border-line bg-white text-ink"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <Notice className="bg-white border border-line text-mutedwarm">
          <strong className="text-ink">{date === dateOptions[0] ? "Today is limited:" : "Tiffin-first design:"}</strong>{" "}
          {alreadyBooked
            ? `Your ${mealType} is already booked for this date. Use Calendar to skip it or pick another meal slot.`
            : date === dateOptions[0]
            ? "same-day booking depends on remaining kitchen capacity and meals you have not already booked."
            : "a smaller menu keeps prep predictable, routes efficient, and prices transparent."}
        </Notice>

        <div className="grid md:grid-cols-3 gap-3">
          <MiniFeature title="Smart default" text="If you forget, Bites can pick the most popular veg meal." />
          <MiniFeature title="Swap window" text="Change tomorrow's meal before the nightly lock." />
          <MiniFeature title="Add-ons" text="Curd, buttermilk, fruit bowl and extra roti stay lightweight." />
        </div>

        {error && <div className="text-sm text-warn font-semibold">{error}</div>}
        {loading && <div className="text-sm text-mutedwarm">Loading menu…</div>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenu.map((item, index) => {
            const isSelected = selectedForMeal?.id === item.id;
            const meta = DISH_META[item.dish.name] || { cuisine: "Homestyle", spice: "Medium", tags: [] };
            const cannotAdd = item.sold_out || alreadyBooked;
            return (
              <Card
                key={item.id}
                className={`animate-fade-up smooth-card relative overflow-hidden border ${
                  isSelected ? "border-bottle shadow-phone" : "border-line hover:border-bottle/40"
                } ${item.sold_out ? "opacity-55" : ""}`}
                style={{ animationDelay: `${Math.min(index * 45, 240)}ms` }}
              >
                {isSelected && (
                  <div className="absolute right-3 top-3 z-10 bg-saffron text-ink text-[10px] font-extrabold px-2 py-1 rounded">
                    ADDED
                  </div>
                )}
                <div className="h-[150px] bg-canvas overflow-hidden">
                  <DishThumb name={item.dish.name} imageUrl={item.dish.image_url} />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <Badge>{meta.cuisine}</Badge>
                    <Badge>{meta.spice}</Badge>
                    {meta.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[16px] font-extrabold text-ink leading-snug">{item.dish.name}</div>
                    <div className="text-[11px] font-bold text-good bg-[#E9F7EE] px-2 py-1 rounded">4.3</div>
                  </div>
                  <div className="text-xs text-muted mt-1.5 leading-relaxed min-h-[40px]">
                    {alreadyBooked
                      ? `Already booked for ${date}`
                      : item.sold_out
                      ? `Sold out for ${date}`
                      : `${item.dish.description} · ${item.dish.kcal} kcal`}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-base font-extrabold text-ink">
                      {money(item.price)} {!cannotAdd && <span className="text-[11px] text-muted font-bold"> final</span>}
                    </div>
                    <button
                      disabled={cannotAdd}
                      onClick={() => toggleAdd(item)}
                      className={
                        cannotAdd
                          ? "border border-line text-line text-xs font-extrabold px-3.5 py-1.5 rounded-md"
                          : isSelected
                          ? "bg-saffron text-ink text-xs font-extrabold px-4 py-1.5 rounded-md"
                          : "border border-bottle text-bottle text-xs font-extrabold px-5 py-1.5 rounded"
                      }
                    >
                      {alreadyBooked ? "Booked" : item.sold_out ? "Sold out" : isSelected ? "Added" : "Add"}
                    </button>
                  </div>
                  {!cannotAdd && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {["Curd +₹12", "Fruit +₹25", "Extra roti +₹10"].map((addon) => (
                        <button
                          key={addon}
                          className="flex-none rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold text-mutedwarm"
                        >
                          {addon}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {cart.count > 0 && cart.date === date && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-line px-5 py-3 z-10 shadow-[0_-4px_18px_rgba(23,35,55,.08)]">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="flex-1">
              <div className="text-base font-extrabold text-ink">{cart.count} meal{cart.count > 1 ? "s" : ""} · {money(cart.total)}</div>
              <div className="text-[11px] text-good font-bold">Final price. Taxes and batch delivery included.</div>
            </div>
            <PrimaryButton onClick={() => navigate("/booking")} className="px-7 py-3.5">
              Review cart
            </PrimaryButton>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-extrabold text-mutedwarm">
      {children}
    </span>
  );
}

function MiniFeature({ title, text }) {
  return (
    <div className="bg-white border border-line rounded p-3">
      <div className="text-sm font-extrabold text-ink">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-mutedwarm">{text}</div>
    </div>
  );
}

function formatShortDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00+05:30`);
  return d.toLocaleDateString("en-IN", { timeZone: IST_TIME_ZONE, weekday: "short" });
}

function formatTinyDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00+05:30`);
  return d.toLocaleDateString("en-IN", { timeZone: IST_TIME_ZONE, day: "numeric", month: "short" });
}
