import { NextRequest, NextResponse } from "next/server";
import {
  findStudentByUsername,
  startStudentSession,
  verifyStudentPassword,
} from "@/lib/academy/store";
import { setStudentCookie } from "@/lib/academy/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { username, password } = (body ?? {}) as { username?: string; password?: string };

  if (!username || !password) {
    return NextResponse.json({ error: "아이디와 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  const student = findStudentByUsername(username);
  if (!student || !verifyStudentPassword(student, password)) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }
  if (!student.active) {
    return NextResponse.json(
      { error: "이용이 정지된 계정입니다. 강사에게 문의해 주세요." },
      { status: 403 }
    );
  }

  const sid = startStudentSession(student.id);
  const res = NextResponse.json({ ok: true });
  setStudentCookie(res, student.id, sid);
  return res;
}
