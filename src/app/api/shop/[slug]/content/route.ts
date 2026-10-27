import { NextRequest, NextResponse } from "next/server";
import { getStudentShopId } from "@/lib/shop-session";
import {
  findShopBySlug,
  sanitizeDesign,
  sanitizeProducts,
  toPublicShop,
  updateShopContent,
} from "@/lib/shops";

// 수강생: 쇼핑몰 디자인 + 15개 상품 저장
export async function PUT(req: NextRequest, ctx: RouteContext<"/api/shop/[slug]/content">) {
  const { slug } = await ctx.params;
  const shop = findShopBySlug(slug);
  if (!shop || (await getStudentShopId()) !== shop.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { design?: unknown; products?: unknown } | null;
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const updated = updateShopContent(
    shop.id,
    sanitizeDesign(body.design, shop.name),
    sanitizeProducts(body.products)
  );
  return NextResponse.json({ shop: toPublicShop(updated) });
}
