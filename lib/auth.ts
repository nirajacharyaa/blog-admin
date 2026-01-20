"use server";

import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

interface JWTPayload {
  userId: number;
  email: string;
}

export async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session");

  if (!token) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return null;
  }

  try {
    const decoded = verify(token.value, jwtSecret) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
