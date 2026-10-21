// 민담 안내 페이지(/mindam)에서 쓰는 링크와 슬라이드 내용
// ─────────────────────────────────────────────────────────
// 링크나 슬라이드 문구를 바꾸고 싶으면 이 파일만 고치면 됩니다.

export const MINDAM_LINKS = {
  // 1) 컷편집 · 민담 자동 편집기 프로그램 받기 (구글 신청서)
  programForm: "https://forms.gle/REPLACE_PROGRAM_FORM",
  // 3) 민담 유튜브 강의 신청서
  lectureForm: "https://forms.gle/REPLACE_LECTURE_FORM",
  // 4) 딥마크온 클래스 카카오톡 단톡방
  kakaoOpenChat: "https://open.kakao.com/o/REPLACE_OPEN_CHAT",
};

export type Slide = {
  // 슬라이드 위쪽 작은 글씨 (예: "STEP 1")
  label?: string;
  title: string;
  points?: string[];
  // public 폴더 기준 이미지 경로 (예: "/mindam/slide-01.png")
  image?: string;
};

// 2) 민담 제작 방법 슬라이드 — 아래는 예시 문구입니다. 실제 자료로 교체하세요.
export const MINDAM_SLIDES: Slide[] = [
  {
    label: "민담 제작 방법",
    title: "민담 롱폼 영상,\n이렇게 만듭니다",
    points: ["주제 선정부터 업로드까지 순서대로 안내해 드려요."],
  },
  {
    label: "STEP 1",
    title: "주제 고르기",
    points: ["함께 드리는 민담 주제 600개 중에서 하나를 고릅니다."],
  },
  {
    label: "STEP 2",
    title: "대본 만들기",
    points: ["민담 지침 스킬로 대본 초안을 만들고 다듬습니다."],
  },
  {
    label: "STEP 3",
    title: "음성 · 이미지 준비",
    points: ["대본에 맞춰 내레이션 음성과 장면 이미지를 준비합니다."],
  },
  {
    label: "STEP 4",
    title: "자동 편집",
    points: ["민담 자동 편집기와 컷편집 프로그램으로 영상을 완성합니다."],
  },
  {
    label: "STEP 5",
    title: "업로드",
    points: ["제목 · 썸네일을 정리해 유튜브에 올립니다."],
  },
];
