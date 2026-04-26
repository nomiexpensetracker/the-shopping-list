"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToListsRegistry } from "@/lib/lists";

interface Props {
  quickListId: string;
  packTitle: string;
  servings?: number;
}

type Step = "idle" | "loading" | "error";

export default function AddToMyListsButton({ quickListId, packTitle, servings = 1 }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");

  async function doImport() {
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

      // Bulk import quick list items
      const importRes = await fetch(`/api/lists/${listId}/import-quick-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quick_list_id: quickListId, servings }),
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
    doImport();
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
    </>
  );
}
