import { NextRequest, NextResponse } from "next/server";
import {
  createStudent,
  normalizePhone,
  PASSWORD_MIN,
  startStudentSession,
  USERNAME_RULE,
} from "@/lib/academy/store";
import { setStudentCookie } from "@/lib/academy/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const { username, password, name, phone, agree } = body as {
    username?: string;
    password?: string;
    name?: string;
    phone?: string;
    agree?: boolean;
  };

  const normalizedUsername = (username ?? "").trim().toLowerCase();
  if (!USERNAME_RULE.test(normalizedUsername)) {
    return NextResponse.json(
      { error: "아이디는 영문 소문자·숫자·밑줄(_) 4~20자로 입력해 주세요." },
      { status: 400 }
    );
  }
  if (!password || password.length < PASSWORD_MIN) {
    return NextResponse.json(
      { error: `비밀번호는 ${PASSWORD_MIN}자 이상이어야 합니다.` },
      { status: 400 }
    );
  }
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "이름을 입력해 주세요." }, { status: 400 });
  }
  const normalizedPhone = normalizePhone(phone ?? "");
  if (!normalizedPhone) {
    return NextResponse.json(
      { error: "휴대폰 번호를 정확히 입력해 주세요. (예: 010-1234-5678)" },
      { status: 400 }
    );
  }
  if (!agree) {
    return NextResponse.json(
      { error: "개인정보 수집·이용에 동의해 주세요." },
      { status: 400 }
    );
  }

  try {
    const student = createStudent({
      username: normalizedUsername,
      password,
      name,
      phone: normalizedPhone,
    });
    const sid = startStudentSession(student.id);
    const res = NextResponse.json({ ok: true });
    setStudentCookie(res, student.id, sid);
    return res;
  } catch (err) {
    if (err instanceof Error && err.message === "USERNAME_TAKEN") {
      return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 409 });
    }
    if (err instanceof Error && err.message === "PHONE_TAKEN") {
      return NextResponse.json(
        { error: "이미 가입된 전화번호입니다. 아이디가 기억나지 않으면 강사에게 문의해 주세요." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "회원가입 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
