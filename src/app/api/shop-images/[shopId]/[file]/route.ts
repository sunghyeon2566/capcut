import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { UPLOAD_DIR } from "@/lib/shops";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// 업로드된 쇼핑몰 이미지 제공. 파일명은 업로드 시 생성되므로 내용이 바뀌지 않아 길게 캐시합니다.
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/shop-images/[shopId]/[file]">) {
  const { shopId, file } = await ctx.params;
  if (!/^[\w-]+$/.test(shopId) || !/^[\w-]+\.(jpg|png|webp|gif)$/.test(file)) {
    return new NextResponse(null, { status: 404 });
  }
  const filePath = path.join(UPLOAD_DIR, shopId, file);
  if (!fs.existsSync(filePath)) {
    return new NextResponse(null, { status: 404 });
  }
  const ext = file.split(".").pop() as string;
  return new NextResponse(fs.readFileSync(filePath), {
    headers: {
      "Content-Type": TYPES[ext],
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
