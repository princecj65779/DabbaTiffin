import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Card, Notice, PrimaryButton, TextInput } from "../components/ui";

export default function DeliveryPoint() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.deliveryPoints().then((data) => {
      setPoints(data);
      const featured = data.find((p) => p.featured) || data[0];
      setSelected(featured?.id || null);
    });
  }, []);

  const filtered = points.filter((p) =>
    `${p.name} ${p.area}`.toLowerCase().includes(query.toLowerCase())
  );

  const confirm = async () => {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const user = await api.updateMe({ delivery_point_id: selected });
      updateUser(user);
      navigate("/flipkart");
    } catch (err) {
      setError(err.message || "Could not set delivery point");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-bottle-dark text-white px-5 pt-5 pb-5 md:px-10">
        <div className="max-w-5xl mx-auto">
        <div className="text-[11px] font-extrabold tracking-wide text-saffron uppercase">Serviceability check</div>
        <div className="mt-1 text-xl md:text-3xl font-extrabold">Where do you need daily meals?</div>
        <div className="text-sm opacity-90 mt-1">Flipkart Bites opens fixed batch points before it opens a full area.</div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search hostel, PG, campus, office or pincode"
          className="mt-4 w-full bg-white rounded px-3 py-3 text-sm text-ink focus:outline-none"
        />
        </div>
      </div>

      <div className="bg-white border-b border-line">
        <div className="max-w-5xl mx-auto px-5 py-4 grid md:grid-cols-3 gap-3">
          <ServicePill title="15 meals unlock route" text="PG, hostel and office batches become viable at route density." />
          <ServicePill title="Fixed handoff point" text="No GPS chase. Meals arrive at one verified gate, desk or counter." />
          <ServicePill title="Predictable slots" text="Breakfast and lunch windows are shown before you subscribe." />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-5 grid md:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="flex flex-col gap-3">
        <div className="text-[11px] font-extrabold text-muted tracking-wide">NEAR YOU</div>

        {filtered.map((point) => {
          const isSelected = selected === point.id;
          return (
            <button
              key={point.id}
              type="button"
              onClick={() => setSelected(point.id)}
              className={`text-left bg-white rounded-xl2 p-3.5 flex gap-3 items-start shadow-card ${
                isSelected ? "border-2 border-bottle" : "border border-line"
              }`}
            >
              <div
                className={`w-[18px] h-[18px] rounded-full flex-none mt-0.5 ${
                  isSelected ? "border-[5px] border-bottle" : "border-2 border-line"
                }`}
              />
              <div className="flex-1">
                <div className="text-[15px] font-extrabold text-ink">{point.name}</div>
                <div className="text-xs text-muted mt-0.5">
                  {point.area} · {point.distance_label} · {point.handover_type}
                </div>
                <div className="flex gap-2 mt-2.5 flex-wrap">
                  {point.breakfast_available && (
                    <span className="bg-[#E7EFEA] text-bottle text-[11px] font-extrabold px-2.5 py-1.5 rounded">
                      Breakfast {point.breakfast_window}
                    </span>
                  )}
                  {point.lunch_available && (
                    <span className="bg-[#E7EFEA] text-bottle text-[11px] font-extrabold px-2.5 py-1.5 rounded">
                      Lunch {point.lunch_window}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        <Notice>
          Not listed? Ask your PG or office admin to add a point. We open one at 15 confirmed orders.
        </Notice>

        {error && <div className="text-sm text-warn font-semibold">{error}</div>}

        <PrimaryButton onClick={confirm} disabled={busy || !selected} className="mt-2">
          {busy ? "Saving…" : "Set as my point"}
        </PrimaryButton>
        </div>

        <div className="flex flex-col gap-3">
        <Card className="p-4 border border-line">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-ink">Bites score</div>
              <div className="text-xs text-muted mt-0.5">Sunrise PG, Block C</div>
            </div>
            <div className="text-xl font-extrabold text-bottle">18/25</div>
          </div>
          <div className="mt-3 h-2 bg-surface rounded-full overflow-hidden">
            <div className="h-full w-[72%] bg-bottle rounded-full" />
          </div>
          <div className="mt-2 text-xs leading-relaxed text-mutedwarm">
            Route is live. Next price unlock at 25 daily meals.
          </div>
        </Card>

        <Card className="p-4 border border-line">
          <div className="text-sm font-extrabold text-ink">Route-density rewards</div>
          <div className="mt-3 grid gap-2">
            <RewardRow label="15 meals" value="Service unlocks" active />
            <RewardRow label="25 meals" value="₹5 off per meal" />
            <RewardRow label="50 meals" value="Free add-on twice a week" />
          </div>
        </Card>

        <Card className="p-4 border border-line">
          <div className="text-sm font-extrabold text-ink">Referral unlock</div>
          <div className="mt-2 text-xs leading-relaxed text-mutedwarm">
            Invite 3 residents from this point to move the batch closer to the next discount tier.
          </div>
          <button className="mt-3 w-full rounded bg-saffron px-3 py-2 text-xs font-extrabold text-ink">
            Copy invite link
          </button>
        </Card>

        <Card className="p-4 border border-line">
          <div className="text-sm font-extrabold text-ink">Launch queue</div>
          <div className="mt-2 text-xs leading-relaxed text-mutedwarm">
            If your location is not live, Flipkart can collect interest from residents and activate the route once a
            minimum daily volume is reached.
          </div>
          <div className="mt-4 grid gap-2 text-xs">
            <QueueRow label="Hinjewadi Phase 1" value="82%" />
            <QueueRow label="Kothrud hostels" value="64%" />
            <QueueRow label="Baner offices" value="41%" />
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}

function ServicePill({ title, text }) {
  return (
    <div className="bg-surface rounded p-3">
      <div className="text-sm font-extrabold text-ink">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-mutedwarm">{text}</div>
    </div>
  );
}

function QueueRow({ label, value }) {
  return (
    <div>
      <div className="flex justify-between font-bold text-ink">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1 h-1.5 bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-bottle rounded-full" style={{ width: value }} />
      </div>
    </div>
  );
}

function RewardRow({ label, value, active }) {
  return (
    <div className={`rounded border px-3 py-2 text-xs ${active ? "border-good bg-[#E9F7EE]" : "border-line bg-white"}`}>
      <div className="flex justify-between gap-3">
        <span className="font-extrabold text-ink">{label}</span>
        <span className={active ? "font-extrabold text-good" : "font-bold text-mutedwarm"}>{value}</span>
      </div>
    </div>
  );
}
