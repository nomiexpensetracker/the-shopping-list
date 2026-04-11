"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileGate from "@/components/MobileGate";
import { CommonResponse, PostSessionResponse } from "@/types/dto";
import { TemplateResponse } from "@/app/api/templates/[token]/route";

export default function TemplatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "redirecting" | "expired" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function bootstrap() {
      try {
        // 1. Validate template
        const templateRes = await fetch(`/api/templates/${token}`);
        const templateData = await templateRes.json() as CommonResponse<TemplateResponse> & { expired?: boolean };

        if (templateRes.status === 410 || templateData.expired) {
          setStatus("expired");
          return;
        }

        if (!templateRes.ok || !templateData.success) {
          setErrorMessage(templateData.error ?? "Template not found.");
          setStatus("error");
          return;
        }

        setStatus("redirecting");
        const template = templateData.data;

        // 2. Create a new session pre-filled with the template name
        const sessionRes = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: template.name, name: "Shopper" }),
        });

        const sessionData = await sessionRes.json() as CommonResponse<PostSessionResponse>;
        if (!sessionRes.ok || !sessionData.success) {
          setErrorMessage("Failed to start a session. Please try again.");
          setStatus("error");
          return;
        }

        const { id: sessionId, participant } = sessionData.data;

        // 3. Store participant in localStorage
        localStorage.setItem(`participant_${sessionId}_id`, participant.id);
        localStorage.setItem(`participant_${sessionId}_name`, participant.name);
        localStorage.setItem(`participant_${sessionId}_color`, participant.color);

        // 4. Pre-populate items from the template (fire in parallel)
        const itemRequests = (template.items ?? []).map((item) =>
          fetch(`/api/sessions/${sessionId}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: item.name,
              quantity: item.quantity,
              created_by: participant.id,
            }),
          })
        );
        await Promise.all(itemRequests);

        // 5. Redirect to session page with the update modal flag
        router.replace(`/app/session/${sessionId}?with-template=true`);
      } catch {
        setErrorMessage("Something went wrong. Please try again.");
        setStatus("error");
      }
    }

    bootstrap();
  }, [token, router]);

  return (
    <MobileGate>
      <main
        className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-4"
        style={{ background: "var(--background)" }}
      >
        {(status === "loading" || status === "redirecting") && (
          <>
            <span
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}
              aria-hidden="true"
            />
            <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              {status === "redirecting" ? "Setting up your list…" : "Loading…"}
            </p>
          </>
        )}

        {status === "expired" && (
          <>
            <p className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
              QR Code Expired
            </p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              This QR code is no longer valid. QR codes from receipts expire after 30 days.
            </p>
            <button
              onClick={() => router.replace("/app")}
              className="mt-4 px-6 py-3 rounded-xl text-white font-semibold"
              style={{ background: "var(--brand)" }}
            >
              Start a new list
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
              Something went wrong
            </p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {errorMessage}
            </p>
            <button
              onClick={() => router.replace("/app")}
              className="mt-4 px-6 py-3 rounded-xl text-white font-semibold"
              style={{ background: "var(--brand)" }}
            >
              Go home
            </button>
          </>
        )}
      </main>
    </MobileGate>
  );
}
