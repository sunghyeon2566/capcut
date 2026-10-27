import { NextResponse } from "next/server";
import { COOKIE_OPTIONS, STUDENT_COOKIE } from "@/lib/shop-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STUDENT_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
