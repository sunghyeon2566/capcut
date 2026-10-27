import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// 온라인 강의실(녹화본 제공) 전용 JSON 파일 저장소입니다.
// 협회 회원(data/members.json)과는 별도로 수강생 계정 · 과목 · 카테고리 · 영상을 보관합니다.
// 수강생 개인정보가 담기므로 data/academy.json 은 git 에 올리지 않습니다(.gitignore).
// 수강생이 많아지면 PostgreSQL/MySQL 등 실제 데이터베이스로 교체하는 것을 권장합니다.

export interface Student {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  phone: string;
  // 시청을 허용한 과목 id 목록 (과목 공개 범위가 "승인된 수강생만" 일 때 사용)
  subjectIds: string[];
  active: boolean;
  // 마지막으로 로그인한 기기의 세션 id — 다른 기기에서 로그인하면 이전 기기는 로그아웃됩니다.
  sessionId: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export type SubjectAccess = "all" | "approved";

export interface Subject {
  id: string;
  slug: string;
  name: string;
  description: string;
  access: SubjectAccess;
  // 강의실 홈(/class) 과목 목록에 표시할지 여부. 숨겨도 과목 링크로는 들어올 수 있습니다.
  listed: boolean;
  order: number;
  createdAt: string;
}

export interface Category {
  id: string;
  subjectId: string;
  name: string;
  order: number;
}

export type VideoSource =
  | { type: "file"; file: string; size: number; mime: string }
  | { type: "youtube"; youtubeId: string };

export interface Video {
  id: string;
  subjectId: string;
  categoryId: string;
  title: string;
  description: string;
  source: VideoSource;
  order: number;
  createdAt: string;
}

export interface SecuritySettings {
  // 영상 위에 수강생 이름 · 아이디 · 전화번호 뒷자리를 떠다니게 표시
  watermark: boolean;
  // 한 계정은 한 기기에서만 로그인 유지
  singleSession: boolean;
}

interface DbShape {
  students: Student[];
  subjects: Subject[];
  categories: Category[];
  videos: Video[];
  settings: SecuritySettings;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "academy.json");
export const VIDEO_DIR = path.join(DATA_DIR, "videos");

const DEFAULT_SETTINGS: SecuritySettings = {
  watermark: true,
  singleSession: true,
};

function emptyDb(): DbShape {
  return { students: [], subjects: [], categories: [], videos: [], settings: DEFAULT_SETTINGS };
}

function readDb(): DbShape {
  if (!fs.existsSync(DATA_FILE)) return emptyDb();
  try {
    const db = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Partial<DbShape>;
    return {
      ...emptyDb(),
      ...db,
      settings: { ...DEFAULT_SETTINGS, ...db.settings },
    };
  } catch {
    return emptyDb();
  }
}

// 임시 파일에 쓴 뒤 교체하여, 저장 도중 서버가 꺼져도 파일이 깨지지 않도록 합니다.
function writeDb(db: DbShape): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function update<T>(fn: (db: DbShape) => T): T {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(4).toString("hex")}`;
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

// ── 입력값 규칙 ──────────────────────────────────────────────────

export const USERNAME_RULE = /^[a-z0-9_]{4,20}$/;
export const SLUG_RULE = /^[a-z0-9][a-z0-9-]{0,39}$/;
export const PASSWORD_MIN = 6;

// 숫자만 남겨 010-1234-5678 형태로 맞춥니다. 휴대폰 번호가 아니면 null.
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!/^01[016789]\d{7,8}$/.test(digits)) return null;
  return digits.length === 11
    ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ── 수강생 ──────────────────────────────────────────────────────

export function getStudents(): Student[] {
  return [...readDb().students].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findStudentById(id: string): Student | undefined {
  return readDb().students.find((s) => s.id === id);
}

export function findStudentByUsername(username: string): Student | undefined {
  const u = username.trim().toLowerCase();
  return readDb().students.find((s) => s.username === u);
}

export function createStudent(input: {
  username: string;
  password: string;
  name: string;
  phone: string;
}): Student {
  return update((db) => {
    const username = input.username.trim().toLowerCase();
    if (db.students.some((s) => s.username === username)) throw new Error("USERNAME_TAKEN");
    if (db.students.some((s) => s.phone === input.phone)) throw new Error("PHONE_TAKEN");
    const student: Student = {
      id: newId("st"),
      username,
      passwordHash: bcrypt.hashSync(input.password, 10),
      name: input.name.trim(),
      phone: input.phone,
      subjectIds: [],
      active: true,
      sessionId: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    db.students.push(student);
    return student;
  });
}

export function verifyStudentPassword(student: Student, password: string): boolean {
  return bcrypt.compareSync(password, student.passwordHash);
}

// 로그인 시 새 세션 id 를 발급합니다. 이전 기기의 세션은 이 시점에 무효가 됩니다.
export function startStudentSession(id: string): string {
  return update((db) => {
    const s = db.students.find((x) => x.id === id);
    if (!s) throw new Error("NOT_FOUND");
    s.sessionId = crypto.randomBytes(16).toString("hex");
    s.lastLoginAt = new Date().toISOString();
    return s.sessionId;
  });
}

export function updateStudent(
  id: string,
  patch: Partial<Pick<Student, "name" | "phone" | "active" | "subjectIds">> & { password?: string }
): Student {
  return update((db) => {
    const s = db.students.find((x) => x.id === id);
    if (!s) throw new Error("NOT_FOUND");
    if (patch.phone !== undefined && db.students.some((x) => x.id !== id && x.phone === patch.phone)) {
      throw new Error("PHONE_TAKEN");
    }
    if (patch.name !== undefined) s.name = patch.name.trim();
    if (patch.phone !== undefined) s.phone = patch.phone;
    if (patch.subjectIds !== undefined) s.subjectIds = patch.subjectIds;
    if (patch.active !== undefined) {
      s.active = patch.active;
      if (!patch.active) s.sessionId = null;
    }
    if (patch.password !== undefined) {
      s.passwordHash = bcrypt.hashSync(patch.password, 10);
      s.sessionId = null;
    }
    return s;
  });
}

export function deleteStudent(id: string): void {
  update((db) => {
    db.students = db.students.filter((s) => s.id !== id);
  });
}

// ── 과목 ────────────────────────────────────────────────────────

export function getSubjects(): Subject[] {
  return [...readDb().subjects].sort(byOrder);
}

export function findSubjectBySlug(slug: string): Subject | undefined {
  return readDb().subjects.find((s) => s.slug === slug);
}

export function findSubjectById(id: string): Subject | undefined {
  return readDb().subjects.find((s) => s.id === id);
}

export function createSubject(input: {
  name: string;
  slug: string;
  description: string;
  access: SubjectAccess;
  listed: boolean;
}): Subject {
  return update((db) => {
    if (db.subjects.some((s) => s.slug === input.slug)) throw new Error("SLUG_TAKEN");
    const subject: Subject = {
      id: newId("sb"),
      slug: input.slug,
      name: input.name.trim(),
      description: input.description.trim(),
      access: input.access,
      listed: input.listed,
      order: Math.max(0, ...db.subjects.map((s) => s.order)) + 1,
      createdAt: new Date().toISOString(),
    };
    db.subjects.push(subject);
    return subject;
  });
}

export function updateSubject(
  id: string,
  patch: Partial<Pick<Subject, "name" | "slug" | "description" | "access" | "listed">>
): Subject {
  return update((db) => {
    const s = db.subjects.find((x) => x.id === id);
    if (!s) throw new Error("NOT_FOUND");
    if (patch.slug !== undefined && db.subjects.some((x) => x.id !== id && x.slug === patch.slug)) {
      throw new Error("SLUG_TAKEN");
    }
    Object.assign(s, patch);
    return s;
  });
}

// 과목을 지우면 그 안의 카테고리 · 영상(파일 포함)도 함께 지웁니다.
export function deleteSubject(id: string): void {
  update((db) => {
    db.videos.filter((v) => v.subjectId === id).forEach(removeVideoFile);
    db.videos = db.videos.filter((v) => v.subjectId !== id);
    db.categories = db.categories.filter((c) => c.subjectId !== id);
    db.subjects = db.subjects.filter((s) => s.id !== id);
    for (const st of db.students) st.subjectIds = st.subjectIds.filter((x) => x !== id);
  });
}

export function canStudentView(student: Student, subject: Subject): boolean {
  return student.active && (subject.access === "all" || student.subjectIds.includes(subject.id));
}

// ── 카테고리 ────────────────────────────────────────────────────

export function getCategories(subjectId: string): Category[] {
  return readDb().categories.filter((c) => c.subjectId === subjectId).sort(byOrder);
}

export function findCategoryById(id: string): Category | undefined {
  return readDb().categories.find((c) => c.id === id);
}

export function createCategory(subjectId: string, name: string): Category {
  return update((db) => {
    if (!db.subjects.some((s) => s.id === subjectId)) throw new Error("NOT_FOUND");
    const siblings = db.categories.filter((c) => c.subjectId === subjectId);
    const category: Category = {
      id: newId("ct"),
      subjectId,
      name: name.trim(),
      order: Math.max(0, ...siblings.map((c) => c.order)) + 1,
    };
    db.categories.push(category);
    return category;
  });
}

export function renameCategory(id: string, name: string): void {
  update((db) => {
    const c = db.categories.find((x) => x.id === id);
    if (!c) throw new Error("NOT_FOUND");
    c.name = name.trim();
  });
}

// 같은 묶음(과목 안의 카테고리, 카테고리 안의 영상) 안에서 바로 위/아래 항목과 순서를 맞바꿉니다.
function swapOrder<T extends { id: string; order: number }>(list: T[], id: string, dir: "up" | "down") {
  const sorted = [...list].sort(byOrder);
  const i = sorted.findIndex((x) => x.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= sorted.length) return;
  sorted.forEach((x, k) => (x.order = k + 1));
  [sorted[i].order, sorted[j].order] = [sorted[j].order, sorted[i].order];
}

export function moveCategory(id: string, dir: "up" | "down"): void {
  update((db) => {
    const c = db.categories.find((x) => x.id === id);
    if (!c) throw new Error("NOT_FOUND");
    swapOrder(db.categories.filter((x) => x.subjectId === c.subjectId), id, dir);
  });
}

export function deleteCategory(id: string): void {
  update((db) => {
    db.videos.filter((v) => v.categoryId === id).forEach(removeVideoFile);
    db.videos = db.videos.filter((v) => v.categoryId !== id);
    db.categories = db.categories.filter((c) => c.id !== id);
  });
}

// ── 영상 ────────────────────────────────────────────────────────

export function getVideosBySubject(subjectId: string): Video[] {
  return readDb().videos.filter((v) => v.subjectId === subjectId).sort(byOrder);
}

export function getVideoCount(): number {
  return readDb().videos.length;
}

export function findVideoById(id: string): Video | undefined {
  return readDb().videos.find((v) => v.id === id);
}

export function createVideo(input: {
  id?: string;
  categoryId: string;
  title: string;
  description: string;
  source: VideoSource;
}): Video {
  return update((db) => {
    const category = db.categories.find((c) => c.id === input.categoryId);
    if (!category) throw new Error("NOT_FOUND");
    const siblings = db.videos.filter((v) => v.categoryId === category.id);
    const video: Video = {
      id: input.id ?? newId("vd"),
      subjectId: category.subjectId,
      categoryId: category.id,
      title: input.title.trim(),
      description: input.description.trim(),
      source: input.source,
      order: Math.max(0, ...siblings.map((v) => v.order)) + 1,
      createdAt: new Date().toISOString(),
    };
    db.videos.push(video);
    return video;
  });
}

export function updateVideo(
  id: string,
  patch: { title?: string; description?: string; categoryId?: string }
): void {
  update((db) => {
    const v = db.videos.find((x) => x.id === id);
    if (!v) throw new Error("NOT_FOUND");
    if (patch.title !== undefined) v.title = patch.title.trim();
    if (patch.description !== undefined) v.description = patch.description.trim();
    if (patch.categoryId !== undefined && patch.categoryId !== v.categoryId) {
      const target = db.categories.find((c) => c.id === patch.categoryId);
      if (!target || target.subjectId !== v.subjectId) throw new Error("NOT_FOUND");
      v.categoryId = target.id;
      v.order = Math.max(0, ...db.videos.filter((x) => x.categoryId === target.id).map((x) => x.order)) + 1;
    }
  });
}

export function moveVideo(id: string, dir: "up" | "down"): void {
  update((db) => {
    const v = db.videos.find((x) => x.id === id);
    if (!v) throw new Error("NOT_FOUND");
    swapOrder(db.videos.filter((x) => x.categoryId === v.categoryId), id, dir);
  });
}

export function deleteVideo(id: string): void {
  update((db) => {
    const v = db.videos.find((x) => x.id === id);
    if (v) removeVideoFile(v);
    db.videos = db.videos.filter((x) => x.id !== id);
  });
}

export function videoFilePath(file: string): string {
  // 저장 시 만든 파일명만 허용하여 data/videos 바깥 경로 접근을 막습니다.
  return path.join(VIDEO_DIR, path.basename(file));
}

function removeVideoFile(v: Video): void {
  if (v.source.type !== "file") return;
  fs.rmSync(videoFilePath(v.source.file), { force: true });
}

// ── 보안 설정 ───────────────────────────────────────────────────

export function getSettings(): SecuritySettings {
  return readDb().settings;
}

export function updateSettings(patch: Partial<SecuritySettings>): SecuritySettings {
  return update((db) => {
    db.settings = { ...db.settings, ...patch };
    return db.settings;
  });
}
