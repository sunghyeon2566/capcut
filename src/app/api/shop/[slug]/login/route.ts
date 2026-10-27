import { NextRequest, NextResponse } from "next/server";
import { COOKIE_OPTIONS, createSignedValue, STUDENT_COOKIE } from "@/lib/shop-session";
import { findShopBySlug, verifyShopPassword } from "@/lib/shops";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/shop/[slug]/login">) {
  const { slug } = await ctx.params;
  const shop = findShopBySlug(slug);
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  if (!shop || !body?.password || !verifyShopPassword(shop, body.password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STUDENT_COOKIE, createSignedValue({ shopId: shop.id }), COOKIE_OPTIONS);
  return res;
}
