import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "@/db";
import { user } from "@/db/schema";
import z from "zod";
import { authSchema } from "@/schema/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = z.safeParse(authSchema, body);

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
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [newUser] = await db
      .insert(user)
      .values({
        email,
        passwordHash: hashedPassword,
      })
      .returning({ id: user.id, email: user.email });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const token = sign(
      { userId: newUser.id, email: newUser.email },
      jwtSecret,
      { expiresIn: "7d" },
    );

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
