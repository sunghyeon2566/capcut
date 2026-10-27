import { NextRequest, NextResponse } from "next/server";
import { getStudentShopId } from "@/lib/shop-session";
import { findShopBySlug, updateShopInfo, verifyShopPassword } from "@/lib/shops";

// 수강생: 본인 비밀번호 변경
export async function POST(req: NextRequest, ctx: RouteContext<"/api/shop/[slug]/password">) {
  const { slug } = await ctx.params;
  const shop = findShopBySlug(slug);
  if (!shop || (await getStudentShopId()) !== shop.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    current?: string;
    next?: string;
  } | null;
  if (!body?.current || !verifyShopPassword(shop, body.current)) {
    return NextResponse.json({ error: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 });
  }
  if (!body.next || body.next.length < 4) {
    return NextResponse.json({ error: "새 비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
  }
  updateShopInfo(shop.id, { password: body.next });
  return NextResponse.json({ ok: true });
}
