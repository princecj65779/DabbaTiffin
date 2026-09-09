import AppShell from "../components/AppShell";

export default function EmptyFlipkartTab({ title }) {
  return (
    <AppShell>
      <div className="bg-bottle text-white px-5 py-4 md:hidden">
        <div className="text-lg font-extrabold">{title}</div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-10 md:px-8 md:py-14">
        <div className="bg-white border border-line rounded-xl2 min-h-[360px] flex flex-col items-center justify-center text-center px-6">
          <div className="text-xs font-extrabold tracking-wide text-bottle uppercase">Flipkart tab</div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink">{title}</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-mutedwarm">
            This surface is intentionally empty for the concept demo. The active consumer journey lives inside
            Flipkart Bites.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
