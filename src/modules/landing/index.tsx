import Link from "next/link";

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-55">
      {/* Phone shell */}
      <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-gray-800">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-10" />
        {/* Screen */}
        <div className="bg-white rounded-[1.8rem] overflow-hidden pt-6 pb-4 px-4 min-h-55 flex flex-col gap-2">
          <div className="flex items-center gap-2 py-1.5 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-xs font-medium text-gray-800">Milk</span>
          </div>
          <div className="flex items-center gap-2 py-1.5 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-xs font-medium text-gray-800">Eggs</span>
          </div>
          <div className="flex items-center gap-2 py-1.5 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-xs font-medium text-gray-800">Bread</span>
          </div>
          <div className="flex items-center gap-2 py-1.5 rounded-lg">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
            <span className="text-xs font-medium text-gray-500">Chocolate</span>
          </div>
          {/* Budget bar */}
          <div className="mt-auto bg-green-600 rounded-xl py-2 px-3 text-center">
            <span className="text-white text-xs font-bold">Total: $42.50</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Session",
    desc: "Tap the button to create a temporary session unique to your device's browser.",
  },
  {
    step: "02",
    title: "Share Link",
    desc: "Share the link at the speed of thought. Use the share button to invite others instantly.",
  },
  {
    step: "03",
    title: "Split Up & Shop",
    desc: "Add items at the speed of thought. Use sharing to invite others instantly.",
  },
  {
    step: "04",
    title: "Track Total",
    desc: "Save the ones you want to your total. Analytic view of your device.",
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: "Anonymous Access",
    desc: "No sign-up required. Jump in and start shopping with anonymous access.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
      </svg>
    ),
    title: "Real-time Sync",
    desc: "Real-time collaboration and editing and budget tracking.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: "Digital Receipt",
    desc: "Save and secure digital receipts for every shopping session.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    title: "Mobile-First",
    desc: "Designed for your phone's mobile-first experience.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--background)" }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-16 pb-10 gap-6">
        <div>
          <h1
            className="text-5xl font-black leading-tight tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            The Shopping
          </h1>
          <h1
            className="text-5xl font-black leading-tight tracking-tight italic"
            style={{ color: "var(--brand)" }}
          >
            List.
          </h1>
        </div>

        <div>
          <h2
            className="text-2xl font-extrabold leading-snug"
            style={{ color: "var(--foreground)" }}
          >
            Group shopping
            <br />
            without the chaos
          </h2>
          <p className="mt-2 text-sm max-w-xs mx-auto" style={{ color: "var(--muted)" }}>
            No login required. Real-time collaboration and budget tracking.
          </p>
        </div>

        <Link
          href="/app"
          className="w-full max-w-xs rounded-2xl py-4 text-base font-bold text-white text-center transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: "var(--brand)" }}
        >
          Start a Session
        </Link>

        <a
          href="#how-it-works"
          className="text-sm font-medium underline underline-offset-2"
          style={{ color: "var(--foreground)" }}
        >
          See How It Works
        </a>

        <div className="w-full max-w-sm mt-2">
          <PhoneMockup />
        </div>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="w-full max-w-sm pt-8">
          <h2
            className="text-3xl font-black mb-2"
            style={{ color: "var(--foreground)" }}
          >
            How it works
          </h2>
          <div
            className="mx-auto mb-8 w-10 h-1 rounded-full"
            style={{ background: "var(--brand)" }}
          />

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-left">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step}>
                <p
                  className="text-4xl font-black leading-none mb-1"
                  style={{ color: "var(--border)" }}
                >
                  {step}
                </p>
                <p
                  className="text-sm font-bold mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {title}
                </p>
                <p className="text-xs leading-snug" style={{ color: "var(--muted)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature cards ─────────────────────────────────────────────── */}
        <section className="w-full max-w-sm grid grid-cols-2 gap-4 mt-4">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <span style={{ color: "var(--brand)" }}>{icon}</span>
              <p
                className="text-sm font-bold leading-snug"
                style={{ color: "var(--foreground)" }}
              >
                {title}
              </p>
              <p className="text-xs leading-snug" style={{ color: "var(--muted)" }}>
                {desc}
              </p>
            </div>
          ))}
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────────────── */}
        <Link
          href="/app"
          className="w-full max-w-xs rounded-2xl py-4 text-base font-bold text-white text-center mt-4 transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: "var(--brand)" }}
        >
          Start a Session
        </Link>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-6 flex justify-center gap-6">
        {["Privacy", "Security", "Cookies", "Terms"].map((item) => (
          <span
            key={item}
            className="text-xs"
            style={{ color: "var(--muted)" }}
          >
            {item}
          </span>
        ))}
      </footer>
    </div>
  );
}
