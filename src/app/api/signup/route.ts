import { NextRequest, NextResponse } from "next/server";
import { createMember } from "@/lib/store";
import { createSessionValue, SESSION_COOKIE_NAME } from "@/lib/session";
import { REGIONS } from "@/lib/regions";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { name, email, password, region } = body as {
    name?: string;
    email?: string;
    password?: string;
    region?: string;
  };

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "이름을 입력해 주세요." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "올바른 이메일 주소를 입력해 주세요." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }
  if (!region || !REGIONS.includes(region as (typeof REGIONS)[number])) {
    return NextResponse.json({ error: "거주 지역(시/도)을 선택해 주세요." }, { status: 400 });
  }

  try {
    const member = createMember({ name, email, password, region });
    const sessionValue = createSessionValue({
      memberId: member.id,
      email: member.email,
      name: member.name,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: "회원가입 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
