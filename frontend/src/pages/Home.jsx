import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import AppShell from "../components/AppShell";
import Logo from "../components/Logo";
import { Card } from "../components/ui";
import { money, formatDateFull } from "../lib/format";
import { formatIstTime, isBeforeIstCutoff } from "../lib/time";

const STATUS_LABEL = {
  booked: "Confirmed",
  out_for_delivery: "Out for delivery",
  handed_over: "Handed over",
  skipped: "Skipped",
};

export default function Home() {
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busySkip, setBusySkip] = useState(null);
  const [now, setNow] = useState(() => new Date());

  const load = () => api.home().then(setData).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const skip = async (orderId) => {
    setBusySkip(orderId);
    try {
      await api.skipOrder(orderId);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusySkip(null);
    }
  };

  if (!data) {
    return (
      <AppShell>
        <div className="p-6 text-mutedwarm">{error || "Loading your day…"}</div>
      </AppShell>
    );
  }

  const [todayBreakfastRaw, todayLunchRaw] = data.today;
  const [tomorrowBreakfastRaw, tomorrowLunchRaw] = data.tomorrow;
  const pendingForToday = cart.date === data.today_date;
  const pendingForTomorrow = cart.date === data.tomorrow_date;
  const todayBreakfast = pendingForToday && cart.items.breakfast
    ? cartSlotFromMenuItem(cart.items.breakfast, "breakfast")
    : todayBreakfastRaw;
  const todayLunch = pendingForToday && cart.items.lunch
    ? cartSlotFromMenuItem(cart.items.lunch, "lunch")
    : todayLunchRaw;
  const tomorrowBreakfast = pendingForTomorrow && cart.items.breakfast
    ? cartSlotFromMenuItem(cart.items.breakfast, "breakfast")
    : tomorrowBreakfastRaw;
  const tomorrowLunch = pendingForTomorrow && cart.items.lunch
    ? cartSlotFromMenuItem(cart.items.lunch, "lunch")
    : tomorrowLunchRaw;
  const pendingCount = pendingForToday || pendingForTomorrow ? cart.count : 0;
  const cartCount = cart.count;
  const currentTime = formatIstTime(now);
  const todayCount = [todayBreakfast, todayLunch].filter((slot) => slot.status && slot.status !== "skipped").length;
  const tomorrowCount = [tomorrowBreakfast, tomorrowLunch].filter((slot) => slot.status && slot.status !== "skipped").length;
  const routeTarget = data.route_discount_target || 25;
  const routeCount = Math.min(data.route_confirmed_meals ?? tomorrowCount, routeTarget);
  const routeProgress = Math.round((routeCount / routeTarget) * 100);
  const bookingClosesAt = data.booking_closes_at || "23:00";
  const skipClosesAt = data.skip_closes_at === "24:00" ? "23:59" : data.skip_closes_at || "23:59";
  const bookingOpen = isBeforeIstCutoff(bookingClosesAt, now, data.booking_open ?? true);
  const skipOpen = isBeforeIstCutoff(skipClosesAt, now, data.skip_open ?? true);
  const nextAction = cartCount > 0
    ? "Review selected meals"
    : tomorrowCount === 0
    ? "Book tomorrow's meal"
    : data.subscription
    ? "Manage active plan"
    : "Add another meal";
  const mealCountLabel = `${todayCount} meal${todayCount === 1 ? "" : "s"}`;
  const commitSteps = [
    {
      title: "Try 1 meal",
      text: cartCount > 0 ? `${cartCount} selected in cart.` : data.menu_live ? "Pick from the live menu." : "Next menu opens soon.",
      to: "/menu",
      active: cartCount > 0 || tomorrowCount === 0,
    },
    {
      title: "Book week",
      text: "Review upcoming meals.",
      to: "/calendar",
      active: tomorrowCount > 0 && !data.subscription,
    },
    {
      title: data.subscription ? "Plan active" : "Subscribe",
      text: data.subscription ? `${data.subscription.meals_left} meals left.` : "Drop per-meal price.",
      to: "/plans",
      active: Boolean(data.subscription),
    },
    {
      title: "Group batch",
      text: `${routeCount}/${routeTarget} meals toward next route perk.`,
      to: "/delivery-point",
      active: routeCount >= routeTarget,
    },
  ];

  return (
    <AppShell>
      <div className="bg-bottle text-white px-5 py-3.5 md:hidden">
        <div className="mb-3">
          <Logo />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[11px] opacity-85 font-bold tracking-wide">DELIVERING TO</div>
            <div className="text-[15px] font-extrabold mt-0.5">{data.delivering_to} ▾</div>
          </div>
          <Link
            to="/profile"
            className="w-[34px] h-[34px] rounded-full bg-saffron text-ink flex items-center justify-center text-sm font-extrabold"
          >
            {user?.full_name?.[0]?.toUpperCase() || "A"}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-[1fr_340px] gap-5 md:gap-6 items-start">
        <section className="md:col-span-2 bg-white rounded-xl2 shadow-card overflow-hidden animate-fade-up">
          <div className="bg-bottle px-4 py-4 md:px-6 md:py-5 text-white flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] font-extrabold tracking-wide text-saffron uppercase">Flipkart Bites pilot</div>
              <h1 className="mt-1 text-[22px] md:text-[30px] font-extrabold leading-tight">
                {nextAction}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
                {cartCount > 0
                  ? `${cartCount} meal${cartCount === 1 ? "" : "s"} selected for ${formatDateFull(cart.date)}. Confirm payment to lock the batch.`
                  : tomorrowCount > 0
                  ? `${tomorrowCount} meal${tomorrowCount === 1 ? "" : "s"} already set for tomorrow. You can still edit before the cutoff.`
                  : "Tomorrow's menu is ready to pre-book from one familiar Flipkart surface."}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:w-[330px]">
              <HeroMetric value={currentTime} label="current time" />
              <HeroMetric value={bookingClosesAt} label={bookingOpen ? "booking open" : "booking closed"} />
              <HeroMetric value={skipClosesAt} label={skipOpen ? "skip open" : "skip closed"} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
            <JourneyStep title="1. Choose tomorrow" text="Breakfast and lunch menus go live a day ahead." />
            <JourneyStep title="2. Pay final price" text="No surge, no packaging add-on, no surprise fees." />
            <JourneyStep title="3. Pick up on batch" text={`Current point: ${data.delivering_to}.`} />
          </div>
        </section>

        <section className="md:col-span-2 grid md:grid-cols-[1.4fr_.9fr] gap-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <Card className="p-4 border border-line smooth-card">
            <div className="text-sm font-extrabold text-ink">Start small, commit when it works</div>
            <div className="mt-3 grid sm:grid-cols-4 gap-2">
              {commitSteps.map((step) => (
                <CommitStep key={step.title} {...step} />
              ))}
            </div>
          </Card>
          <Card className="p-4 border border-line smooth-card">
            <div className="text-sm font-extrabold text-ink">Bites Assured</div>
            <div className="mt-3 grid gap-2 text-xs leading-relaxed text-mutedwarm">
              <div><strong className="text-ink">Late meal credit:</strong> wallet credit if batch misses its slot.</div>
              <div><strong className="text-ink">Sealed handoff:</strong> kitchen-packed meals with batch code.</div>
              <div><strong className="text-ink">Wrong meal refund:</strong> quick issue flow from tracking.</div>
            </div>
          </Card>
        </section>

        <div className="flex flex-col gap-4">
          {cartCount > 0 && (
            <PendingCartCard
              date={cart.date}
              items={cart.items}
              total={cart.total}
              onReview={() => navigate("/booking")}
              onEdit={() => navigate(`/menu?date=${cart.date}&meal=${cart.items.breakfast ? "breakfast" : "lunch"}`)}
            />
          )}

          <div className="hidden md:flex justify-between items-end">
            <div>
              <div className="text-2xl font-extrabold text-ink">Today, {formatDateFull(data.today_date)}</div>
              <div className="text-sm text-mutedwarm mt-1">{mealCountLabel} in the {data.delivering_to} batch</div>
            </div>
            {data.menu_live && (
              <div className="bg-saffron text-ink text-xs font-extrabold px-3 py-2 rounded-md">
                TOMORROW&rsquo;S MENU IS LIVE
              </div>
            )}
          </div>

          <Card className="overflow-hidden border border-line smooth-card animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="bg-white px-4 py-3 text-xs font-extrabold flex justify-between border-b border-line">
              <span>TODAY, {formatDateFull(data.today_date).toUpperCase()}</span>
              <span className="text-bottle">{mealCountLabel.toUpperCase()}</span>
            </div>
            <TodayRow
              slot={todayBreakfast}
              onTrack={() => navigate(todayBreakfast.status === "selected" ? "/booking" : `/tracking/${todayBreakfast.order_id}`)}
            />
            <TodayRow
              slot={todayLunch}
              border={false}
              onTrack={() => navigate(todayLunch.status === "selected" ? "/booking" : `/tracking/${todayLunch.order_id}`)}
            />
          </Card>

          <Card className="p-4 flex flex-col gap-3 border border-line smooth-card animate-fade-up" style={{ animationDelay: "160ms" }}>
            <div className="flex justify-between items-center">
              <div className="text-xs font-extrabold text-muted tracking-wide">
                TOMORROW, {formatDateFull(data.tomorrow_date).toUpperCase()}
              </div>
              {data.menu_live && (
                <div className="bg-saffron text-ink text-[10px] font-extrabold px-2 py-1 rounded tracking-wide">
                  MENU LIVE
                </div>
              )}
            </div>

            <TomorrowRow
              slot={tomorrowBreakfast}
              onBook={() => navigate(`/menu?date=${data.tomorrow_date}&meal=breakfast`)}
              onReview={() => navigate("/booking")}
              onSkip={() => skip(tomorrowBreakfast.order_id)}
              skipping={busySkip === tomorrowBreakfast.order_id}
            />
            <div className="h-px bg-[#F0ECE7]" />
            <TomorrowRow
              slot={tomorrowLunch}
              onBook={() => navigate(`/menu?date=${data.tomorrow_date}&meal=lunch`)}
              onReview={() => navigate("/booking")}
              onSkip={() => skip(tomorrowLunch.order_id)}
              skipping={busySkip === tomorrowLunch.order_id}
            />

            <div className="bg-surface rounded px-3 py-2.5 text-xs text-mutedwarm leading-relaxed">
              Booking is <strong className="text-ink">{bookingOpen ? "open" : "closed"}</strong> until{" "}
              <strong className="text-ink">{bookingClosesAt}</strong>. Skips are{" "}
              <strong className="text-ink">{skipOpen ? "open" : "closed"}</strong> until {skipClosesAt}.
            </div>
            <Link to="/calendar" className="text-xs font-extrabold text-bottle self-start">
              Open meal calendar →
            </Link>
          </Card>

          {error && <div className="text-sm text-warn font-semibold">{error}</div>}
        </div>

        <div className="flex flex-col gap-4">
          {data.subscription ? (
            <Card className="!bg-bottle text-white p-4 md:p-5 flex flex-col gap-3 shadow-none smooth-card animate-fade-up" style={{ animationDelay: "180ms" }}>
              <div className="text-[11px] font-extrabold tracking-wide text-saffron uppercase">Active subscription</div>
              <div className="text-[15px] md:text-base font-extrabold">
                {data.subscription.plan.name} plan · {data.subscription.plan.meals_count} days
              </div>
              <div className="text-xs opacity-85 leading-relaxed">
                {data.subscription.meals_left} meals left · renews {data.subscription.renews_on}
              </div>
              <Link
                to="/plans"
                className="mt-2 bg-saffron text-ink text-center py-2.5 rounded-md text-[13px] font-extrabold"
              >
                Manage plan
              </Link>
            </Card>
          ) : (
            <Card className="p-4 flex flex-col gap-2 border border-line smooth-card">
              <div className="text-[15px] font-extrabold text-ink">No active plan</div>
              <div className="text-xs text-muted">Subscribe and stop deciding every night.</div>
              <Link to="/plans" className="mt-2 border border-bottle text-bottle text-center py-2.5 rounded text-[13px] font-extrabold">
                See plans
              </Link>
            </Card>
          )}

          <div className="flex gap-2.5">
            <Card className="flex-1 p-3.5 border border-line smooth-card">
              <div className="text-xl font-extrabold text-bottle-dark">{money(data.spent_this_month)}</div>
              <div className="text-[11px] text-muted mt-0.5 font-bold">SPENT THIS MONTH</div>
            </Card>
            <Card className="flex-1 p-3.5 border border-line smooth-card">
              <div className="text-xl font-extrabold text-good">₹0</div>
              <div className="text-[11px] text-muted mt-0.5 font-bold">FEES OR SURGE</div>
            </Card>
          </div>

          <Card className="p-4 border border-line smooth-card">
            <div className="text-sm font-extrabold text-ink">Why this is not restaurant delivery</div>
            <div className="mt-2 grid gap-2 text-xs leading-relaxed text-mutedwarm">
              <div><strong className="text-ink">Fixed menu:</strong> fewer choices, faster decisions.</div>
              <div><strong className="text-ink">Batched routes:</strong> predictable slots for PGs, offices and campuses.</div>
              <div><strong className="text-ink">Subscription-first:</strong> built for everyday meals, not impulse orders.</div>
            </div>
          </Card>

          <Card className="p-4 border border-line smooth-card">
            <div className="text-sm font-extrabold text-ink">Emergency meal slot</div>
            <div className="mt-2 text-xs leading-relaxed text-mutedwarm">
              Same-day surplus opens only when kitchens have extra capacity, keeping Bites tiffin-first instead of
              becoming a restaurant feed.
            </div>
            <Link to="/menu" className="mt-3 block rounded bg-flipkart-orange px-3 py-2 text-center text-xs font-extrabold text-white">
              Check surplus
            </Link>
          </Card>

          <Card className="p-4 border border-line smooth-card">
            <div className="text-sm font-extrabold text-ink">Invite to unlock better routes</div>
            <div className="mt-2 text-xs leading-relaxed text-mutedwarm">
              Invite residents at your PG or teammates at work. More confirmed meals improve route pricing for everyone.
            </div>
            <div className="mt-3 h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-good rounded-full animate-soft-pulse" style={{ width: `${routeProgress}%` }} />
            </div>
            <div className="mt-2 text-[11px] font-bold text-good">
              {routeCount} of {routeTarget} meals toward the next discount
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function HeroMetric({ value, label }) {
  return (
    <div className="bg-white/12 rounded p-3 text-center">
      <div className="text-[18px] font-extrabold text-saffron">{value}</div>
      <div className="mt-0.5 text-[11px] font-bold text-white/80">{label}</div>
    </div>
  );
}

function JourneyStep({ title, text }) {
  return (
    <div className="px-4 py-3 md:px-5 md:py-4">
      <div className="text-sm font-extrabold text-ink">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-mutedwarm">{text}</div>
    </div>
  );
}

function CommitStep({ title, text, active, to }) {
  return (
    <Link to={to} className={`rounded border p-3 smooth-card ${active ? "border-bottle bg-[#EEF4FF]" : "border-line bg-white"}`}>
      <div className="text-xs font-extrabold text-ink">{title}</div>
      <div className="mt-1 text-[11px] leading-relaxed text-mutedwarm">{text}</div>
    </Link>
  );
}

function PendingCartCard({ date, items, total, onReview, onEdit }) {
  const selectedItems = [
    ["breakfast", items.breakfast],
    ["lunch", items.lunch],
  ].filter(([, item]) => Boolean(item));

  return (
    <Card className="p-4 border border-bottle bg-[#EEF4FF] smooth-card animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] font-extrabold tracking-wide text-bottle uppercase">Selected for checkout</div>
          <div className="mt-1 text-sm font-extrabold text-ink">{formatDateFull(date)}</div>
        </div>
        <div className="text-sm font-extrabold text-bottle">{money(total)}</div>
      </div>
      <div className="mt-3 grid gap-2">
        {selectedItems.map(([mealType, item]) => (
          <div key={mealType} className="flex items-center gap-3 rounded bg-white/75 p-2">
            <div className="h-11 w-11 flex-none overflow-hidden rounded bg-surface">
              <DishThumb name={item.dish.name} imageUrl={item.dish.image_url} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-extrabold text-ink">{item.dish.name}</div>
              <div className="text-[11px] font-bold capitalize text-bottle">{mealType} · selected, not paid</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={onEdit} className="rounded border border-bottle px-3 py-2 text-xs font-extrabold text-bottle">
          Edit
        </button>
        <button onClick={onReview} className="rounded bg-saffron px-3 py-2 text-xs font-extrabold text-ink">
          Review
        </button>
      </div>
    </Card>
  );
}

function TodayRow({ slot, border = true, onTrack }) {
  const isDone = slot.status === "handed_over";
  const isSelected = slot.status === "selected";
  return (
    <div className={`px-4 py-3.5 flex gap-3 items-center ${border ? "border-b border-line" : ""}`}>
      <div className="w-14 h-14 rounded bg-surface flex-none overflow-hidden">
        {slot.dish_name && <DishThumb name={slot.dish_name} imageUrl={slot.image_url} />}
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-extrabold text-ink">{slot.dish_name || "Not booked"}</div>
        <div className={`text-xs font-bold mt-0.5 ${isDone ? "text-good" : "text-bottle"}`}>
          {slot.status === "handed_over" && "Handed over"}
          {slot.status === "out_for_delivery" && `Out for delivery · ${slot.slot_window}`}
          {slot.status === "booked" && `Confirmed · ${slot.slot_window}`}
          {isSelected && "Selected, not paid"}
          {!slot.status && "Nothing booked for today"}
        </div>
      </div>
      {slot.status === "handed_over" && (
        <div className="text-[11px] font-extrabold text-good border border-good rounded px-2 py-1">DONE</div>
      )}
      {slot.status === "out_for_delivery" && (
        <button onClick={onTrack} className="text-xs font-extrabold text-bottle">
          Track
        </button>
      )}
      {isSelected && (
        <button onClick={onTrack} className="text-xs font-extrabold text-ink bg-saffron rounded-md px-3 py-2">
          Review
        </button>
      )}
    </div>
  );
}

function TomorrowRow({ slot, onBook, onReview, onSkip, skipping }) {
  const booked = slot.status === "booked";
  const selected = slot.status === "selected";
  return (
    <div className="flex gap-3 items-center">
      <div className="w-14 h-14 rounded bg-surface flex-none overflow-hidden">
        {(slot.dish_name || slot.preview_dishes[0]) && (
          <DishThumb name={slot.dish_name || slot.preview_dishes[0]} imageUrl={slot.image_url} />
        )}
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-extrabold text-ink">
          <span className="capitalize">{slot.meal_type}</span> ·{" "}
          {slot.dish_name || slot.preview_dishes.join(" or ") || "not booked"}
        </div>
        <div className={`text-xs mt-0.5 ${booked ? "text-good font-bold" : selected ? "text-bottle font-bold" : "text-muted"}`}>
          {slot.note || (booked ? "Booked" : selected ? "Selected, not paid" : slot.status === "skipped" ? "Skipped" : "")}
        </div>
      </div>
      {selected && (
        <button onClick={onReview} className="text-xs font-extrabold text-ink bg-saffron rounded-md px-3 py-2">
          Review
        </button>
      )}
      {booked && (
        <button
          onClick={onSkip}
          disabled={skipping}
          className="text-xs font-extrabold text-bottle border border-bottle rounded-md px-2.5 py-1.5"
        >
          {skipping ? "…" : "Skip"}
        </button>
      )}
      {!slot.status && (
        <button onClick={onBook} className="text-xs font-extrabold text-ink bg-saffron rounded-md px-3 py-2">
          Book
        </button>
      )}
      {slot.status === "skipped" && <span className="text-xs font-bold text-muted">Skipped</span>}
    </div>
  );
}

function cartSlotFromMenuItem(item, mealType) {
  return {
    meal_type: mealType,
    dish_name: item.dish.name,
    status: "selected",
    note: "Selected, not paid",
    price: item.price,
    image_url: item.dish.image_url,
    preview_dishes: [],
  };
}

export function DishThumb({ name, imageUrl }) {
  const slug = name
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const map = {
    "poha-with-sev": "poha",
    poha: "poha",
    "jain-poha": "jain-poha",
    upma: "upma",
    "idli-with-sambhar": "idli-sambhar",
    "masala-dosa-tiffin": "masala-dosa-tiffin",
    "thepla-with-curd": "thepla-curd",
    "paneer-paratha": "paneer-paratha",
    "sprouts-bowl": "sprouts-bowl",
    "sabudana-khichdi": "sabudana-khichdi",
    "misal-pav": "misal-pav",
    "rajma-chawal": "rajma-chawal",
    "chole-chawal": "chole-chawal",
    chole: "chole-chawal",
    "jain-mini-thali": "jain-thali",
    "gujarati-mini-thali": "gujarati-thali",
    "khichdi-kadhi": "khichdi-kadhi",
    "dal-dhokli": "dal-dhokli",
    "dal-makhani-rice": "dal-makhani-rice",
    "curd-rice": "curd-rice",
    "lemon-rice": "lemon-rice",
    "millet-khichdi": "millet-khichdi",
    "varan-bhaat": "varan-bhaat",
  };
  const file = map[slug];
  const src = imageUrl
    ? `${import.meta.env.BASE_URL}${imageUrl.replace(/^\//, "")}`
    : file
    ? `${import.meta.env.BASE_URL}dishes/${file}.jpg`
    : null;
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-cover"
    />
  );
}
