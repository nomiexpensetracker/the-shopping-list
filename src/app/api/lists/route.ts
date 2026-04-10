import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { isValidListName } from "@/lib/validate";
import { generateListId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/lists — create a new personal shopping list
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const name =
    body && typeof body === "object" && "name" in body
      ? (body as Record<string, unknown>).name
      : "";

  if (!isValidListName(name)) {
    return NextResponse.json({ error: "Invalid list name" }, { status: 400 });
  }

  const listId = generateListId();
  const listName = (name as string).trim();
  const sql = getClient();

  try {
    await sql`INSERT INTO lists (id, name) VALUES (${listId}, ${listName})`;
    return NextResponse.json(
      {
        data: { id: listId, name: listName, created_at: new Date().toISOString() },
        success: true,
        status: 201,
        message: "List created successfully",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/lists] failed:", err);
    return NextResponse.json(
      { error: "Failed to create list", success: false },
      { status: 500 }
    );
  }
}
