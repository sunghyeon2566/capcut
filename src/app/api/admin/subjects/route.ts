import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/academy/auth";
import { parseSubjectInput } from "@/lib/academy/validate";
import { createSubject } from "@/lib/academy/store";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = parseSubjectInput(await req.json().catch(() => null), true);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const subject = createSubject({
      name: parsed.name!,
      slug: parsed.slug!,
      description: parsed.description ?? "",
      access: parsed.access ?? "all",
      listed: parsed.listed ?? false,
    });
    return NextResponse.json({ subject });
  } catch {
    return NextResponse.json({ error: "이미 사용 중인 페이지 주소입니다." }, { status: 409 });
  }
}
