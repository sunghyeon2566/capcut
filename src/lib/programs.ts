export interface CurriculumTrack {
  id: string;
  title: string;
  weeks: string;
  description: string;
  topics: string[];
}

export const CURRICULUM_TRACKS: CurriculumTrack[] = [
  {
    id: "track-planning",
    title: "AI 콘텐츠 기획 트랙",
    weeks: "1~10주차",
    description:
      "콘텐츠 기획의 기본기부터 AI 도구를 활용한 아이디어 발굴, 기획서 작성까지 실무 프로세스를 익힙니다.",
    topics: ["콘텐츠 기획 방법론", "타깃 분석과 페르소나 설계", "AI 브레인스토밍 도구 활용", "기획서 작성 실습"],
  },
  {
    id: "track-visual",
    title: "영상·이미지 생성 AI 활용 트랙",
    weeks: "11~22주차",
    description:
      "이미지 및 영상 생성 AI 도구를 활용해 실제 브랜드 콘텐츠 수준의 결과물을 제작하는 방법을 학습합니다.",
    topics: ["생성형 이미지 AI 실습", "AI 영상 생성 도구 활용", "브랜드 톤앤매너 유지 기법", "저작권과 윤리적 활용"],
  },
  {
    id: "track-shortform",
    title: "숏폼 제작 트랙",
    weeks: "23~32주차",
    description:
      "유튜브 쇼츠, 릴스, 틱톡 등 숏폼 플랫폼에 최적화된 콘텐츠 기획과 제작 노하우를 다룹니다.",
    topics: ["숏폼 후킹 스토리텔링", "AI 자동 편집 워크플로우", "플랫폼별 알고리즘 이해", "채널 운영과 성장 전략"],
  },
  {
    id: "track-prompt",
    title: "프롬프트 엔지니어링 트랙",
    weeks: "33~42주차",
    description:
      "업무 자동화와 고품질 콘텐츠 생성을 위한 프롬프트 설계 원리와 실전 활용법을 학습합니다.",
    topics: ["프롬프트 구조 설계", "체인 오브 소트 기법", "업무 자동화 프롬프트", "실전 사례 스터디"],
  },
  {
    id: "track-talent",
    title: "인재 양성 트랙",
    weeks: "43~50주차",
    description:
      "학습한 역량을 바탕으로 포트폴리오를 완성하고, 창업 또는 취업으로 연결되는 진로 코칭을 제공합니다.",
    topics: ["포트폴리오 완성", "1인 미디어 창업 코칭", "기업 실무 연계 프로젝트", "수료 발표회 및 네트워킹"],
  },
];

export const PROGRAM_STATS = [
  { label: "전담 강사", value: "8인" },
  { label: "연간 강의 횟수", value: "50회" },
  { label: "운영 기간", value: "연 50주" },
  { label: "커리큘럼 트랙", value: "5개 트랙" },
];
