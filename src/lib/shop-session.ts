import crypto from "crypto";
import { cookies } from "next/headers";

// 쇼핑몰 빌더 전용 세션입니다. 협회 회원 세션(session.ts)과 같은 서명 쿠키 방식이며,
// 강사 관리자와 수강생 관리자는 서로 다른 쿠키를 사용합니다.

const SECRET = process.env.SESSION_SECRET || "kcca-demo-secret-change-me";

export const INSTRUCTOR_COOKIE = "shop_instructor_session";
export const STUDENT_COOKIE = "shop_student_session";

// 강사 관리자 비밀번호. 운영 시 반드시 환경변수 SHOP_ADMIN_PASSWORD 로 변경하세요.
export const INSTRUCTOR_PASSWORD = process.env.SHOP_ADMIN_PASSWORD || "admin1234";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSignedValue(payload: object): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function parseSignedValue<T>(value: string | undefined): T | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature || signature !== sign(encoded)) return null;
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as T;
  } catch {
    return null;
  }
}

export function checkInstructorPassword(password: string): boolean {
  const a = Buffer.from(sign(password));
  const b = Buffer.from(sign(INSTRUCTOR_PASSWORD));
  return crypto.timingSafeEqual(a, b);
}

export async function isInstructor(): Promise<boolean> {
  const store = await cookies();
  return parseSignedValue<{ role: string }>(store.get(INSTRUCTOR_COOKIE)?.value)?.role === "instructor";
}

// 로그인한 수강생의 쇼핑몰 id. 로그인하지 않았으면 null.
export async function getStudentShopId(): Promise<string | null> {
  const store = await cookies();
  return parseSignedValue<{ shopId: string }>(store.get(STUDENT_COOKIE)?.value)?.shopId ?? null;
}
