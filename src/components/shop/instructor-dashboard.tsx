"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { PublicShop } from "@/lib/shop-types";
import { hasContent } from "@/components/shop/storefront";

interface InstructorDashboardProps {
  initialShops: PublicShop[];
}

function randomSlug(): string {
  return `shop${Math.floor(1000 + Math.random() * 9000)}`;
}

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "요청 처리 중 오류가 발생했습니다.");
  return data;
}

export function InstructorDashboard({ initialShops }: InstructorDashboardProps) {
  const router = useRouter();
  const [shops, setShops] = useState(initialShops);
  // 서버 렌더링 때는 빈 값, 브라우저에서는 현재 사이트 주소
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const [form, setForm] = useState({ name: "", slug: "", studentName: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const data = await api("/api/shop-admin/shops", "POST", form);
      setShops((prev) => [...prev, data.shop]);
      setForm({ name: "", slug: "", studentName: "", password: "" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function patchShop(shop: PublicShop, body: Record<string, string>, done: string) {
    try {
      const data = await api(`/api/shop-admin/shops/${shop.id}`, "PATCH", body);
      setShops((prev) => prev.map((s) => (s.id === shop.id ? data.shop : s)));
      alert(done);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  function handleRename(shop: PublicShop) {
    const name = prompt("새 상호를 입력해 주세요.", shop.name);
    if (name && name.trim() !== shop.name) {
      patchShop(shop, { name }, "상호가 변경되었습니다. 수강생 쇼핑몰에 바로 반영됩니다.");
    }
  }

  function handleResetPassword(shop: PublicShop) {
    const password = prompt(`'${shop.name}' 수강생의 새 비밀번호를 입력해 주세요. (4자 이상)`);
    if (password) patchShop(shop, { password }, "비밀번호가 재설정되었습니다.");
  }

  async function handleDelete(shop: PublicShop) {
    if (!confirm(`'${shop.name}' 쇼핑몰을 삭제할까요?\n등록된 상품과 이미지가 모두 삭제되며 되돌릴 수 없습니다.`)) return;
    try {
      await api(`/api/shop-admin/shops/${shop.id}`, "DELETE");
      setShops((prev) => prev.filter((s) => s.id !== shop.id));
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  async function handleLogout() {
    await fetch("/api/shop-admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <span className="text-[11px] font-bold tracking-wide text-neutral-400">강사 관리자</span>
            <h1 className="text-lg font-extrabold leading-tight tracking-tight">수강생 쇼핑몰 관리</h1>
          </div>
          <button onClick={handleLogout} className="shop-btn-light">로그아웃</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold">새 쇼핑몰 만들기</h2>
          <p className="mt-1 text-sm text-neutral-500">
            상호를 넣으면 쇼핑몰이 바로 만들어집니다. 쇼핑몰 주소와 비밀번호를 수강생에게 전달해 주세요.
          </p>
          <form onSubmit={handleCreate} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="상호 *">
              <input
                className="shop-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예) 봄날의 옷장"
                maxLength={30}
                required
              />
            </Field>
            <Field label="쇼핑몰 주소 (영문) *">
              <div className="flex gap-1.5">
                <input
                  className="shop-input"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="예) springcloset"
                  maxLength={30}
                  required
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, slug: randomSlug() })}
                  className="shop-btn-light shrink-0 px-3"
                >
                  자동
                </button>
              </div>
            </Field>
            <Field label="수강생 이름">
              <input
                className="shop-input"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                placeholder="예) 홍길동"
              />
            </Field>
            <Field label="수강생 비밀번호 *">
              <input
                className="shop-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="4자 이상"
                required
              />
            </Field>
            <div className="sm:col-span-2 lg:col-span-4">
              {form.slug && origin && (
                <p className="mb-3 text-xs text-neutral-500">
                  쇼핑몰 주소: <b className="text-neutral-800">{origin}/shop/{form.slug}</b>
                </p>
              )}
              {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={creating} className="shop-btn-dark">
                {creating ? "만드는 중..." : "쇼핑몰 만들기"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold">
            수강생 쇼핑몰 <span className="text-neutral-400">{shops.length}</span>
          </h2>
          {shops.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-400">아직 만든 쇼핑몰이 없습니다.</p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-100">
              {[...shops].reverse().map((shop) => {
                const shopUrl = `${origin}/shop/${shop.slug}`;
                const adminUrl = `${shopUrl}/admin`;
                const filled = shop.products.filter(hasContent).length;
                return (
                  <li key={shop.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="font-bold">
                        {shop.name}
                        {shop.studentName && (
                          <span className="ml-2 text-sm font-normal text-neutral-500">{shop.studentName} 수강생</span>
                        )}
                      </p>
                      <div className="mt-1 space-y-0.5 text-xs text-neutral-500">
                        <p>
                          쇼핑몰{" "}
                          <a href={`/shop/${shop.slug}`} target="_blank" className="text-neutral-800 underline">
                            {shopUrl}
                          </a>{" "}
                          <button onClick={() => copy(shopUrl)} className="ml-1 text-blue-600">
                            {copied === shopUrl ? "복사됨" : "복사"}
                          </button>
                        </p>
                        <p>
                          관리자{" "}
                          <a href={`/shop/${shop.slug}/admin`} target="_blank" className="text-neutral-800 underline">
                            {adminUrl}
                          </a>{" "}
                          <button onClick={() => copy(adminUrl)} className="ml-1 text-blue-600">
                            {copied === adminUrl ? "복사됨" : "복사"}
                          </button>
                        </p>
                        <p>
                          상품 {filled}/{shop.products.length} 등록 · 최근 수정{" "}
                          {new Date(shop.updatedAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <button onClick={() => handleRename(shop)} className="shop-btn-light">상호 변경</button>
                      <button onClick={() => handleResetPassword(shop)} className="shop-btn-light">비밀번호 재설정</button>
                      <button onClick={() => handleDelete(shop)} className="shop-btn-light text-red-600">삭제</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-neutral-600">{label}</span>
      {children}
    </label>
  );
}
