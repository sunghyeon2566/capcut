import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/academy/auth";
import { createVideo, findCategoryById, newId, VIDEO_DIR } from "@/lib/academy/store";

// 영상 파일 업로드.
// 수 GB 강의 녹화본도 올릴 수 있도록 요청 본문(파일 원본)을 메모리에 담지 않고 곧바로 디스크에 씁니다.
// 요청: PUT /api/admin/videos/upload?categoryId=..&title=..&description=..&filename=..  (본문 = 파일)

const MIME_BY_EXT: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const params = req.nextUrl.searchParams;
  const categoryId = params.get("categoryId") ?? "";
  const title = (params.get("title") ?? "").trim();
  const description = params.get("description") ?? "";
  const ext = path.extname(params.get("filename") ?? "").toLowerCase();

  if (!findCategoryById(categoryId)) {
    return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 });
  }
  if (!title) {
    return NextResponse.json({ error: "영상 제목을 입력해 주세요." }, { status: 400 });
  }
  const mime = MIME_BY_EXT[ext];
  if (!mime) {
    return NextResponse.json(
      { error: "mp4, m4v, webm, mov 형식의 영상만 올릴 수 있습니다. (mp4 권장)" },
      { status: 400 }
    );
  }
  if (!req.body) {
    return NextResponse.json({ error: "파일이 비어 있습니다." }, { status: 400 });
  }

  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  const id = newId("vd");
  const file = `${id}${ext}`;
  const target = path.join(VIDEO_DIR, file);
  const partial = `${target}.part`;

  try {
    await pipeline(
      Readable.fromWeb(req.body as unknown as NodeReadableStream),
      fs.createWriteStream(partial)
    );
    fs.renameSync(partial, target);
  } catch {
    fs.rmSync(partial, { force: true });
    return NextResponse.json({ error: "업로드가 중단되었습니다. 다시 시도해 주세요." }, { status: 500 });
  }

  const size = fs.statSync(target).size;
  if (size === 0) {
    fs.rmSync(target, { force: true });
    return NextResponse.json({ error: "파일이 비어 있습니다." }, { status: 400 });
  }

  try {
    const video = createVideo({
      id,
      categoryId,
      title,
      description,
      source: { type: "file", file, size, mime },
    });
    return NextResponse.json({ video });
  } catch {
    // 업로드 도중 카테고리가 삭제된 경우
    fs.rmSync(target, { force: true });
    return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 });
  }
}
