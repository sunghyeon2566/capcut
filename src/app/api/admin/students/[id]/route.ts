import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/academy/auth";
import {
  deleteStudent,
  getSubjects,
  normalizePhone,
  PASSWORD_MIN,
  updateStudent,
} from "@/lib/academy/store";

type Ctx = { params: Promise<{ id: string }> };

// 수강생 정보 수정: 이름 · 전화번호 · 이용 상태 · 시청 가능 과목 · 비밀번호 재설정
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = ((await req.json().catch(() => null)) ?? {}) as {
    name?: string;
    phone?: string;
    active?: boolean;
    subjectIds?: string[];
    password?: string;
  };

  const patch: Parameters<typeof updateStudent>[1] = {};
  if (body.name !== undefined) {
    if (!body.name.trim()) return NextResponse.json({ error: "이름을 입력해 주세요." }, { status: 400 });
    patch.name = body.name;
  }
  if (body.phone !== undefined) {
    const phone = normalizePhone(body.phone);
    if (!phone) return NextResponse.json({ error: "휴대폰 번호 형식이 올바르지 않습니다." }, { status: 400 });
    patch.phone = phone;
  }
  if (typeof body.active === "boolean") patch.active = body.active;
  if (Array.isArray(body.subjectIds)) {
    const valid = new Set(getSubjects().map((s) => s.id));
    patch.subjectIds = body.subjectIds.filter((x) => valid.has(x));
  }
  if (body.password !== undefined) {
    if (body.password.length < PASSWORD_MIN) {
      return NextResponse.json(
        { error: `비밀번호는 ${PASSWORD_MIN}자 이상이어야 합니다.` },
        { status: 400 }
      );
    }
    patch.password = body.password;
  }

  try {
    updateStudent(id, patch);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "PHONE_TAKEN") {
      return NextResponse.json({ error: "다른 수강생이 사용 중인 전화번호입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: "수강생을 찾을 수 없습니다." }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  deleteStudent(id);
  return NextResponse.json({ ok: true });
}
