import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getStudentShopId } from "@/lib/shop-session";
import { findShopBySlug, UPLOAD_DIR } from "@/lib/shops";

const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// 수강생: 상품/배너/로고 이미지 업로드. data/uploads/<shopId>/ 에 저장됩니다.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/shop/[slug]/upload">) {
  const { slug } = await ctx.params;
  const shop = findShopBySlug(slug);
  if (!shop || (await getStudentShopId()) !== shop.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "이미지 파일을 선택해 주세요." }, { status: 400 });
  }
  const ext = EXTENSIONS[file.type];
  if (!ext) {
    return NextResponse.json({ error: "JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "이미지는 5MB 이하로 올려 주세요." }, { status: 400 });
  }

  const dir = path.join(UPLOAD_DIR, shop.id);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/shop-images/${shop.id}/${filename}` });
}
