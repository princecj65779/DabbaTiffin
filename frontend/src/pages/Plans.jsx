import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import { Card, PrimaryButton } from "../components/ui";
import { money } from "../lib/format";
import MockPaymentModal from "../components/MockPaymentModal";

export default function Plans() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [mySub, setMySub] = useState(null);
  const [selected, setSelected] = useState(null);
  const [paymentMethod] = useState("card");
  const [showPayment, setShowPayment] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const [planList, sub] = await Promise.all([api.plans(), api.mySubscription()]);
    setPlans(planList);
    setMySub(sub);
    const featured = planList.find((p) => p.featured) || planList[0];
    setSelected(featured?.id || null);
  };

  useEffect(() => {
    load();
  }, []);

  const selectedPlan = plans.find((p) => p.id === selected);

  const start = async () => {
    if (!selectedPlan) return;
    setBusy(true);
    setError("");
    try {
      if (paymentMethod === "wallet") {
        updateUser({ wallet_balance: Number(user.wallet_balance) - selectedPlan.total_price });
      }
      const sub = await api.startSubscription({ plan_id: selectedPlan.id, payment_method: paymentMethod });
      setMySub(sub);
      navigate("/payment-success", { state: { subscription: sub } });
    } catch (err) {
      setError(err.message || "Could not start plan");
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const togglePause = async () => {
    if (!mySub) return;
    const updated = await api.pauseSubscription(!mySub.paused);
    setMySub(updated);
  };

  const pay = () => {
    if (selectedPlan) setShowPayment(true);
  };

  return (
    <AppShell>
      <div className="bg-bottle text-white px-5 pt-4 pb-5 md:px-10 md:py-7">
        <div className="max-w-5xl mx-auto">
          <div className="text-[11px] font-extrabold tracking-wide text-saffron uppercase">Bites subscriptions</div>
          <div className="mt-1 text-lg md:text-3xl font-extrabold">Subscribe for everyday tiffins</div>
          <div className="text-xs md:text-sm opacity-90 mt-1">22 working days. Skip any day free. Credits return to wallet.</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 grid md:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-3">
          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">Choose your Bites mode</div>
            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              <ModeCard title="Daily" price="Pay per meal" text="Best when you want to pre-book occasionally." />
              <ModeCard title="Monthly" price="Lowest meal price" text="Best for students, PGs and office regulars." active />
              <ModeCard title="Group" price="Route discount" text="For offices, hostels and PG admins." />
            </div>
          </Card>

        {mySub && (
          <Card className="p-4 flex justify-between items-center border border-line">
            <div>
              <div className="text-sm font-extrabold">Active: {mySub.plan.name} plan</div>
              <div className="text-xs text-muted mt-1">
                {mySub.meals_left} meals left · renews {mySub.renews_on} {mySub.paused && "· paused"}
              </div>
            </div>
            <button
              onClick={togglePause}
              className="text-xs font-extrabold text-bottle border border-bottle rounded-md px-3 py-2"
            >
              {mySub.paused ? "Resume" : "Pause"}
            </button>
          </Card>
        )}

        {plans.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <Card
              key={plan.id}
              className={`p-4 relative ${plan.featured ? "border-2 border-bottle" : "border border-line"}`}
            >
              {plan.featured && (
                <div className="absolute -top-2.5 left-4 bg-saffron text-ink text-[10px] font-extrabold px-2 py-1 rounded tracking-wide">
                  MOST PICKED
                </div>
              )}
              <button className="w-full flex gap-3 items-center text-left" onClick={() => setSelected(plan.id)}>
                <span
                  className={`w-4 h-4 rounded-full flex-none ${
                    isSelected ? "border-[5px] border-bottle" : "border-2 border-line"
                  }`}
                />
                <span className="flex-1">
                  <div className="text-[15px] font-extrabold">{plan.name}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {plan.meals_count} meals · {money(plan.price_per_meal)} a meal
                  </div>
                </span>
                <span className="text-right">
                  <div className="text-[17px] font-extrabold">{money(plan.total_price)}</div>
                  <div className="text-[11px] text-good font-extrabold">save {money(plan.savings)}</div>
                </span>
              </button>

              {plan.featured && (
                <div className="mt-3.5 bg-surface rounded p-3 grid sm:grid-cols-2 gap-2 text-xs text-ink">
                  <div>Both meals confirmed unless skipped</div>
                  <div>Same slot every day at your point</div>
                  <div>Unused days roll into next cycle</div>
                  <div>No fees, surge or packaging charge</div>
                </div>
              )}
            </Card>
          );
        })}
        </div>

        <div className="flex flex-col gap-3">
          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">How Bites plans work</div>
            <div className="mt-3 grid gap-2 text-xs leading-relaxed text-mutedwarm">
              <div><strong className="text-ink">Pre-booked:</strong> meals are locked one night before.</div>
              <div><strong className="text-ink">Skippable:</strong> pause individual meals before midnight.</div>
              <div><strong className="text-ink">Wallet-backed:</strong> skipped meal credits stay inside Bites.</div>
            </div>
          </Card>

          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">Density pricing ladder</div>
            <div className="mt-3 grid gap-2 text-xs">
              <PriceTier count="15" benefit="Route opens" />
              <PriceTier count="25" benefit="₹5 off each meal" active />
              <PriceTier count="50" benefit="Add-on rewards" />
            </div>
          </Card>

          <Card className="p-3.5 text-xs text-mutedwarm leading-relaxed border border-dashed border-line shadow-none">
            Prefer to decide daily? Pay per meal at menu price. Plans only lower the price.
          </Card>

          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">Group batch opportunity</div>
            <div className="mt-2 text-xs leading-relaxed text-mutedwarm">
              A PG or office can sponsor one handoff point, collect employee/student preferences, and unlock route pricing
              once the batch crosses 15 daily meals.
            </div>
            <button className="mt-3 w-full rounded border border-bottle px-3 py-2 text-xs font-extrabold text-bottle">
              Register interest
            </button>
          </Card>

          {error && <div className="text-sm text-warn font-semibold">{error}</div>}

          <div className="bg-cream/70 border border-saffron/60 rounded p-3 text-[12px] text-bottle-dark leading-relaxed">
            <strong>Demo payment:</strong> use card 4242 4242 4242 4242 and OTP 123456 at checkout.
          </div>
          <PrimaryButton onClick={pay} disabled={busy || !selectedPlan} className="py-4 text-base">
            {busy ? "Starting…" : `Start plan · ${selectedPlan ? money(selectedPlan.total_price) : ""}`}
          </PrimaryButton>
          <div className="text-center text-xs text-muted">Cancel anytime before the next cycle</div>
        </div>
      </div>
      {showPayment && selectedPlan && <MockPaymentModal amount={selectedPlan.total_price} onSuccess={start} onClose={() => setShowPayment(false)} />}
    </AppShell>
  );
}

function ModeCard({ title, price, text, active }) {
  return (
    <div className={`rounded border p-3 ${active ? "border-bottle bg-[#EEF4FF]" : "border-line bg-white"}`}>
      <div className="text-sm font-extrabold text-ink">{title}</div>
      <div className="mt-1 text-xs font-extrabold text-bottle">{price}</div>
      <div className="mt-2 text-xs leading-relaxed text-mutedwarm">{text}</div>
    </div>
  );
}

function PriceTier({ count, benefit, active }) {
  return (
    <div className={`flex justify-between rounded border px-3 py-2 ${active ? "border-bottle bg-[#EEF4FF]" : "border-line"}`}>
      <span className="font-extrabold text-ink">{count}+ meals</span>
      <span className="font-bold text-mutedwarm">{benefit}</span>
    </div>
  );
}
