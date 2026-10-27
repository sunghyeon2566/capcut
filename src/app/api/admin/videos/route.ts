import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/academy/auth";
import { parseYoutubeId } from "@/lib/academy/validate";
import { createVideo } from "@/lib/academy/store";

// 기존에 유튜브(일부공개)로 올려 둔 녹화본을 링크로 등록합니다.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = ((await req.json().catch(() => null)) ?? {}) as {
    categoryId?: string;
    title?: string;
    description?: string;
    youtubeUrl?: string;
  };
  if (!body.categoryId || !body.title?.trim()) {
    return NextResponse.json({ error: "카테고리와 영상 제목을 입력해 주세요." }, { status: 400 });
  }
  const youtubeId = parseYoutubeId(body.youtubeUrl ?? "");
  if (!youtubeId) {
    return NextResponse.json({ error: "유튜브 영상 주소를 확인해 주세요." }, { status: 400 });
  }
  try {
    const video = createVideo({
      categoryId: body.categoryId,
      title: body.title,
      description: body.description ?? "",
      source: { type: "youtube", youtubeId },
    });
    return NextResponse.json({ video });
  } catch {
    return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 });
  }
}
