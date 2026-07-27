import type { Region } from "@/lib/regions";

// 전국 회원 현황(협회 공식 집계) 데이터입니다.
//
// 홈페이지 메인의 "전국 회원 450명" 지도가 이 값을 기준으로 그려집니다.
// 온라인 회원가입으로 들어오는 인원(data/members.json)은 이 집계와 별도로
// 관리되며, /map 페이지에서 실시간 가입자 수와 함께 보여줍니다.
//
// 회원 수가 바뀌면 이 표만 수정하면 됩니다. 합계는 자동으로 계산됩니다.

export const REGION_MEMBER_COUNTS: Record<Region, number> = {
  서울특별시: 78,
  경기도: 92,
  인천광역시: 27,
  부산광역시: 31,
  대구광역시: 21,
  광주광역시: 17,
  대전광역시: 18,
  울산광역시: 11,
  세종특별자치시: 7,
  강원도: 16,
  충청북도: 15,
  충청남도: 20,
  전북특별자치도: 18,
  전라남도: 19,
  경상북도: 24,
  경상남도: 28,
  제주특별자치도: 8,
};

/** 전국 회원 총원 */
export const TOTAL_MEMBERS = Object.values(REGION_MEMBER_COUNTS).reduce(
  (sum, n) => sum + n,
  0
);

/** 회원이 한 명 이상 있는 시·도 수 */
export const ACTIVE_REGION_COUNT = Object.values(REGION_MEMBER_COUNTS).filter(
  (n) => n > 0
).length;

/** 가장 많은 지역의 회원 수 — 지도 마커 크기 기준값 */
export const MAX_REGION_COUNT = Math.max(
  ...Object.values(REGION_MEMBER_COUNTS)
);

/** 회원 수가 많은 순서로 정렬한 목록 */
export function rankedRegions(): { region: Region; count: number }[] {
  return (Object.keys(REGION_MEMBER_COUNTS) as Region[])
    .map((region) => ({ region, count: REGION_MEMBER_COUNTS[region] }))
    .sort((a, b) => b.count - a.count);
}

/** "서울특별시" → "서울" 처럼 지도 위에 표기할 짧은 이름 */
export function shortRegionName(region: string): string {
  return region
    .replace("특별자치시", "")
    .replace("특별자치도", "")
    .replace("특별시", "")
    .replace("광역시", "")
    .replace("충청북도", "충북")
    .replace("충청남도", "충남")
    .replace("전북", "전북")
    .replace("전라남도", "전남")
    .replace("경상북도", "경북")
    .replace("경상남도", "경남")
    .replace("강원도", "강원")
    .replace("경기도", "경기");
}
