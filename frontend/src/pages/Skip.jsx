import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import AppShell from "../components/AppShell";
import { Card, Notice } from "../components/ui";
import { money, formatDateFull } from "../lib/format";
import { DishThumb } from "./Home";

const SKIP_CUTOFF = "23:59";

export default function Skip() {
  const navigate = useNavigate();
  const cart = useCart();
  const [days, setDays] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = () => api.ordersWeek().then(setDays).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const act = async (orderId, action) => {
    setBusy(orderId);
    try {
      if (action === "skip") await api.skipOrder(orderId);
      else await api.undoSkip(orderId);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const visibleDays = days.map((day) => {
    if (day.date !== cart.date || cart.count === 0) return day;
    return {
      ...day,
      breakfast_dish: cart.items.breakfast?.dish.name || day.breakfast_dish,
      lunch_dish: cart.items.lunch?.dish.name || day.lunch_dish,
      breakfast_status: cart.items.breakfast ? "selected" : day.breakfast_status,
      lunch_status: cart.items.lunch ? "selected" : day.lunch_status,
      menu_open: true,
    };
  });

  return (
    <AppShell>
      <div className="bg-bottle text-white px-5 pt-4 pb-5 md:px-10 md:py-7">
        <div className="max-w-5xl mx-auto">
          <div className="text-[11px] font-extrabold tracking-wide text-saffron uppercase">Meal calendar</div>
          <div className="mt-1 text-lg md:text-3xl font-extrabold">Plan, skip and protect credits</div>
          <div className="text-xs md:text-sm opacity-90 mt-1">
            Your upcoming tiffins in one view, built for routine instead of last-minute ordering.
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 grid lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="flex flex-col gap-3">
        {cart.count > 0 && (
          <PendingCalendarCard
            cart={cart}
            onEdit={() => navigate(`/menu?date=${cart.date}&meal=${cart.items.breakfast ? "breakfast" : "lunch"}`)}
            onReview={() => navigate("/booking")}
          />
        )}

        <Notice className="bg-white border border-line text-mutedwarm">
          Skips for the next day close at <strong className="text-ink">{SKIP_CUTOFF}</strong>. Skipped meals return to your
          Bites wallet automatically.
        </Notice>

        {error && <div className="text-sm text-warn font-semibold">{error}</div>}

        <div className="grid sm:grid-cols-2 gap-3">
          {visibleDays.map((day, i) => {
            const bothSkipped = day.breakfast_status === "skipped" && day.lunch_status === "skipped";
            const hasPending = day.breakfast_status === "selected" || day.lunch_status === "selected";
            const noService = !day.service_available;
            const daySummary = getDaySummary(day, { noService, hasPending, bothSkipped });
            return (
              <Card
                key={day.date}
                className={`animate-fade-up smooth-card p-4 border ${
                  hasPending ? "border-bottle bg-[#EEF4FF]" : bothSkipped ? "border-warnborder bg-warnbg" : "border-line"
                }`}
                style={{ animationDelay: `${Math.min(i * 45, 260)}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-sm font-extrabold ${bothSkipped ? "text-warn" : "text-ink"}`}>
                      {day.label}
                    </div>
                    <div className={`text-xs mt-1 leading-relaxed ${bothSkipped ? "text-warn" : hasPending ? "text-bottle font-bold" : "text-muted"}`}>
                      {daySummary}
                    </div>
                  </div>
                  <div className="text-[11px] font-extrabold text-bottle bg-white px-2 py-1 rounded">
                    {day.menu_open ? "OPEN" : "LOCKED"}
                  </div>
                </div>
                {noService ? (
                  <div className="mt-4 text-xs text-muted font-bold">No route scheduled</div>
                ) : !day.menu_open ? (
                  <div className="mt-4 text-xs text-muted font-bold">Menu opens closer to service day</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <SkipButton
                      label="Breakfast"
                      status={day.breakfast_status}
                      orderId={day.breakfast_order_id}
                      busy={busy === day.breakfast_order_id}
                      onAct={act}
                      onEdit={() => navigate(`/menu?date=${day.date}&meal=breakfast`)}
                      onReview={() => navigate("/booking")}
                    />
                    <SkipButton
                      label="Lunch"
                      status={day.lunch_status}
                      orderId={day.lunch_order_id}
                      busy={busy === day.lunch_order_id}
                      onAct={act}
                      onEdit={() => navigate(`/menu?date=${day.date}&meal=lunch`)}
                      onReview={() => navigate("/booking")}
                    />
                  </div>
                )}
                {day.menu_open && !noService && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/menu?date=${day.date}&meal=breakfast`)}
                      className="rounded bg-surface px-2 py-2 text-[11px] font-extrabold text-bottle"
                    >
                      Swap meal
                    </button>
                    <button
                      onClick={() => navigate(`/menu?date=${day.date}&meal=lunch`)}
                      className="rounded bg-surface px-2 py-2 text-[11px] font-extrabold text-bottle"
                    >
                      Add curd
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        </div>

        <div className="flex flex-col gap-3">
          <Card className="p-4 border border-line smooth-card">
            <div className="text-sm font-extrabold text-ink">Smart default rules</div>
            <div className="mt-3 grid gap-2 text-xs leading-relaxed text-mutedwarm">
              <div><strong className="text-ink">Auto-pick:</strong> most popular veg option when you do not choose.</div>
              <div><strong className="text-ink">Avoid repeats:</strong> rotate similar dishes across the week.</div>
              <div><strong className="text-ink">Credit safe:</strong> skipped paid meals return to wallet.</div>
            </div>
          </Card>
          <Card className="p-4 border border-line smooth-card">
            <div className="text-sm font-extrabold text-ink">Weekly nutrition balance</div>
            <div className="mt-3 grid gap-2 text-xs leading-relaxed text-mutedwarm">
              <div><strong className="text-ink">Protein:</strong> 4 steady days planned.</div>
              <div><strong className="text-ink">Light meals:</strong> 2 breakfast slots kept lighter.</div>
              <div><strong className="text-ink">Add-ons:</strong> curd, fruit bowl, buttermilk and extra roti.</div>
            </div>
          </Card>
          <Card className="p-4 border border-line smooth-card">
            <div className="text-sm font-extrabold text-ink">For group batches</div>
            <div className="mt-2 text-xs leading-relaxed text-mutedwarm">
              Offices, hostels and PGs unlock better pricing when the delivery point crosses 15 confirmed meals.
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function PendingCalendarCard({ cart, onEdit, onReview }) {
  const selectedItems = [
    ["breakfast", cart.items.breakfast],
    ["lunch", cart.items.lunch],
  ].filter(([, item]) => Boolean(item));

  return (
    <Card className="p-4 border border-bottle bg-[#EEF4FF] smooth-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-bottle">Selected for checkout</div>
          <div className="mt-1 text-sm font-extrabold text-ink">{formatDateFull(cart.date)}</div>
        </div>
        <div className="text-sm font-extrabold text-bottle">{money(cart.total)}</div>
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

function getDaySummary(day, { noService, hasPending, bothSkipped }) {
  if (noService) return "No service";
  if (!day.menu_open) return "Menu not open yet";
  if (hasPending) {
    return [
      day.breakfast_status === "selected" && day.breakfast_dish ? `Breakfast selected: ${day.breakfast_dish}` : null,
      day.lunch_status === "selected" && day.lunch_dish ? `Lunch selected: ${day.lunch_dish}` : null,
    ].filter(Boolean).join(" · ");
  }
  if (bothSkipped) return "Both meals skipped";
  return [day.breakfast_dish, day.lunch_dish].filter(Boolean).join(" · ") || "Nothing booked";
}

function SkipButton({ label, status, orderId, busy, onAct, onEdit, onReview }) {
  if (status === "selected") {
    return (
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={onEdit}
          className="text-[11px] font-extrabold text-bottle border border-bottle rounded px-2.5 py-1.5"
        >
          Edit
        </button>
        <button
          onClick={onReview}
          className="text-[11px] font-extrabold text-ink bg-saffron rounded px-2.5 py-1.5"
        >
          Review
        </button>
      </div>
    );
  }
  if (!orderId) {
    return (
      <span className="text-[11px] text-line font-bold border border-line rounded px-2 py-1.5">
        No {label}
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <button
        disabled={busy}
        onClick={() => onAct(orderId, "undo")}
        className="text-[11px] font-extrabold text-warn border border-warnborder rounded px-2.5 py-1.5"
      >
        Undo
      </button>
    );
  }
  return (
    <button
      disabled={busy}
      onClick={() => onAct(orderId, "skip")}
      className="text-[11px] font-extrabold text-bottle border border-bottle rounded px-2.5 py-1.5"
    >
    Skip {label}
  </button>
  );
}
