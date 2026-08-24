"use client";

import Link from "next/link";
import { use, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { domToPng } from 'modern-screenshot';

import QRCode from "@/components/QRCode";
import ItemCard from "@/components/ItemCard";
import { CommonResponse } from "@/types/dto";
import type { Receipt } from "@/types/dao";
import { useCurrency } from "@/components/CurrencyProvider";

export default function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const searchParams = useSearchParams();
  const qrValue = searchParams.get("qr");

  const { formatAmount } = useCurrency();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [receipt, setReceipt] = useState<CommonResponse<Receipt> | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(`receipt_${token}`);
    if (cached) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReceipt(JSON.parse(cached));
      } catch {
        console.error("Failed to parse receipt from local storage");
      }
    }
  }, [token]);

  const collectedItems = (receipt?.data?.items || []).map(item => ({
    ...item,
    state: "collected" as const
  }));
  const sessionName = receipt?.data?.session_name || "The Shopping List";
  const filename = `digital-receipt-${sessionName.toLowerCase().replaceAll(" ", "-")}-${token.slice(0, 16)}.png`;

  const handleTakeSnapshot = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await domToPng(receiptRef.current, {
        scale: 2,
        backgroundColor: "var(--background)",
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to take snapshot', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main
      className="min-h-dvh flex flex-col relative px-4 py-6 gap-6 pb-20"
      style={{
        background: "var(--background)",
      }}
    >
      <div ref={receiptRef} className="flex flex-col gap-6 p-4 -m-4" style={{ background: "var(--background)" }}>
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
          <div className="w-full">
            <div
              className="w-full rounded-2xl p-4"
              style={{ background: "var(--collected-bg)" }}
            >
              <p className="text-sm uppercase font-bold tracking-widest mb-2" style={{ color: "var(--muted)" }}>
                Colected - <span style={{ color: "var(--collected-text)" }}>{collectedItems.length}</span>
              </p>
              <div>
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
          />
        ) : (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: "var(--muted)" }}>No items collected.</p>
          </div>
        )}

        {/* QR CODE Section inside snapshot */}
        {qrValue && (
          <div className="mt-2 p-6 rounded-3xl text-center" style={{ background: "var(--card)" }}>
            <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "var(--foreground)" }}>
              Scan for Next Shopping Session!
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
              Scan this QR code on your next shopping session to instantly pre-load all items from this session into a new list.
            </p>

            <div
              className="p-4 rounded-2xl inline-block"
              style={{ background: "var(--brand-light)" }}
            >
              <QRCode value={qrValue} size={180} />
            </div>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS (Outside snapshot) */}
      <div className="flex flex-col w-full gap-2 mt-4">
        <button
          onClick={handleTakeSnapshot}
          disabled={isExporting}
          className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center transition disabled:opacity-60"
          style={{ background: "var(--brand)" }}
        >
          {isExporting ? "Taking Snapshot…" : "Take a Snapshot"}
        </button>
        <Link
          href="/app"
          className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center transition active:opacity-70"
          style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
