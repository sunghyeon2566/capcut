export type EventCategory = "전시회" | "공모전" | "행사" | "오프라인 교육";

export interface AssociationEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  status: "예정" | "종료";
  location: string;
  description: string;
}

export const EVENTS: AssociationEvent[] = [
  {
    id: "evt-01",
    title: "제3회 AI 콘텐츠 창작 공모전",
    category: "공모전",
    date: "2026.09.01 ~ 2026.10.15",
    status: "예정",
    location: "온라인 접수",
    description:
      "생성형 AI를 활용한 광고, 숏폼, 일러스트 부문 작품을 공모합니다. 대상 수상자에게는 상금과 협회 정회원 자격이 부여됩니다.",
  },
  {
    id: "evt-02",
    title: "2026 AI 콘텐츠 우수작 전시회",
    category: "전시회",
    date: "2026.11.05 ~ 2026.11.09",
    status: "예정",
    location: "서울 코엑스 3전시장",
    description:
      "협회 수강생과 공모전 수상작을 한자리에서 만날 수 있는 연례 전시회입니다. 관람객 투표를 통한 인기상도 함께 진행됩니다.",
  },
  {
    id: "evt-03",
    title: "AI 콘텐츠 취업·창업 박람회",
    category: "행사",
    date: "2026.12.03",
    status: "예정",
    location: "서울 강남 협회 교육센터",
    description:
      "AI 콘텐츠 분야 기업 채용 설명회와 1인 창작자 창업 상담을 동시에 진행하는 네트워킹 행사입니다.",
  },
  {
    id: "evt-04",
    title: "숏폼 크리에이터 오프라인 부트캠프",
    category: "오프라인 교육",
    date: "2026.08.22 ~ 2026.08.23",
    status: "예정",
    location: "부산 해운대 교육장",
    description:
      "이틀간 진행되는 집중 워크숍으로, 기획부터 촬영, AI 편집까지 숏폼 제작 전 과정을 직접 실습합니다.",
  },
  {
    id: "evt-05",
    title: "제2회 AI 콘텐츠 창작 공모전",
    category: "공모전",
    date: "2025.09.01 ~ 2025.10.15",
    status: "종료",
    location: "온라인 접수",
    description:
      "총 320팀이 참가한 지난 공모전에서는 프롬프트 기반 광고 영상 부문이 가장 높은 경쟁률을 기록했습니다.",
  },
  {
    id: "evt-06",
    title: "2025 AI 콘텐츠 우수작 전시회",
    category: "전시회",
    date: "2025.11.06 ~ 2025.11.10",
    status: "종료",
    location: "서울 코엑스 3전시장",
    description:
      "5일간 4,200명이 방문한 전시회로, 지역 언론에도 다수 소개되며 협회 인지도 확산에 크게 기여했습니다.",
  },
  {
    id: "evt-07",
    title: "AI 콘텐츠 기초 무료 특강",
    category: "오프라인 교육",
    date: "2025.06.14",
    status: "종료",
    location: "대전 시민교육센터",
    description:
      "지역 주민을 대상으로 진행한 무료 특강으로, 참가자의 90% 이상이 정규 과정 등록으로 이어졌습니다.",
  },
];
