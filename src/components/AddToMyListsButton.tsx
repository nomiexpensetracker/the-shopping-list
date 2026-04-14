"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StarterPackVariantWithItems } from "@/types/dto";
import { addToListsRegistry } from "@/lib/lists";
import { CloseIcon } from "@/components/icons";

interface Props {
  variants: StarterPackVariantWithItems[];
  packTitle: string;
}

type Step = "idle" | "picking" | "loading" | "error";

export default function AddToMyListsButton({ variants, packTitle }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [error, setError] = useState("");

  async function doImport(variantId: string) {
    setStep("loading");
    setError("");

    try {
      // Create the list
      const createRes = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: packTitle }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error ?? "Failed to create list.");
      }
      const listId: string = createData.data.id;

      // Bulk import variant items
      const importRes = await fetch(`/api/lists/${listId}/import-variant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId }),
      });
      const importData = await importRes.json();
      if (!importRes.ok || !importData.success) {
        throw new Error(importData.error ?? "Failed to import items.");
      }

      addToListsRegistry({ id: listId, name: packTitle, last_active: new Date().toISOString() });
      router.push(`/app/list/${listId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  function handleClick() {
    if (variants.length > 1) {
      setStep("picking");
    } else {
      doImport(variants[0]?.id ?? "");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleClick}
          disabled={step === "loading"}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold text-base px-8 py-3.5 rounded-xl transition-colors disabled:opacity-50"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        >
          {step === "loading" ? (
            <>
              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Adding…
            </>
          ) : (
            "Add to My Lists"
          )}
        </button>
        {step === "error" && (
          <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
        )}
      </div>

      {step === "picking" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-to-list-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setStep("idle"); }}
        >
          <div
            className="relative w-full rounded-t-3xl px-6 pt-4 pb-10 flex flex-col gap-5"
            style={{ background: "var(--card)" }}
          >
            <div
              className="mx-auto w-10 h-1 rounded-full mb-2"
              style={{ background: "var(--border)" }}
            />

            <h2
              id="add-to-list-modal-title"
              className="text-2xl text-left font-bold"
              style={{ color: "var(--foreground)" }}
            >
              Add to My Lists
            </h2>

            <div>
              <label
                htmlFor="add-variant-select"
                className="text-xs text-left font-semibold uppercase tracking-widest mb-2 block"
                style={{ color: "var(--muted)" }}
              >
                Choose Variant
              </label>
              <div className="relative">
                <select
                  id="add-variant-select"
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-xl text-base focus:outline-none"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.items.length} items)
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 shrink-0"
                  style={{ color: "var(--muted)" }}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("idle")}
                aria-label="Close"
                className="size-14 rounded-xl font-semibold text-base transition flex items-center justify-center"
                style={{ background: "var(--background)", color: "var(--foreground)" }}
              >
                <CloseIcon fill="var(--foreground)" />
              </button>
              <button
                type="button"
                onClick={() => doImport(selectedVariantId)}
                className="w-full h-14 flex items-center justify-center rounded-xl font-semibold text-lg transition gap-2"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Add to My Lists
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
