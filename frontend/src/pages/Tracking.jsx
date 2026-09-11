import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import AppShell from "../components/AppShell";
import { Card, OutlineButton } from "../components/ui";

export default function Tracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reported, setReported] = useState(false);

  useEffect(() => {
    api.tracking(orderId).then(setData).catch((e) => setError(e.message));
  }, [orderId]);

  const reportIssue = async () => {
    await api.reportIssue(orderId);
    setReported(true);
  };

  if (error) return <div className="min-h-screen bg-surface flex items-center justify-center text-warn">{error}</div>;
  if (!data) return <div className="min-h-screen bg-surface flex items-center justify-center text-mutedwarm">Loading…</div>;

  const { order, steps } = data;

  return (
    <AppShell>
      <div className="bg-bottle text-white px-5 pt-4 pb-5 md:px-10 md:py-7">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-xl font-extrabold">
            ← {order.meal_type === "lunch" ? "Lunch" : "Breakfast"} today
          </button>
          <div className="text-2xl md:text-[28px] font-extrabold mt-2.5">
            {order.status === "handed_over" ? "Handed over" : `Arrives ${order.slot_window}`}
          </div>
          <div className="text-sm opacity-90 mt-1">
            {order.dish_name} · batch {data.batch_code}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 grid md:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-3.5">
        <Card className="p-4">
          <div className="text-sm font-extrabold text-ink mb-4">Freshness timeline</div>
          {steps.map((step, i) => (
            <div key={step.label} className="flex gap-3.5">
              <div className="flex flex-col items-center flex-none">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    step.done
                      ? "bg-good"
                      : step.active
                      ? "bg-bottle shadow-[0_0_0_5px_#D9E7DF]"
                      : "bg-white border-2 border-line"
                  }`}
                />
                {i < steps.length - 1 && (
                  <div className={`w-0.5 flex-1 ${step.done ? "bg-good" : "bg-line"}`} style={{ minHeight: 28 }} />
                )}
              </div>
              <div className={i < steps.length - 1 ? "pb-5" : ""}>
                <div className={`text-sm font-extrabold ${step.done || step.active ? "text-ink" : "text-line"}`}>
                  {step.label}
                </div>
                <div className={`text-xs mt-0.5 ${step.done || step.active ? "text-muted" : "text-line"}`}>
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-4 flex gap-3 items-center">
          <div className="w-[42px] h-[42px] rounded-full bg-[#F0ECE7] flex-none" />
          <div className="flex-1">
            <div className="text-sm font-extrabold">{data.rider_name}</div>
            <div className="text-xs text-muted">{data.kitchen_name}</div>
          </div>
          <a href={`tel:${data.rider_phone}`} className="border border-bottle text-bottle text-xs font-extrabold px-3 py-2 rounded-md">
            Call
          </a>
        </Card>

        <Card className="p-4 text-[13px] text-mutedwarm leading-relaxed">
          Running late to the gate? Meals wait in the insulated box for {data.handoff_wait_minutes} minutes after the slot.
        </Card>

        <OutlineButton
          onClick={reportIssue}
          disabled={reported}
          className="border-warn text-warn"
        >
          {reported ? "Issue reported" : "Report an issue"}
        </OutlineButton>
        </div>

        <div className="flex flex-col gap-3">
          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">Kitchen transparency</div>
            <div className="mt-3 grid gap-2 text-xs leading-relaxed text-mutedwarm">
              <div><strong className="text-ink">Kitchen:</strong> {data.kitchen_name}</div>
              <div><strong className="text-ink">Packed:</strong> {data.packed_at} with sealed batch code.</div>
              <div><strong className="text-ink">Inspection:</strong> {data.inspection_status}.</div>
              <div><strong className="text-ink">Rating:</strong> {data.kitchen_rating} from this delivery point.</div>
            </div>
          </Card>
          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">Bites Assured</div>
            <div className="mt-2 text-xs leading-relaxed text-mutedwarm">
              Late batch, wrong meal, broken seal or missed handoff can trigger wallet credit from this order screen.
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
