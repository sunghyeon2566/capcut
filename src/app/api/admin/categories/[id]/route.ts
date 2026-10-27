import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/academy/auth";
import { deleteCategory, moveCategory, renameCategory } from "@/lib/academy/store";

type Ctx = { params: Promise<{ id: string }> };

// { name } 이름 변경 / { move: "up" | "down" } 순서 변경
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = ((await req.json().catch(() => null)) ?? {}) as { name?: string; move?: string };
  try {
    if (body.move === "up" || body.move === "down") moveCategory(id, body.move);
    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json({ error: "카테고리 이름을 입력해 주세요." }, { status: 400 });
      }
      renameCategory(id, body.name);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  deleteCategory(id);
  return NextResponse.json({ ok: true });
}
