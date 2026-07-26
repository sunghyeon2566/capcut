import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type { Region } from "@/lib/regions";

// 간단한 JSON 파일 기반 로컬 저장소입니다.
// 데모/전달용 사이트에 적합한 방식이며, 실서비스 운영 시에는
// PostgreSQL/MySQL 등 실제 데이터베이스로 교체하는 것을 권장합니다.

export interface Member {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  region: Region | string;
  createdAt: string;
}

interface DbShape {
  members: Member[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "members.json");

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ members: [] }, null, 2));
  }
}

function readDb(): DbShape {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw) as DbShape;
  } catch {
    return { members: [] };
  }
}

function writeDb(db: DbShape): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export function getAllMembers(): Member[] {
  return readDb().members;
}

export function findMemberByEmail(email: string): Member | undefined {
  const normalized = email.trim().toLowerCase();
  return readDb().members.find((m) => m.email.toLowerCase() === normalized);
}

export function findMemberById(id: string): Member | undefined {
  return readDb().members.find((m) => m.id === id);
}

export interface CreateMemberInput {
  name: string;
  email: string;
  password: string;
  region: string;
}

export function createMember(input: CreateMemberInput): Member {
  const db = readDb();
  const exists = db.members.some(
    (m) => m.email.toLowerCase() === input.email.trim().toLowerCase()
  );
  if (exists) {
    throw new Error("EMAIL_TAKEN");
  }
  const member: Member = {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(input.password, 10),
    region: input.region,
    createdAt: new Date().toISOString(),
  };
  db.members.push(member);
  writeDb(db);
  return member;
}

export function verifyPassword(member: Member, password: string): boolean {
  return bcrypt.compareSync(password, member.passwordHash);
}

// 지역(시/도)별 회원 수 집계. /map 페이지와 /api/members/by-region 에서 사용합니다.
// 캐싱 없이 매 요청마다 파일을 다시 읽으므로 회원가입 즉시 실시간으로 반영됩니다.
export function getMemberCountsByRegion(): Record<string, number> {
  const members = getAllMembers();
  const counts: Record<string, number> = {};
  for (const m of members) {
    counts[m.region] = (counts[m.region] ?? 0) + 1;
  }
  return counts;
}

export function getTotalMemberCount(): number {
  return getAllMembers().length;
}
