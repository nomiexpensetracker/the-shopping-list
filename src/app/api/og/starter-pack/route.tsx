import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Starter Pack";
  const description = searchParams.get("description") ?? "Belanja lebih mudah dengan daftar belanja siap pakai";

  // Sanitise — never trust URL params in rendered output
  const safeTitle = title.slice(0, 80);
  const safeDescription = description.slice(0, 140);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(99, 202, 183, 0.15)",
            border: "1px solid rgba(99, 202, 183, 0.4)",
            borderRadius: "20px",
            padding: "8px 20px",
            marginBottom: "28px",
          }}
        >
          <span style={{ color: "#63cab7", fontSize: "18px", fontWeight: 600 }}>
            🛒 Starter Pack
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            color: "#ffffff",
            fontSize: safeTitle.length > 30 ? "56px" : "72px",
            fontWeight: 800,
            lineHeight: 1.1,
            margin: "0 0 24px 0",
            maxWidth: "900px",
          }}
        >
          {safeTitle}
        </h1>

        {/* Description */}
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "28px",
            fontWeight: 400,
            lineHeight: 1.5,
            margin: "0 0 48px 0",
            maxWidth: "860px",
          }}
        >
          {safeDescription}
        </p>

        {/* Footer branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              color: "#63cab7",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            the-shopping-list.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
