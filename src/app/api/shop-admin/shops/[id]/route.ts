import { NextRequest, NextResponse } from "next/server";
import { isInstructor } from "@/lib/shop-session";
import { deleteShop, findShopById, toPublicShop, updateShopInfo } from "@/lib/shops";

// 강사: 상호 변경, 수강생 이름 변경, 수강생 비밀번호 재설정
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/shop-admin/shops/[id]">) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사 로그인이 필요합니다." }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!findShopById(id)) {
    return NextResponse.json({ error: "쇼핑몰을 찾을 수 없습니다." }, { status: 404 });
  }
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    studentName?: string;
    password?: string;
  } | null;
  if (body?.name !== undefined && (!body.name.trim() || body.name.trim().length > 30)) {
    return NextResponse.json({ error: "상호는 1~30자로 입력해 주세요." }, { status: 400 });
  }
  if (body?.password && body.password.length < 4) {
    return NextResponse.json({ error: "수강생 비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
  }
  const shop = updateShopInfo(id, body ?? {});
  return NextResponse.json({ shop: toPublicShop(shop) });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/shop-admin/shops/[id]">) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사 로그인이 필요합니다." }, { status: 401 });
  }
  const { id } = await ctx.params;
  deleteShop(id);
  return NextResponse.json({ ok: true });
}
