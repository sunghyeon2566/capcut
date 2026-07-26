// 회원 전용 자료실 데이터 소스
//
// 운영 방법 안내 (실제 협회 담당자용):
// 1. 구글 시트에 "제목, 분류, 링크" 3개 컬럼으로 자료 목록을 작성합니다.
// 2. 구글 시트 메뉴에서 파일 > 공유 > 웹에 게시(Publish to web)를 선택하고, 형식을 CSV로 지정합니다.
// 3. 발급된 CSV 게시 URL을 서버 환경변수 RESOURCES_SHEET_CSV_URL 에 설정합니다.
// 4. 환경변수가 설정되면 /api/resources 가 매 요청마다 해당 CSV를 실시간으로 읽어와 렌더링합니다.
//    설정하지 않으면 아래 SAMPLE_RESOURCES 예시 데이터가 대신 표시됩니다.

export interface ResourceItem {
  title: string;
  category: string;
  url: string;
}

export const SAMPLE_RESOURCES: ResourceItem[] = [
  {
    title: "2026 AI 콘텐츠 기획 템플릿 (PPT)",
    category: "기획 템플릿",
    url: "https://drive.google.com/drive/folders/EXAMPLE-PLANNING-TEMPLATE",
  },
  {
    title: "프롬프트 엔지니어링 실전 가이드북 (PDF)",
    category: "가이드북",
    url: "https://drive.google.com/drive/folders/EXAMPLE-PROMPT-GUIDE",
  },
  {
    title: "숏폼 편집 체크리스트",
    category: "체크리스트",
    url: "https://drive.google.com/drive/folders/EXAMPLE-SHORTFORM-CHECKLIST",
  },
  {
    title: "회원 전용 강의 다시보기 모음",
    category: "강의 영상",
    url: "https://drive.google.com/drive/folders/EXAMPLE-LECTURE-ARCHIVE",
  },
  {
    title: "공모전 수상작 포트폴리오 자료집",
    category: "포트폴리오",
    url: "https://drive.google.com/drive/folders/EXAMPLE-PORTFOLIO-BOOK",
  },
];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // skip
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export async function getResources(): Promise<ResourceItem[]> {
  const csvUrl = process.env.RESOURCES_SHEET_CSV_URL;
  if (!csvUrl) {
    return SAMPLE_RESOURCES;
  }
  try {
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) return SAMPLE_RESOURCES;
    const text = await res.text();
    const rows = parseCsv(text);
    if (rows.length === 0) return SAMPLE_RESOURCES;

    const [header, ...body] = rows;
    const lower = header.map((h) => h.trim().toLowerCase());
    const titleIdx = lower.findIndex((h) => h.includes("제목") || h.includes("title"));
    const categoryIdx = lower.findIndex((h) => h.includes("분류") || h.includes("category"));
    const urlIdx = lower.findIndex((h) => h.includes("링크") || h.includes("url") || h.includes("link"));

    const items: ResourceItem[] = body
      .map((r) => ({
        title: r[titleIdx >= 0 ? titleIdx : 0]?.trim() ?? "",
        category: r[categoryIdx >= 0 ? categoryIdx : 1]?.trim() ?? "자료",
        url: r[urlIdx >= 0 ? urlIdx : 2]?.trim() ?? "",
      }))
      .filter((item) => item.title && item.url);

    return items.length > 0 ? items : SAMPLE_RESOURCES;
  } catch {
    return SAMPLE_RESOURCES;
  }
}
