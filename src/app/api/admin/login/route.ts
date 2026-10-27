import { NextRequest, NextResponse } from "next/server";
import { checkAdminCredentials, setAdminCookie } from "@/lib/academy/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { username, password } = (body ?? {}) as { username?: string; password?: string };
  if (!username || !password || !checkAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: "관리자 아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }
  const res = NextResponse.json({ ok: true });
  setAdminCookie(res);
  return res;
}
