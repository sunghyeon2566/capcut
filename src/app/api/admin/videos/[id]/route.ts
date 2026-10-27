import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/academy/auth";
import { deleteVideo, moveVideo, updateVideo } from "@/lib/academy/store";

type Ctx = { params: Promise<{ id: string }> };

// { title, description, categoryId } 수정 / { move: "up" | "down" } 순서 변경
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = ((await req.json().catch(() => null)) ?? {}) as {
    title?: string;
    description?: string;
    categoryId?: string;
    move?: string;
  };
  if (body.title !== undefined && !body.title.trim()) {
    return NextResponse.json({ error: "영상 제목을 입력해 주세요." }, { status: 400 });
  }
  try {
    if (body.move === "up" || body.move === "down") moveVideo(id, body.move);
    updateVideo(id, {
      title: body.title,
      description: body.description,
      categoryId: body.categoryId,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "영상 또는 카테고리를 찾을 수 없습니다." }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  deleteVideo(id);
  return NextResponse.json({ ok: true });
}
