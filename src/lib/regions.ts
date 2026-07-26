// 대한민국 17개 시/도 목록 (전국 회원 현황 지도 및 회원가입 폼에서 공용으로 사용)
export const REGIONS = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전북특별자치도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
] as const;

export type Region = (typeof REGIONS)[number];

// /map 페이지의 지도 그리드용 대략적 좌표 (실제 지리와 완전히 일치하지는 않는 단순화된 배치)
export const REGION_GRID: Record<Region, { col: number; row: number }> = {
  서울특별시: { col: 2, row: 2 },
  인천광역시: { col: 1, row: 2 },
  경기도: { col: 2, row: 3 },
  강원도: { col: 4, row: 2 },
  충청북도: { col: 3, row: 4 },
  충청남도: { col: 2, row: 4 },
  세종특별자치시: { col: 3, row: 3 },
  대전광역시: { col: 3, row: 5 },
  전북특별자치도: { col: 2, row: 5 },
  전라남도: { col: 2, row: 7 },
  광주광역시: { col: 2, row: 6 },
  경상북도: { col: 4, row: 4 },
  대구광역시: { col: 4, row: 5 },
  경상남도: { col: 3, row: 6 },
  부산광역시: { col: 4, row: 6 },
  울산광역시: { col: 4, row: 5 },
  제주특별자치도: { col: 2, row: 8 },
};
