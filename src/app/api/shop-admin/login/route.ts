import { NextRequest, NextResponse } from "next/server";
import {
  checkInstructorPassword,
  COOKIE_OPTIONS,
  createSignedValue,
  INSTRUCTOR_COOKIE,
} from "@/lib/shop-session";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !checkInstructorPassword(body.password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(INSTRUCTOR_COOKIE, createSignedValue({ role: "instructor" }), COOKIE_OPTIONS);
  return res;
}
