"use client";

import { useState } from "react";
import type { Item, Session } from "@/lib/types";

interface Props {
  session: Session;
  items: Item[];
}

export default function ReceiptPDF({ session, items }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      // Dynamically import @react-pdf/renderer to keep it client-only
      const { pdf, Document, Page, Text, View, StyleSheet } =
        await import("@react-pdf/renderer");

      const total = items.reduce((s, i) => s + (i.price ?? 0), 0);
      const dateStr = session.created_at
        ? new Date(session.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString();

      const styles = StyleSheet.create({
        page: { padding: 40, fontFamily: "Helvetica" },
        title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#1a6641", textAlign: "center", marginBottom: 4 },
        subtitle: { fontSize: 9, color: "#6b7280", textAlign: "center", marginBottom: 2 },
        divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 12 },
        sectionHeader: { fontSize: 8, color: "#6b7280", textAlign: "center", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
        row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
        label: { fontSize: 10, color: "#111827" },
        value: { fontSize: 10, color: "#111827" },
        itemRow: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
        itemQty: { width: 30, fontSize: 10, color: "#6b7280" },
        itemName: { flex: 1, fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" },
        itemPrice: { width: 60, fontSize: 10, color: "#111827", textAlign: "right" },
        totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
        totalLabel: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#111827" },
        totalAmount: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#1a6641" },
        thanks: { fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center", marginTop: 24 },
        footer: { fontSize: 8, color: "#6b7280", textAlign: "center", marginTop: 4 },
      });

      // Build contributor map
      const contributionMap: Record<string, number> = {};
      for (const item of items) {
        const who = item.collected_by ?? "Unknown";
        contributionMap[who] = (contributionMap[who] ?? 0) + 1;
      }

      const doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.title}>THE SHOPPING LIST</Text>
            <Text style={styles.subtitle}>SESSION ID: {session.id.toUpperCase()}</Text>
            <Text style={styles.subtitle}>DATE: {dateStr.toUpperCase()}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>Shopper Contributions</Text>
            {Object.entries(contributionMap).map(([name, count]) => (
              <View key={name} style={styles.row}>
                <Text style={styles.label}>{name}</Text>
                <Text style={styles.value}>{count} items</Text>
              </View>
            ))}

            <View style={styles.divider} />

            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  {item.price != null ? "$" + item.price : "—"}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalAmount}>${total}</Text>
            </View>

            <Text style={styles.thanks}>THANK YOU FOR SHOPPING!</Text>
            <Text style={styles.footer}>Digital Auth: {session.id.toUpperCase()}</Text>
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shopping-receipt.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition disabled:opacity-60"
      style={{ background: "var(--brand)" }}
    >
      {loading ? (
        "Generating PDF\u2026"
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF Receipt
        </>
      )}
    </button>
  );
}
