import { NextResponse } from "next/server";
import { ADMIN_COOKIE, clearCookie } from "@/lib/academy/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearCookie(res, ADMIN_COOKIE);
  return res;
}
