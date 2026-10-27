import { NextResponse } from "next/server";
import { COOKIE_OPTIONS, INSTRUCTOR_COOKIE } from "@/lib/shop-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(INSTRUCTOR_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
