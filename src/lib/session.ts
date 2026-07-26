import crypto from "crypto";
import { cookies } from "next/headers";

// 매우 단순한 서명 쿠키 기반 세션 구현입니다.
// 운영 환경에서는 iron-session, next-auth 등 검증된 라이브러리 사용을 권장합니다.

const SESSION_COOKIE = "kcca_session";
const SECRET = process.env.SESSION_SECRET || "kcca-demo-secret-change-me";

interface SessionPayload {
  memberId: string;
  email: string;
  name: string;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSessionValue(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const encoded = Buffer.from(json, "utf-8").toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function parseSessionValue(value: string | undefined): SessionPayload | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (signature !== expected) return null;
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf-8");
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  return parseSessionValue(raw);
}
