import { NextResponse } from "next/server";
import { getMemberCountsByRegion, getTotalMemberCount } from "@/lib/store";

// 캐싱을 사용하지 않고 매 요청마다 로컬 데이터 저장소를 다시 읽습니다.
// 회원가입이 발생하면 이 API는 즉시(실시간으로) 변경된 값을 반영합니다.
export async function GET() {
  const counts = getMemberCountsByRegion();
  const total = getTotalMemberCount();
  return NextResponse.json({ counts, total }, { headers: { "Cache-Control": "no-store" } });
}
