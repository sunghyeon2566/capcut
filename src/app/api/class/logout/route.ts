import { NextResponse } from "next/server";
import { clearCookie, STUDENT_COOKIE } from "@/lib/academy/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearCookie(res, STUDENT_COOKIE);
  return res;
}
