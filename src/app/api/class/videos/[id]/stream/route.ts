import fs from "fs";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { getStudent, isAdmin } from "@/lib/academy/auth";
import {
  canStudentView,
  findSubjectById,
  findVideoById,
  videoFilePath,
} from "@/lib/academy/store";

// 업로드한 강의 영상을 로그인 · 권한 확인 후에만 내려보냅니다.
// 파일은 public 폴더가 아닌 data/videos 에 있으므로 주소를 알아도 직접 받을 수 없습니다.
// Range 요청을 지원하여 탐색(앞으로/뒤로 이동)이 가능합니다.

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const video = findVideoById(id);
  if (!video || video.source.type !== "file") {
    return NextResponse.json({ error: "영상을 찾을 수 없습니다." }, { status: 404 });
  }

  // 관리자는 미리보기를 위해 항상 볼 수 있습니다.
  if (!(await isAdmin())) {
    const student = await getStudent();
    const subject = findSubjectById(video.subjectId);
    if (!student || !subject || !canStudentView(student, subject)) {
      return NextResponse.json({ error: "시청 권한이 없습니다." }, { status: 403 });
    }
  }

  // 주소창에 직접 입력하거나 다른 사이트에 삽입한 경우를 걸러냅니다 (브라우저의 video 태그 요청만 허용).
  const dest = req.headers.get("sec-fetch-dest");
  if (dest && dest !== "video" && dest !== "audio" && dest !== "empty") {
    return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  const filePath = videoFilePath(video.source.file);
  let size: number;
  try {
    size = fs.statSync(filePath).size;
  } catch {
    return NextResponse.json({ error: "영상 파일이 없습니다." }, { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": video.source.mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
  };

  const range = req.headers.get("range");
  const match = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : null;
  if (match && (match[1] || match[2])) {
    let start: number;
    let end: number;
    if (match[1]) {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    } else {
      // "bytes=-500" → 마지막 500바이트
      start = Math.max(0, size - Number(match[2]));
      end = size - 1;
    }
    if (start > end || start >= size) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    const stream = fs.createReadStream(filePath, { start, end });
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  const stream = fs.createReadStream(filePath);
  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: { ...headers, "Content-Length": String(size) },
  });
}
