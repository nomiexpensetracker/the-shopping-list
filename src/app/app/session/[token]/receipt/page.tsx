"use client";

import useSWR from "swr";
import Link from "next/link";
import { use } from "react";
import { useSearchParams } from "next/navigation";

import QRCode from "@/components/QRCode";
import ItemCard from "@/components/ItemCard";
import { CommonResponse } from "@/types/dto";
import type { Receipt } from "@/types/dao";
import { useCurrency } from "@/components/CurrencyProvider";
import { useReceiptExport } from "@/lib/hooks";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const searchParams = useSearchParams();
  const qrValue = searchParams.get("qr");

  const { formatAmount } = useCurrency();

  const { data: receipt } = useSWR<CommonResponse<Receipt>>(`/api/sessions/${token}/receipt`, fetcher, {
    revalidateOnFocus: false,
  });

  const collectedItems = receipt?.data?.items || [];
  const sessionName = receipt?.data?.session_name || "The Shopping List";
  const filename = `digital-receipt-${sessionName.toLowerCase().replaceAll(" ", "-")}-${token.slice(0, 16)}.pdf`;
  const { receiptRef, exportToPDF, isExporting } = useReceiptExport(filename);

  // Total Items Listed: The requested behaviour is to only show the snapshot of the list with collected items.
  const totalItemsCount = collectedItems.length;

  return (
    <main
      className="min-h-dvh flex flex-col relative px-4 py-6 gap-6 pb-20"
      style={{
        background: "var(--background)",
      }}
    >
      <div ref={receiptRef} className="flex flex-col gap-6">
        <div className="text-center mb-2">
          <h1
            className="text-2xl font-black tracking-widest uppercase"
            style={{ color: "var(--brand)" }}
          >
            {receipt?.data?.session_name || "The Shopping List"}
          </h1>
          <p className="text-xs mt-2 uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Session ID: {token.slice(0, 16).toUpperCase()}
          </p>
        </div>

        {/* Stats bar */}
        {collectedItems.length > 0 && (
          <div className="w-full grid grid-cols-[30%_67%] justify-between">
            <div
              className="flex-1 rounded-2xl p-4 flex flex-col items-start justify-center"
              style={{ background: "var(--card)" }}
            >
              <p className="text-sm uppercase font-bold tracking-widest" style={{ color: "var(--muted)" }}>
                Total Items Listed
              </p>
              <p className="text-4xl uppercase font-extrabold tracking-widest" style={{ color: "var(--collected-text)" }}>
                {totalItemsCount}
              </p>
            </div>
            <div
              className="flex-1 rounded-2xl p-4 flex flex-col gap-2 items-start justify-center"
              style={{ background: "var(--collected-bg)" }}
            >
              <p className="text-sm uppercase font-bold tracking-widest" style={{ color: "var(--muted)" }}>
                Colected - <span style={{ color: "var(--collected-text)" }}>{collectedItems.length}</span>
              </p>
              <div className="flex flex-col items-start justify-center">
                <p className="text-sm uppercase font-bold tracking-widest" style={{ color: "var(--muted)" }}>
                  Total Price
                </p>
                <p className="text-2xl uppercase font-extrabold tracking-widest" style={{ color: "var(--collected-text)" }}>
                  {formatAmount(parseFloat(receipt?.data?.total_price || "0"))}
                </p>
              </div>
            </div>
          </div>
        )}

        {collectedItems.length > 0 ? (
          <ItemCard
            title="Collected"
            items={collectedItems}
            participants={receipt?.data?.participants || []}
            showHeader={false}
          // Intentionally leaving out onEditCollected so edit icon is not shown
          />
        ) : (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: "var(--muted)" }}>No items collected.</p>
          </div>
        )}
      </div>

      {/* QR CODE Section */}
      {qrValue && (
        <div className="mt-8 flex flex-col gap-2 p-6 rounded-3xl items-center" style={{ background: "var(--card)" }}>
          <p className="text-sm text-center font-bold uppercase tracking-widest mb-1" style={{ color: "var(--foreground)" }}>
            Scan for Next Trip!
          </p>
          <p className="text-xs text-center mb-2" style={{ color: "var(--muted)" }}>
            Scan this QR code on your next trip to instantly pre-load all items from this session into a new list.
          </p>

          <div
            className="p-4 rounded-2xl w-fit mx-auto mb-4"
            style={{ background: "var(--brand-light)" }}
          >
            <QRCode value={qrValue} size={180} />
          </div>

          <div className="flex flex-col w-full gap-2 mt-4">
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center transition disabled:opacity-60"
              style={{ background: "var(--brand)" }}
            >
              {isExporting ? "Downloading…" : "Download Receipt"}
            </button>
            <Link
              href="/app"
              className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center transition active:opacity-70"
              style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
