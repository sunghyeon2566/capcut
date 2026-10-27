import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// 쇼핑몰 빌더용 JSON 파일 저장소입니다. (data/shops.json)
// 강사가 상호를 등록하면 쇼핑몰이 하나 생성되고, 수강생은 자기 쇼핑몰의
// 디자인과 15개 상품 슬롯을 관리합니다.
// 실서비스 운영 시에는 회원 저장소(store.ts)와 마찬가지로 실제 DB 로 교체를 권장합니다.

import {
  BADGES,
  defaultDesign,
  emptyProduct,
  PRODUCT_SLOTS,
  type Product,
  type PublicShop,
  type Shop,
  type ShopDesign,
} from "@/lib/shop-types";

export * from "@/lib/shop-types";

interface DbShape {
  shops: Shop[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "shops.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ shops: [] }, null, 2));
  }
}

function readDb(): DbShape {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as DbShape;
  } catch {
    return { shops: [] };
  }
}

function writeDb(db: DbShape): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export function getAllShops(): Shop[] {
  return readDb().shops;
}

export function findShopBySlug(slug: string): Shop | undefined {
  return readDb().shops.find((s) => s.slug === slug);
}

export function findShopById(id: string): Shop | undefined {
  return readDb().shops.find((s) => s.id === id);
}

export interface CreateShopInput {
  name: string;
  slug: string;
  studentName: string;
  password: string;
}

export function createShop(input: CreateShopInput): Shop {
  const db = readDb();
  if (db.shops.some((s) => s.slug === input.slug)) {
    throw new Error("SLUG_TAKEN");
  }
  const now = new Date().toISOString();
  const name = input.name.trim();
  const shop: Shop = {
    id: `s_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    slug: input.slug,
    name,
    studentName: input.studentName.trim(),
    passwordHash: bcrypt.hashSync(input.password, 10),
    createdAt: now,
    updatedAt: now,
    design: defaultDesign(name),
    products: Array.from({ length: PRODUCT_SLOTS }, emptyProduct),
  };
  db.shops.push(shop);
  writeDb(db);
  return shop;
}

function updateShop(id: string, mutate: (shop: Shop) => void): Shop {
  const db = readDb();
  const shop = db.shops.find((s) => s.id === id);
  if (!shop) throw new Error("NOT_FOUND");
  mutate(shop);
  shop.updatedAt = new Date().toISOString();
  writeDb(db);
  return shop;
}

export function updateShopInfo(
  id: string,
  info: { name?: string; studentName?: string; password?: string }
): Shop {
  return updateShop(id, (shop) => {
    if (info.name) shop.name = info.name.trim();
    if (info.studentName !== undefined) shop.studentName = info.studentName.trim();
    if (info.password) shop.passwordHash = bcrypt.hashSync(info.password, 10);
  });
}

export function updateShopContent(id: string, design: ShopDesign, products: Product[]): Shop {
  return updateShop(id, (shop) => {
    shop.design = design;
    shop.products = products;
  });
}

export function deleteShop(id: string): void {
  const db = readDb();
  db.shops = db.shops.filter((s) => s.id !== id);
  writeDb(db);
  fs.rmSync(path.join(UPLOAD_DIR, id), { recursive: true, force: true });
}

export function verifyShopPassword(shop: Shop, password: string): boolean {
  return bcrypt.compareSync(password, shop.passwordHash);
}

export function toPublicShop(shop: Shop): PublicShop {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = shop;
  return rest;
}

// ---- 수강생이 보낸 값 정리 ----

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function price(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), 1_000_000_000) : null;
}

// 이미지는 업로드 경로(/api/shop-images/...) 또는 http(s) 주소만 허용합니다.
function imageUrl(value: unknown): string {
  const v = str(value, 1000);
  return v.startsWith("/api/shop-images/") || /^https?:\/\//i.test(v) ? v : "";
}

// 상품 링크는 http(s) 주소만 허용합니다. (javascript: 등 차단)
function linkUrl(value: unknown): string {
  const v = str(value, 1000);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return /^[a-z][a-z0-9+.-]*:/i.test(v) ? "" : `https://${v}`;
}

export function sanitizeDesign(input: unknown, fallbackName: string): ShopDesign {
  const d = (input ?? {}) as Record<string, unknown>;
  const base = defaultDesign(fallbackName);
  const color = str(d.primaryColor, 7);
  const columns = Number(d.columns);
  return {
    primaryColor: /^#[0-9a-f]{6}$/i.test(color) ? color : base.primaryColor,
    noticeText: str(d.noticeText, 120),
    logoImage: imageUrl(d.logoImage),
    bannerImage: imageUrl(d.bannerImage),
    bannerTitle: str(d.bannerTitle, 60),
    bannerSubtitle: str(d.bannerSubtitle, 120),
    sectionTitle: str(d.sectionTitle, 40),
    sectionSubtitle: str(d.sectionSubtitle, 80),
    columns: columns === 3 || columns === 4 || columns === 5 ? columns : base.columns,
    imageRatio: d.imageRatio === "portrait" ? "portrait" : "square",
    footerText: str(d.footerText, 500),
  };
}

export function sanitizeProducts(input: unknown): Product[] {
  const list = Array.isArray(input) ? input : [];
  return Array.from({ length: PRODUCT_SLOTS }, (_, i) => {
    const p = (list[i] ?? {}) as Record<string, unknown>;
    const badge = BADGES.includes(p.badge as Product["badge"]) ? (p.badge as Product["badge"]) : "";
    return {
      name: str(p.name, 80),
      price: price(p.price),
      originalPrice: price(p.originalPrice),
      image: imageUrl(p.image),
      link: linkUrl(p.link),
      badge,
    };
  });
}
