"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BADGES, emptyProduct, type Product, type PublicShop, type ShopDesign } from "@/lib/shop-types";
import { hasContent, Storefront } from "@/components/shop/storefront";

const COLOR_PRESETS = ["#111111", "#e5484d", "#ff6b8b", "#f97316", "#16a34a", "#2563eb", "#7c3aed", "#8b5e3c"];

type Tab = "design" | "products" | "account";

// 업로드 전에 큰 사진은 가로·세로 최대 1600px JPEG 로 줄여 용량을 아낍니다.
async function shrinkImage(file: File): Promise<Blob> {
  if (file.type === "image/gif" || file.size < 600 * 1024) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  return blob && blob.size < file.size ? blob : file;
}

export function ShopEditor({ initialShop }: { initialShop: PublicShop }) {
  const router = useRouter();
  const [design, setDesign] = useState<ShopDesign>(initialShop.design);
  const [products, setProducts] = useState<Product[]>(initialShop.products);
  const [tab, setTab] = useState<Tab>("products");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const slug = initialShop.slug;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function updateDesign<K extends keyof ShopDesign>(key: K, value: ShopDesign[K]) {
    setDesign((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  function updateProduct(index: number, patch: Partial<Product>) {
    setProducts((list) => list.map((p, i) => (i === index ? { ...p, ...patch } : p)));
    setDirty(true);
  }

  function moveProduct(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= products.length) return;
    setProducts((list) => {
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  }

  async function upload(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", await shrinkImage(file), file.name);
    const res = await fetch(`/api/shop/${slug}/upload`, { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error ?? "이미지 업로드에 실패했습니다.");
      return null;
    }
    return data.url as string;
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/shop/${slug}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design, products }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "저장에 실패했습니다.");
      setDesign(data.shop.design);
      setProducts(data.shop.products);
      setDirty(false);
      setMessage({ ok: true, text: "저장되었습니다. 쇼핑몰에 바로 반영됩니다." });
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (dirty && !confirm("저장하지 않은 변경사항이 있습니다. 로그아웃할까요?")) return;
    await fetch(`/api/shop/${slug}/logout`, { method: "POST" });
    setDirty(false);
    router.refresh();
  }

  const filled = products.filter(hasContent).length;

  return (
    <div className="flex h-screen flex-col bg-neutral-100">
      <header className="shrink-0 border-b border-neutral-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <div className="min-w-0">
            <span className="text-[11px] font-bold tracking-wide text-neutral-400">수강생 관리자</span>
            <h1 className="truncate text-lg font-extrabold leading-tight tracking-tight">{initialShop.name}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={`/shop/${slug}`} target="_blank" className="shop-btn-light hidden sm:inline-flex">
              내 쇼핑몰 보기
            </a>
            <button onClick={handleLogout} className="shop-btn-light">로그아웃</button>
            <button onClick={handleSave} disabled={saving || !dirty} className="shop-btn-dark">
              {saving ? "저장 중..." : dirty ? "저장하기" : "저장됨"}
            </button>
          </div>
        </div>
        {message && (
          <p className={`px-4 pb-2 text-xs font-medium ${message.ok ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 편집 패널 */}
        <div className={`min-h-0 w-full flex-col bg-white lg:flex lg:w-[440px] lg:shrink-0 lg:border-r lg:border-neutral-200 ${showPreview ? "hidden" : "flex"}`}>
          <div className="flex shrink-0 border-b border-neutral-200 text-sm font-semibold">
            {(
              [
                ["products", `상품 관리 (${filled}/${products.length})`],
                ["design", "디자인"],
                ["account", "계정"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 border-b-2 py-3 ${tab === key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
            {tab === "products" && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-500">
                  이미지를 클릭하면 상품 링크로 이동합니다. 이미지나 상품명이 없는 칸은 쇼핑몰에 보이지 않습니다.
                </p>
                {products.map((p, i) => (
                  <ProductForm
                    key={i}
                    index={i}
                    product={p}
                    total={products.length}
                    onChange={(patch) => updateProduct(i, patch)}
                    onMove={(delta) => moveProduct(i, delta)}
                    onClear={() => {
                      if (confirm(`${i + 1}번 상품을 비울까요?`)) updateProduct(i, emptyProduct());
                    }}
                    upload={upload}
                  />
                ))}
              </div>
            )}

            {tab === "design" && <DesignForm design={design} onChange={updateDesign} upload={upload} />}

            {tab === "account" && <AccountForm slug={slug} />}
          </div>
        </div>

        {/* 실시간 미리보기 */}
        <div className={`min-h-0 flex-1 flex-col lg:flex ${showPreview ? "flex" : "hidden"}`}>
          <div className="hidden shrink-0 px-4 py-2 text-xs font-semibold text-neutral-500 lg:block">
            미리보기 — 저장하기 전까지는 쇼핑몰에 반영되지 않습니다
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto lg:mx-4 lg:mb-4 lg:rounded-lg lg:shadow-sm">
            <Storefront name={initialShop.name} design={design} products={products} />
          </div>
        </div>
      </div>

      {/* 모바일: 편집 / 미리보기 전환 */}
      <button
        onClick={() => setShowPreview((v) => !v)}
        className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-bold text-white shadow-lg lg:hidden"
      >
        {showPreview ? "편집으로 돌아가기" : "미리보기"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------

type Upload = (file: File) => Promise<string | null>;

function ImagePicker({
  value,
  onChange,
  upload,
  className,
  emptyLabel = "+ 이미지",
}: {
  value: string;
  onChange: (url: string) => void;
  upload: Upload;
  className: string;
  emptyLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const url = await upload(file);
    setBusy(false);
    if (url) onChange(url);
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={`relative flex items-center justify-center overflow-hidden rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-400 hover:border-neutral-500 ${className}`}
    >
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{emptyLabel}</span>
      )}
      {busy && (
        <span className="absolute inset-0 flex items-center justify-center bg-white/80 text-neutral-600">업로드 중</span>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleFile} />
    </button>
  );
}

function ProductForm({
  index,
  product,
  total,
  onChange,
  onMove,
  onClear,
  upload,
}: {
  index: number;
  product: Product;
  total: number;
  onChange: (patch: Partial<Product>) => void;
  onMove: (delta: number) => void;
  onClear: () => void;
  upload: Upload;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500">상품 {index + 1}</span>
        <div className="flex gap-1 text-xs text-neutral-500">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="rounded px-1.5 py-0.5 hover:bg-neutral-100 disabled:opacity-30" aria-label="위로">
            ▲
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="rounded px-1.5 py-0.5 hover:bg-neutral-100 disabled:opacity-30" aria-label="아래로">
            ▼
          </button>
          <button type="button" onClick={onClear} className="rounded px-1.5 py-0.5 hover:bg-neutral-100">
            비우기
          </button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="shrink-0">
          <ImagePicker value={product.image} onChange={(image) => onChange({ image })} upload={upload} className="h-24 w-24" />
          {product.image && (
            <button type="button" onClick={() => onChange({ image: "" })} className="mt-1 w-24 text-center text-[11px] text-neutral-400 hover:text-red-500">
              이미지 삭제
            </button>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            className="shop-input"
            value={product.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="상품명"
            maxLength={80}
          />
          <div className="grid grid-cols-2 gap-2">
            <PriceInput value={product.price} onChange={(price) => onChange({ price })} placeholder="판매가" />
            <PriceInput value={product.originalPrice} onChange={(originalPrice) => onChange({ originalPrice })} placeholder="정가 (할인 시)" />
          </div>
          <div className="flex gap-2">
            <select
              className="shop-input w-24 shrink-0"
              value={product.badge}
              onChange={(e) => onChange({ badge: e.target.value as Product["badge"] })}
            >
              {BADGES.map((b) => (
                <option key={b} value={b}>{b || "배지 없음"}</option>
              ))}
            </select>
            <input
              className="shop-input"
              value={product.link}
              onChange={(e) => onChange({ link: e.target.value })}
              placeholder="클릭 시 이동할 링크 (https://...)"
            />
          </div>
        </div>
      </div>
      <input
        className="shop-input mt-2 text-xs"
        value={product.image.startsWith("/api/") ? "" : product.image}
        onChange={(e) => onChange({ image: e.target.value.trim() })}
        placeholder="또는 이미지 주소(URL) 붙여넣기"
      />
    </div>
  );
}

function PriceInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        className="shop-input pr-7"
        inputMode="numeric"
        value={value === null ? "" : value.toLocaleString("ko-KR")}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, "");
          onChange(digits ? Number(digits) : null);
        }}
        placeholder={placeholder}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">원</span>
    </div>
  );
}

function DesignForm({
  design,
  onChange,
  upload,
}: {
  design: ShopDesign;
  onChange: <K extends keyof ShopDesign>(key: K, value: ShopDesign[K]) => void;
  upload: Upload;
}) {
  return (
    <div className="space-y-6">
      <Group title="테마 색상" hint="상단 공지 띠, 배지, 메뉴 강조에 쓰입니다.">
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange("primaryColor", c)}
              className={`h-8 w-8 rounded-full ring-offset-2 ${design.primaryColor.toLowerCase() === c ? "ring-2 ring-neutral-900" : ""}`}
              style={{ background: c }}
              aria-label={c}
            />
          ))}
          <label className="ml-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <input
              type="color"
              value={design.primaryColor}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            직접 선택
          </label>
        </div>
      </Group>

      <Group title="상단 공지" hint="비워 두면 공지 띠가 숨겨집니다.">
        <input className="shop-input" value={design.noticeText} onChange={(e) => onChange("noticeText", e.target.value)} maxLength={120} placeholder="예) 전 상품 무료배송" />
      </Group>

      <Group title="로고 이미지" hint="없으면 상호가 글자로 표시됩니다. 가로로 긴 투명 PNG 를 추천합니다.">
        <div className="flex items-end gap-2">
          <ImagePicker value={design.logoImage} onChange={(v) => onChange("logoImage", v)} upload={upload} className="h-16 w-40" emptyLabel="+ 로고 올리기" />
          {design.logoImage && (
            <button type="button" onClick={() => onChange("logoImage", "")} className="text-xs text-neutral-400 hover:text-red-500">삭제</button>
          )}
        </div>
      </Group>

      <Group title="메인 배너" hint="이미지가 없으면 테마 색상으로 채워집니다. 가로로 긴 사진(약 21:8)을 추천합니다.">
        <div className="flex items-end gap-2">
          <ImagePicker value={design.bannerImage} onChange={(v) => onChange("bannerImage", v)} upload={upload} className="aspect-[21/8] w-full" emptyLabel="+ 배너 이미지 올리기" />
          {design.bannerImage && (
            <button type="button" onClick={() => onChange("bannerImage", "")} className="shrink-0 text-xs text-neutral-400 hover:text-red-500">삭제</button>
          )}
        </div>
        <input className="shop-input mt-2" value={design.bannerTitle} onChange={(e) => onChange("bannerTitle", e.target.value)} maxLength={60} placeholder="배너 제목" />
        <input className="shop-input mt-2" value={design.bannerSubtitle} onChange={(e) => onChange("bannerSubtitle", e.target.value)} maxLength={120} placeholder="배너 문구" />
      </Group>

      <Group title="상품 영역">
        <input className="shop-input" value={design.sectionTitle} onChange={(e) => onChange("sectionTitle", e.target.value)} maxLength={40} placeholder="제목 (예: BEST ITEMS)" />
        <input className="shop-input mt-2" value={design.sectionSubtitle} onChange={(e) => onChange("sectionSubtitle", e.target.value)} maxLength={80} placeholder="부제목" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <span className="mb-1 block text-xs text-neutral-500">한 줄 상품 수 (PC)</span>
            <Segmented
              options={[[3, "3개"], [4, "4개"], [5, "5개"]]}
              value={design.columns}
              onChange={(v) => onChange("columns", v)}
            />
          </div>
          <div>
            <span className="mb-1 block text-xs text-neutral-500">이미지 비율</span>
            <Segmented
              options={[["square", "정사각"], ["portrait", "세로형"]]}
              value={design.imageRatio}
              onChange={(v) => onChange("imageRatio", v)}
            />
          </div>
        </div>
      </Group>

      <Group title="하단 정보" hint="상호, 대표자, 사업자등록번호, 연락처, 주소 등을 적어 주세요.">
        <textarea
          className="shop-input min-h-28"
          value={design.footerText}
          onChange={(e) => onChange("footerText", e.target.value)}
          maxLength={500}
          placeholder={"대표: 홍길동 | 사업자등록번호: 000-00-00000\n고객센터: 010-0000-0000 | 평일 10:00~17:00"}
        />
      </Group>
    </div>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: [T, string][];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-md bg-neutral-100 p-0.5 text-xs font-semibold">
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 rounded py-1.5 ${value === v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-bold">{title}</h3>
      {hint && <p className="mb-2 mt-0.5 text-xs text-neutral-500">{hint}</p>}
      <div className={hint ? "" : "mt-2"}>{children}</div>
    </section>
  );
}

function AccountForm({ slug }: { slug: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/shop/${slug}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setCurrent("");
      setNext("");
      setMessage({ ok: true, text: "비밀번호가 변경되었습니다." });
    } else {
      setMessage({ ok: false, text: data.error ?? "변경에 실패했습니다." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Group title="비밀번호 변경" hint="비밀번호를 잊어버리면 강사님께 재설정을 요청해 주세요.">
        <input type="password" className="shop-input" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="현재 비밀번호" required />
        <input type="password" className="shop-input mt-2" value={next} onChange={(e) => setNext(e.target.value)} placeholder="새 비밀번호 (4자 이상)" required />
      </Group>
      {message && <p className={`text-xs ${message.ok ? "text-green-600" : "text-red-600"}`}>{message.text}</p>}
      <button type="submit" className="shop-btn-dark">변경하기</button>
    </form>
  );
}
