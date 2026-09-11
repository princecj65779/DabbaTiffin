import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import AppShell from "../components/AppShell";
import { Card, OutlineButton, Toggle } from "../components/ui";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [home, setHome] = useState(null);
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    api.home().then(setHome).catch(() => setHome(null));
  }, []);

  const toggleVeg = async () => {
    const updated = await api.updateMe({ veg_only: !user.veg_only });
    updateUser(updated);
  };

  const toggleReminder = async () => {
    const updated = await api.updateMe({ menu_reminder: !user.menu_reminder });
    updateUser(updated);
  };

  const signOut = () => {
    logout();
    navigate("/login");
  };

  const profileActions = [
    {
      label: "Payment methods",
      description: `Wallet balance ${formatMoney(user.wallet_balance)}. Card checkout is enabled for new bookings.`,
      action: () => setPanel("payments"),
    },
    {
      label: "My plan and billing",
      description: home?.subscription ? `${home.subscription.plan.name} renews ${home.subscription.renews_on}.` : "No active plan yet.",
      action: () => navigate("/plans"),
    },
    {
      label: "Kitchen and hygiene reports",
      description: home ? `${home.delivering_to} has live sealed-handoff tracking on booked orders.` : "Reports load from your active point.",
      action: () => setPanel("hygiene"),
    },
    {
      label: "Help and support",
      description: "Raise delivery, meal quality or refund issues from one place.",
      action: () => setPanel("support"),
    },
  ];

  if (!user) return null;

  return (
    <AppShell>
      <div className="bg-bottle text-white px-5 py-5 md:px-10 md:py-8 flex gap-3.5 items-center">
        <div className="w-[52px] h-[52px] rounded-full bg-saffron text-ink flex items-center justify-center text-xl font-extrabold flex-none">
          {user.full_name[0]?.toUpperCase()}
        </div>
        <div>
          <div className="text-lg font-extrabold">{user.full_name}</div>
          <div className="text-xs opacity-90 mt-0.5">{user.email}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 grid md:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-3">
        <Card className="overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#F0ECE7]">
            <div className="text-[11px] font-extrabold text-muted tracking-wide">DELIVERY POINT</div>
            <div className="text-sm font-extrabold mt-1">
              {user.delivery_point?.name} · {user.delivery_point?.handover_type}
            </div>
          </div>
          <button
            onClick={() => navigate("/delivery-point")}
            className="w-full px-4 py-3.5 border-b border-[#F0ECE7] flex justify-between items-center text-left"
          >
            <div className="text-sm font-bold">Change delivery point</div>
            <span className="text-line">›</span>
          </button>
          <div className="px-4 py-3.5 border-b border-[#F0ECE7] flex justify-between items-center">
            <div>
              <div className="text-sm font-extrabold">Veg only</div>
              <div className="text-xs text-muted mt-0.5">Egg and chicken in a later phase</div>
            </div>
            <Toggle checked={user.veg_only} onChange={toggleVeg} />
          </div>
          <div className="px-4 py-3.5 flex justify-between items-center">
            <div>
              <div className="text-sm font-extrabold">Menu reminder</div>
              <div className="text-xs text-muted mt-0.5">Nudge at 19:00 when the menu opens</div>
            </div>
            <Toggle checked={user.menu_reminder} onChange={toggleReminder} />
          </div>
        </Card>

        <Card className="overflow-hidden">
          {profileActions.map((item, i, arr) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 ${
                  i < arr.length - 1 ? "border-b border-[#F0ECE7]" : ""
                }`}
              >
                <span>
                  <span className="block text-sm font-bold text-ink">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-mutedwarm">{item.description}</span>
                </span>
                <span className="text-line">›</span>
              </button>
          ))}
        </Card>

        <OutlineButton onClick={signOut} className="border-line text-muted">
          Log out
        </OutlineButton>
        {panel && (
          <Card className="p-4 border border-bottle bg-[#EEF4FF]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold text-ink">{panelContent(panel, home, user).title}</div>
                <div className="mt-2 text-xs leading-relaxed text-mutedwarm">{panelContent(panel, home, user).body}</div>
              </div>
              <button onClick={() => setPanel(null)} className="text-xs font-extrabold text-bottle">
                Close
              </button>
            </div>
          </Card>
        )}
        </div>

        <div className="flex flex-col gap-3">
          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">Smart meal defaults</div>
            <div className="mt-3 grid gap-3">
              <Preference title="Auto-pick if I forget" value="Most popular veg dish" />
              <Preference title="Repeat control" value="Avoid same main twice in 3 days" />
              <Preference title="Spice profile" value="Medium spice" />
              <Preference title="Diet flag" value={user.veg_only ? "Veg only active" : "Open to all"} />
            </div>
          </Card>

          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">Trust and safety</div>
            <div className="mt-2 text-xs leading-relaxed text-mutedwarm">
              Add kitchen verification, preparation timestamp, packaging seal and handoff photo here for the full
              Flipkart-grade trust layer.
            </div>
          </Card>

          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">Family and roommate plans</div>
            <div className="mt-3 grid gap-2 text-xs leading-relaxed text-mutedwarm">
              <div><strong className="text-ink">Parent pays:</strong> student receives meals at the saved point.</div>
              <div><strong className="text-ink">Roommate split:</strong> share one delivery point with separate preferences.</div>
              <div><strong className="text-ink">Shared wallet:</strong> credits can apply to the next household meal.</div>
            </div>
          </Card>

          <Card className="p-4 border border-line">
            <div className="text-sm font-extrabold text-ink">Campus / office admin</div>
            <div className="mt-3 grid gap-2 text-xs leading-relaxed text-mutedwarm">
              <div>
                <strong className="text-ink">Confirmed meals:</strong>{" "}
                {home ? `${home.route_confirmed_meals} for ${home.tomorrow_date}` : "refresh from your delivery point."}
              </div>
              <div><strong className="text-ink">Roster:</strong> export by floor, team or hostel block.</div>
              <div><strong className="text-ink">Billing:</strong> monthly invoice or partial HR subsidy.</div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function panelContent(panel, home, user) {
  if (panel === "payments") {
    return {
      title: "Payment methods",
      body: `Bites wallet has ${formatMoney(user.wallet_balance)} available. Card payments open a demo checkout before confirming meals.`,
    };
  }
  if (panel === "hygiene") {
    return {
      title: "Kitchen and hygiene reports",
      body: home
        ? `Current point: ${home.delivering_to}. Booked meals show kitchen name, packed time, batch code and inspection status on the tracking screen.`
        : "Kitchen reports appear after your delivery point and booked meals load.",
    };
  }
  return {
    title: "Help and support",
    body: "Use tracking to report wrong meal, late handoff, broken seal or quality issues. The app can attach the order and batch code automatically.",
  };
}

function Preference({ title, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2 last:border-b-0 last:pb-0">
      <div className="text-xs font-bold text-mutedwarm">{title}</div>
      <div className="text-xs font-extrabold text-ink text-right">{value}</div>
    </div>
  );
}
