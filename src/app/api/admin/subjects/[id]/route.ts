import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/academy/auth";
import { parseSubjectInput } from "@/lib/academy/validate";
import { deleteSubject, updateSubject } from "@/lib/academy/store";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const parsed = parseSubjectInput(await req.json().catch(() => null), false);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    return NextResponse.json({ subject: updateSubject(id, parsed) });
  } catch (err) {
    if (err instanceof Error && err.message === "SLUG_TAKEN") {
      return NextResponse.json({ error: "이미 사용 중인 페이지 주소입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: "과목을 찾을 수 없습니다." }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  deleteSubject(id);
  return NextResponse.json({ ok: true });
}
