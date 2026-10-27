"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest } from "@/components/admin/api";

interface SubjectValues {
  id: string;
  name: string;
  slug: string;
  description: string;
  access: "all" | "approved";
}

// 과목 생성(initial 없음) · 수정(initial 있음) 공용 폼
export function SubjectForm({ initial }: { initial?: SubjectValues }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [access, setAccess] = useState<"all" | "approved">(initial?.access ?? "approved");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const body = { name, slug, description, access };
    const err = initial
      ? await adminRequest(`/api/admin/subjects/${initial.id}`, "PATCH", body)
      : await adminRequest("/api/admin/subjects", "POST", body);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if (initial) {
      setSaved(true);
      // 주소가 바뀌어도 관리자 페이지는 id 기준이라 그대로 새로고침하면 됩니다.
      router.refresh();
    } else {
      setName("");
      setSlug("");
      setDescription("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-800">과목 이름</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="예: 수학"
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-800">페이지 주소</span>
        <div className="flex items-center rounded-lg border border-slate-300 bg-navy-50 pl-3 focus-within:border-navy-600">
          <span className="shrink-0 font-mono text-sm text-navy-800/60">/class/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            className="w-full rounded-r-lg bg-white px-2 py-[0.6rem] font-mono text-sm outline-none"
            placeholder="math"
            required
          />
        </div>
        <span className="mt-1 block text-xs text-navy-800/55">영문 소문자 · 숫자 · 하이픈(-)</span>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold text-navy-800">과목 소개 (선택)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field min-h-20"
          placeholder="과목 페이지 상단에 표시됩니다."
        />
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 text-sm font-semibold text-navy-800">시청 가능 대상</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={access === "approved"} onChange={() => setAccess("approved")} />
            승인된 수강생만 <span className="text-navy-800/55">(수강생 관리에서 과목 지정)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={access === "all"} onChange={() => setAccess("all")} />
            가입한 수강생 전체
          </label>
        </div>
      </fieldset>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={busy} className="btn-primary">
          {initial ? "과목 정보 저장" : "과목 만들기"}
        </button>
        {saved && <span className="text-sm text-emerald-700">저장했습니다.</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
