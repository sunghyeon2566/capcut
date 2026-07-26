import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getResources } from "@/lib/resources";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const resources = await getResources();
  return NextResponse.json({ resources });
}
