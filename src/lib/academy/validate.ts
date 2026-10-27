import { SLUG_RULE, type SubjectAccess } from "@/lib/academy/store";

// 과목 페이지 주소로 쓸 수 없는 예약어 (/class/login 등과 겹치지 않도록)
const RESERVED_SLUGS = new Set(["login", "signup", "logout", "api", "admin"]);

export interface SubjectInput {
  name?: string;
  slug?: string;
  description?: string;
  access?: SubjectAccess;
  listed?: boolean;
}

// 과목 생성(requireAll=true) · 수정(false) 요청 본문 검사
export function parseSubjectInput(
  body: unknown,
  requireAll: boolean
): SubjectInput | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const out: SubjectInput = {};

  if (b.name !== undefined || requireAll) {
    const name = typeof b.name === "string" ? b.name.trim() : "";
    if (!name) return { error: "과목 이름을 입력해 주세요." };
    out.name = name;
  }
  if (b.slug !== undefined || requireAll) {
    const slug = typeof b.slug === "string" ? b.slug.trim().toLowerCase() : "";
    if (!SLUG_RULE.test(slug) || RESERVED_SLUGS.has(slug)) {
      return { error: "페이지 주소는 영문 소문자·숫자·하이픈(-)으로 입력해 주세요. (예: math)" };
    }
    out.slug = slug;
  }
  if (typeof b.description === "string") out.description = b.description.trim();
  if (b.access === "all" || b.access === "approved") out.access = b.access;
  if (typeof b.listed === "boolean") out.listed = b.listed;
  return out;
}

// 유튜브 주소(watch / youtu.be / shorts / embed / live)에서 영상 id 를 뽑아냅니다.
export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const url = new URL(s);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
