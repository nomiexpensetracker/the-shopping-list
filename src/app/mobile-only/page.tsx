import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile only — The Shopping List",
};

export default function MobileOnlyPage() {
  return (
    <main
      style={{ background: "var(--background)" }}
      className="min-h-dvh flex flex-col items-center justify-center px-8 text-center"
    >
      <div className="text-5xl mb-6">📱</div>
      <h1
        className="text-2xl font-black mb-3"
        style={{ color: "var(--foreground)" }}
      >
        Mobile only app
      </h1>
      <p className="text-base max-w-xs" style={{ color: "var(--muted)" }}>
        The Shopping List is designed for mobile browsers. Open this link on
        your phone to start or join a shopping session.
      </p>
    </main>
  );
}
