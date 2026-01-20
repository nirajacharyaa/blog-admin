import { NextResponse } from "next/server";
import db from "@/db";
import { tag } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "unauthorized!" }, { status: 401 });
    }

    const tags = await db.select().from(tag).orderBy(tag.name);

    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json({ error: "server error!" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "unauthorized@!" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "tag name is required" },
        { status: 400 },
      );
    }
    const existingTag = await db
      .select()
      .from(tag)
      .where(eq(tag.name, name.trim()))
      .limit(1);

    if (existingTag.length > 0) {
      return NextResponse.json({ tag: existingTag[0] });
    }

    const [newTag] = await db
      .insert(tag)
      .values({ name: name.trim() })
      .returning();

    return NextResponse.json({ tag: newTag }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "server error!" }, { status: 500 });
  }
}
