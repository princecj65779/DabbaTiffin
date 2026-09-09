import { useEffect, useState } from "react";
import { api } from "../api";
import AppShell from "../components/AppShell";
import { Card, OutlineButton } from "../components/ui";
import { money, formatDateLabel } from "../lib/format";
import { DishThumb } from "./Home";

const STATUS_TEXT = {
  booked: "confirmed",
  out_for_delivery: "out for delivery",
  handed_over: "on time",
  skipped: "skipped",
};

export default function Orders() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.ordersHistory().then(setData).catch((e) => setError(e.message));
  }, []);

  if (!data) {
    return (
      <AppShell>
        <div className="p-6 text-mutedwarm">{error || "Loading orders…"}</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="bg-bottle text-white px-5 pt-4 pb-5 md:px-10 md:py-7">
        <div className="max-w-5xl mx-auto">
          <div className="text-[11px] font-extrabold tracking-wide text-saffron uppercase">Bites activity</div>
          <div className="mt-1 text-lg md:text-3xl font-extrabold">Orders and savings</div>
          <div className="flex gap-3 mt-4 max-w-md">
            <div className="bg-white/15 rounded p-3 flex-1">
              <div className="text-lg font-extrabold">{money(data.spent_this_month)}</div>
              <div className="text-[11px] opacity-85 font-bold mt-0.5">THIS MONTH</div>
            </div>
            <div className="bg-white/15 rounded p-3 flex-1">
              <div className="text-lg font-extrabold">{data.meals_eaten_this_month}</div>
              <div className="text-[11px] opacity-85 font-bold mt-0.5">MEALS EATEN</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 grid md:grid-cols-[1fr_300px] gap-4 items-start">
        <Card className="overflow-hidden border border-line">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-ink">Recent tiffin orders</div>
              <div className="text-xs text-muted mt-0.5">Delivered, skipped and refunded meals.</div>
            </div>
            <div className="text-[11px] font-extrabold text-bottle bg-surface px-2.5 py-1.5 rounded">BATCH</div>
          </div>
          {data.orders.map((order, i) => (
            <div
              key={order.id}
              className={`px-4 py-3.5 flex gap-3 items-center ${
                i < data.orders.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div className="w-12 h-12 rounded bg-canvas flex-none overflow-hidden">
                <DishThumb name={order.dish_name} />
              </div>
              <div className="flex-1">
                <div className={`text-sm font-extrabold ${order.status === "skipped" ? "text-muted" : "text-ink"}`}>
                  {order.status === "skipped" ? `${order.meal_type} skipped` : order.dish_name}
                </div>
                <div className={`text-xs mt-0.5 ${order.status === "skipped" ? "text-good" : "text-muted"}`}>
                  {formatDateLabel(order.date)} · {order.meal_type} ·{" "}
                  {order.status === "skipped" ? "refunded to wallet" : STATUS_TEXT[order.status]}
                </div>
              </div>
              <div className={`text-sm font-extrabold ${order.status === "skipped" ? "text-good" : "text-ink"}`}>
                {order.status === "skipped" ? `+${money(order.price)}` : money(order.price)}
              </div>
            </div>
          ))}
          {data.orders.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">No orders yet — book tomorrow's menu.</div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-4 flex justify-between items-center border border-line">
            <div>
              <div className="text-sm font-extrabold">Bites wallet</div>
              <div className="text-xs text-muted mt-0.5">Credits from skipped meals</div>
            </div>
            <div className="text-lg font-extrabold text-bottle-dark">{money(data.wallet_balance)}</div>
          </Card>

          <Card className="p-4 text-[13px] text-mutedwarm leading-relaxed border border-line">
            <div className="text-sm font-extrabold text-ink mb-1">Monthly benchmark</div>
            Mess average in your area is ₹3,000-4,000 a month. You are at{" "}
            <strong className="text-ink">{money(data.spent_this_month)}</strong> so far.
          </Card>

          <OutlineButton>Download invoices</OutlineButton>
        </div>
      </div>
    </AppShell>
  );
}
