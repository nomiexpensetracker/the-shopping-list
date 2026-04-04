"use client";

import useSWR from "swr";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";

import QRCode from "@/components/QRCode";
import { CommonResponse } from "@/types/dto";
import type { Receipt, Session } from "@/types/dao";
import { formatLocaleData, formatRupiah } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ReceiptPDF = dynamic(() => import("@/components/ReceiptPDF"), {
  ssr: false,
  loading: () => null,
});

export default function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: receipt } = useSWR<CommonResponse<Receipt>>(`/api/sessions/${token}/receipt`, fetcher, {
    revalidateOnFocus: false,
  });

  const session: Session = useMemo(() => {
    return {
      id: receipt?.data.session_id || '',
      title: receipt?.data.session_name || '',
      created_at: receipt?.data.session_date || '',
      last_active: receipt?.data.session_date || '',
    }
  }, [receipt])

  const handleEndSession = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sessions/${token}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json() as CommonResponse<undefined>;
      // simply redirect to root page upon succesfull deletion
      if (data.success) {
        router.replace('/');
      }
    } catch (error) {
      setError(`Oops something went wrong. Please try again. ${error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-dvh p-6 flex flex-col gap-6"
      style={{ background: "var(--background)" }}
    >
      {/* Receipt card */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--card)" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl font-black tracking-widest uppercase"
            style={{ color: "var(--brand)" }}
          >
            {receipt?.data.session_name || "The Shopping List"}
          </h1>
          <p className="text-xs mt-2 uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Session ID: {token.slice(0, 16).toUpperCase()}
          </p>
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Date: {receipt?.data.session_date ? formatLocaleData(receipt.data.session_date) : ""}
          </p>
        </div>

        <div className="border-t border-b py-3 mb-4" style={{ borderColor: "var(--border)" }}>
          <p className="font-extrabold text-xs text-center uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Shopper Contributions
          </p>
          {(receipt?.data.participants || []).map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center justify-between text-sm py-1"
              style={{ color: "var(--foreground)" }}
            >
              <span>{participant.name}</span>
              <span
                className="border-b flex-1 mx-2"
                style={{ borderBottom: index !== (receipt?.data.participants.length || 0) - 1 ? "1px solid var(--border)" : "none" }}
              />
              <span>{participant.items_count} items</span>
            </div>
          ))}
        </div>

        {/* Item rows */}
        <div className="mb-4">
          <div
            className="grid grid-cols-[auto_1fr_auto] gap-x-3 text-xs font-extrabold uppercase tracking-widest pb-2 mb-2"
            style={{
              color: "var(--muted)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span>Qty</span>
            <span>Description</span>
            <span className="text-right">Price</span>
          </div>
          {(receipt?.data.items || []).sort((a, b) => a.name.localeCompare(b.name)).map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto] gap-x-3 py-3"
              style={{ borderBottom: index !== (receipt?.data.items.length || 0) - 1 ? "1px solid var(--border)" : "none" }}
            >
              <span
                className="text-sm font-semibold w-8"
                style={{ color: "var(--muted)" }}
              >
                {item.quantity}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {item.name}
                </span>
                <span className="text-sm" style={{ color: "var(--foreground)" }}>
                  {item.description}
                </span>
              </div>
              <span className="text-sm font-semibold text-right" style={{ color: "var(--foreground)" }}>
                {item.price != null ? `${formatRupiah(item.price)}` : "—"}
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
            {receipt?.data.total_price ? `${formatRupiah(parseInt(receipt.data.total_price))}` : "—"}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          <p className="text-xs text-center font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--foreground)" }}>
            Thank you for shopping!
          </p>

          <div
            className="p-4 rounded-2xl w-fit mx-auto mt-4"
            style={{ background: "var(--brand-light)" }}
          >
            <QRCode value={process.env.APP_URL || 'https://the-shopping-list-eight.vercel.app'} size={180} />
          </div>
          <p className="text-xs text-center mb-4" style={{ color: "var(--muted)" }}>
            Session ID: {token.slice(0, 16).toUpperCase()}
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-red-500 text-sm">{error}</p>
      )}

      <div className="flex gap-2">
        <div className="size-14">
          <ReceiptPDF
            session={session ?? { id: token, title: "", created_at: "", last_active: "" }}
            items={receipt?.data.items || []}
          />
        </div>
        <button
          onClick={handleEndSession}
          disabled={loading}
          className="flex-1 h-14 flex items-center justify-center rounded-xl text-white font-semibold text-lg transition disabled:opacity-50"
          style={{ background: "var(--brand)" }}
        >
          End Session
        </button>
      </div>
    </main>
  );
}
