"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ResourceItem {
  title: string;
  category: string;
  url: string;
}

export function ResourcesView({ name }: { name: string }) {
  const router = useRouter();
  const [resources, setResources] = useState<ResourceItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/resources")
      .then(async (res) => {
        if (!res.ok) throw new Error("자료를 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => setResources(data.resources))
      .catch(() => setError("자료를 불러오지 못했습니다."));
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-navy-800/80">
          <strong className="text-navy-950">{name}</strong>님, 환영합니다.
        </p>
        <button type="button" onClick={handleLogout} className="btn-secondary text-sm">
          로그아웃
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!resources && !error && (
        <p className="mt-6 text-sm text-navy-800/60">자료를 불러오는 중입니다...</p>
      )}

      {resources && (
        <div className="mt-6 divide-y divide-navy-100 rounded-xl border border-navy-100 bg-white">
          {resources.map((item) => (
            <a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 p-5 transition-colors hover:bg-navy-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-600">
                  {item.category}
                </span>
                <p className="mt-2 font-semibold text-navy-950">{item.title}</p>
              </div>
              <span className="text-sm font-semibold text-navy-700">다운로드 링크 열기 →</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
