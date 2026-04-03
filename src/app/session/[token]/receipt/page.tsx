"use client";

import { use } from "react";
import useSWR from "swr";
import type { Item, Session } from "@/lib/types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ReceiptPDF = dynamic(() => import("@/components/ReceiptPDF"), {
  ssr: false,
  loading: () => null,
});

export default function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const { data: session } = useSWR<Session>(`/api/sessions/${token}`, fetcher, {
    revalidateOnFocus: false,
  });
  const { data: allItems } = useSWR<Item[]>(`/api/sessions/${token}/items`, fetcher, {
    revalidateOnFocus: false,
  });

  const collectedItems = allItems?.filter((i) => i.state === "collected") ?? [];
  const total = collectedItems.reduce((s, i) => s + (i.price ?? 0), 0);

  // Group by contributor
  const contributionMap: Record<string, number> = {};
  for (const item of collectedItems) {
    const who = item.collected_by ?? "Unknown";
    contributionMap[who] = (contributionMap[who] ?? 0) + 1;
  }

  const sessionDate = session?.created_at
    ? new Date(session.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main
      className="min-h-dvh"
      style={{ background: "var(--background)" }}
    >
      {/* Print button */}
      <div className="p-4 flex gap-3">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 print:hidden"
          style={{ background: "var(--brand)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print Receipt
        </button>
        <button
          onClick={() => router.push("/session/" + token)}
          className="px-4 py-2 rounded-xl text-sm font-semibold print:hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        >
          Back to list
        </button>
      </div>

      {/* Receipt card */}
      <div
        className="mx-4 mb-8 rounded-2xl p-6"
        style={{ background: "var(--card)" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl font-black tracking-widest uppercase"
            style={{ color: "var(--brand)" }}
          >
            The Shopping List
          </h1>
          <p className="text-xs mt-2 uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Session ID: {token.slice(0, 16).toUpperCase()}
          </p>
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Date: {sessionDate}
          </p>
        </div>

        <div className="border-t border-b py-3 mb-4" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs text-center uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Shopper Contributions
          </p>
          {Object.entries(contributionMap).map(([name, count]) => (
            <div
              key={name}
              className="flex items-center justify-between text-sm py-1"
              style={{ color: "var(--foreground)" }}
            >
              <span>{name}</span>
              <span
                className="border-b flex-1 mx-2"
                style={{ borderColor: "var(--border)", borderStyle: "dotted" }}
              />
              <span>{count} items</span>
            </div>
          ))}
        </div>

        {/* Item rows */}
        <div className="mb-4">
          <div
            className="grid grid-cols-[auto_1fr_auto] gap-x-3 text-xs uppercase tracking-widest pb-2 mb-2"
            style={{
              color: "var(--muted)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span>Qty</span>
            <span>Description</span>
            <span className="text-right">Price</span>
          </div>
          {collectedItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto] gap-x-3 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span
                className="text-sm font-semibold w-8"
                style={{ color: "var(--muted)" }}
              >
                {item.quantity}
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {item.name}
              </span>
              <span className="text-sm font-semibold text-right" style={{ color: "var(--foreground)" }}>
                {item.price != null ? `$${item.price}` : "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div
          className="flex items-center justify-between py-3 mb-6"
          style={{ borderTop: "2px dashed var(--border)" }}
        >
          <span className="text-base font-black uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
            Total Amount
          </span>
          <span className="text-2xl font-black" style={{ color: "var(--brand)" }}>
            ${total}
          </span>
        </div>

        <p className="text-xs text-center font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--foreground)" }}>
          Thank you for shopping!
        </p>
        <p className="text-xs text-center mb-4" style={{ color: "var(--muted)" }}>
          Session ID: {token.slice(0, 16).toUpperCase()}
        </p>
      </div>

      {/* PDF download (client only) */}
      <div className="px-4 mb-10 print:hidden">
        <ReceiptPDF
          session={session ?? { id: token, title: "", created_at: "", last_active: "" }}
          items={collectedItems}
        />
      </div>
    </main>
  );
}
