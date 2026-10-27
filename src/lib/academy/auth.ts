import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findStudentById, getSettings, type Student } from "@/lib/academy/store";

// 온라인 강의실의 수강생 · 관리자 세션 (서명 쿠키).
// 협회 회원 세션(kcca_session)과는 별개의 쿠키를 사용합니다.

const SECRET = process.env.SESSION_SECRET || "kcca-demo-secret-change-me";
export const STUDENT_COOKIE = "class_session";
export const ADMIN_COOKIE = "class_admin";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";
export const USING_DEFAULT_ADMIN_PASSWORD = !process.env.ADMIN_PASSWORD;

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

function seal(payload: object): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function unseal<T>(value: string | undefined): T | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as T;
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// ── 수강생 ──────────────────────────────────────────────────────

interface StudentToken {
  id: string;
  sid: string;
}

export function setStudentCookie(res: NextResponse, id: string, sid: string): void {
  res.cookies.set(STUDENT_COOKIE, seal({ id, sid } satisfies StudentToken), {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearCookie(res: NextResponse, name: string): void {
  res.cookies.set(name, "", { ...COOKIE_BASE, maxAge: 0 });
}

export type StudentState =
  | { status: "guest" }
  | { status: "replaced" } // 다른 기기에서 로그인하여 이 기기는 로그아웃됨
  | { status: "inactive" }
  | { status: "ok"; student: Student };

// 쿠키만 믿지 않고 매 요청마다 저장소의 계정 상태(정지 여부, 최신 세션 id)를 확인합니다.
export async function getStudentState(): Promise<StudentState> {
  const store = await cookies();
  const token = unseal<StudentToken>(store.get(STUDENT_COOKIE)?.value);
  if (!token) return { status: "guest" };
  const student = findStudentById(token.id);
  if (!student) return { status: "guest" };
  if (!student.active) return { status: "inactive" };
  if (getSettings().singleSession && student.sessionId !== token.sid) {
    return { status: "replaced" };
  }
  return { status: "ok", student };
}

export async function getStudent(): Promise<Student | null> {
  const state = await getStudentState();
  return state.status === "ok" ? state.student : null;
}

// ── 관리자 ──────────────────────────────────────────────────────

export function checkAdminCredentials(username: string, password: string): boolean {
  // 두 비교를 모두 수행하여 어느 쪽이 틀렸는지 응답 시간으로 드러나지 않게 합니다.
  const okUser = safeEqual(username, ADMIN_USERNAME);
  const okPass = safeEqual(password, ADMIN_PASSWORD);
  return okUser && okPass;
}

// 관리자 비밀번호가 바뀌면 기존 관리자 쿠키도 자동으로 무효가 되도록 비밀번호에서 파생한 값을 넣습니다.
const adminFingerprint = () => sign(`admin:${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).slice(0, 16);

export function setAdminCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE, seal({ admin: adminFingerprint() }), {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 12,
  });
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = unseal<{ admin: string }>(store.get(ADMIN_COOKIE)?.value);
  return token?.admin === adminFingerprint();
}

// 관리자 API 공통 가드 — 로그인하지 않았으면 401 응답을 돌려줍니다.
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
}
