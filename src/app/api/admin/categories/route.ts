import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/academy/auth";
import { createCategory } from "@/lib/academy/store";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { subjectId, name } = ((await req.json().catch(() => null)) ?? {}) as {
    subjectId?: string;
    name?: string;
  };
  if (!subjectId || !name?.trim()) {
    return NextResponse.json({ error: "카테고리 이름을 입력해 주세요." }, { status: 400 });
  }
  try {
    return NextResponse.json({ category: createCategory(subjectId, name) });
  } catch {
    return NextResponse.json({ error: "과목을 찾을 수 없습니다." }, { status: 404 });
  }
}
