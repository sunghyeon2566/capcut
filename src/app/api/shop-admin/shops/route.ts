import { NextRequest, NextResponse } from "next/server";
import { isInstructor } from "@/lib/shop-session";
import { createShop, getAllShops, SLUG_PATTERN, toPublicShop } from "@/lib/shops";

export async function GET() {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사 로그인이 필요합니다." }, { status: 401 });
  }
  return NextResponse.json({ shops: getAllShops().map(toPublicShop) });
}

export async function POST(req: NextRequest) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사 로그인이 필요합니다." }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    slug?: string;
    studentName?: string;
    password?: string;
  } | null;
  const name = body?.name?.trim() ?? "";
  const slug = body?.slug?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";

  if (!name) {
    return NextResponse.json({ error: "상호를 입력해 주세요." }, { status: 400 });
  }
  if (name.length > 30) {
    return NextResponse.json({ error: "상호는 30자 이내로 입력해 주세요." }, { status: 400 });
  }
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: "쇼핑몰 주소는 영문 소문자·숫자·하이픈(-)으로 2~30자 입력해 주세요." },
      { status: 400 }
    );
  }
  if (password.length < 4) {
    return NextResponse.json({ error: "수강생 비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
  }

  try {
    const shop = createShop({ name, slug, studentName: body?.studentName ?? "", password });
    return NextResponse.json({ shop: toPublicShop(shop) });
  } catch (err) {
    if (err instanceof Error && err.message === "SLUG_TAKEN") {
      return NextResponse.json({ error: "이미 사용 중인 쇼핑몰 주소입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: "쇼핑몰 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
