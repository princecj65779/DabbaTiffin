import { useEffect, useState } from "react";
import { api } from "../api";
import AppShell from "../components/AppShell";
import { Card, Notice } from "../components/ui";

export default function Skip() {
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
        <Notice className="bg-white border border-line text-mutedwarm">
          Skips for the next day close at <strong className="text-ink">24:00</strong>. Skipped meals return to your
          Bites wallet automatically.
        </Notice>

        {error && <div className="text-sm text-warn font-semibold">{error}</div>}

        <div className="grid sm:grid-cols-2 gap-3">
          {days.map((day, i) => {
            const bothSkipped = day.breakfast_status === "skipped" && day.lunch_status === "skipped";
            const noService = !day.service_available;
            return (
              <Card
                key={day.date}
                className={`animate-fade-up smooth-card p-4 border ${bothSkipped ? "border-warnborder bg-warnbg" : "border-line"}`}
                style={{ animationDelay: `${Math.min(i * 45, 260)}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-sm font-extrabold ${bothSkipped ? "text-warn" : "text-ink"}`}>
                      {day.label}
                    </div>
                    <div className={`text-xs mt-1 leading-relaxed ${bothSkipped ? "text-warn" : "text-muted"}`}>
                    {noService
                      ? "No service"
                      : !day.menu_open
                      ? "Menu not open yet"
                      : bothSkipped
                      ? "Both meals skipped"
                      : [day.breakfast_dish, day.lunch_dish].filter(Boolean).join(" · ") || "Nothing booked"}
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
                    />
                    <SkipButton
                      label="Lunch"
                      status={day.lunch_status}
                      orderId={day.lunch_order_id}
                      busy={busy === day.lunch_order_id}
                      onAct={act}
                    />
                  </div>
                )}
                {day.menu_open && !noService && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="rounded bg-surface px-2 py-2 text-[11px] font-extrabold text-bottle">
                      Swap meal
                    </button>
                    <button className="rounded bg-surface px-2 py-2 text-[11px] font-extrabold text-bottle">
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

function SkipButton({ label, status, orderId, busy, onAct }) {
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
