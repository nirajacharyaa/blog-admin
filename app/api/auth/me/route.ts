import { NextResponse } from "next/server";
import db from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const decoded = await verifyAuth();
    if (!decoded) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const existingUser = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.id, decoded.userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: existingUser.id,
      email: existingUser.email,
    });
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }
}
