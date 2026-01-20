import db from "@/db";
import { user } from "@/db/schema";
import { authSchema } from "@/schema/auth";
import { eq } from "drizzle-orm";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import z from "zod";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const result = authSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: z.treeifyError(result.error) },
      { status: 400 },
    );
  }

  const { email, password } = result.data;
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  if (!existingUser) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const isPasswordCorrect = await compare(password, existingUser.passwordHash);

  if (!isPasswordCorrect) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return NextResponse.json({ error: "Server error!!" }, { status: 500 });
  }

  const token = sign({ userId: existingUser.id, email: email }, jwtSecret, {
    expiresIn: "7d",
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
