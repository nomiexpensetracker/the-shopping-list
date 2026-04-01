import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateSessionId } from "@/lib/session";
import { isValidSessionTitle } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const rawTitle =
    body && typeof body === "object" && "title" in body ? (body as Record<string, unknown>).title : "";

  if (!isValidSessionTitle(rawTitle)) {
    return NextResponse.json({ error: "Invalid session title" }, { status: 400 });
  }

  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const id = generateSessionId();

  await sql`
    INSERT INTO sessions (id, title) VALUES (${id}, ${title})
  `;

  return NextResponse.json({ id, title }, { status: 201 });
}
