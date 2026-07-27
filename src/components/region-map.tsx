"use client";

import { useEffect, useMemo, useState } from "react";
import { REGIONS, REGION_GRID } from "@/lib/regions";
import { REGION_MEMBER_COUNTS, TOTAL_MEMBERS } from "@/lib/member-stats";

// 지역별 회원 수 = 협회 공식 집계(src/lib/member-stats.ts) + 온라인 신규 가입자
//
// 온라인 가입자는 /api/members/by-region 을 통해 캐시 없이 매번 새로 조회하므로,
// 누군가 회원가입을 하면 새로고침 즉시 해당 지역 수치가 올라갑니다.

function intensityClass(count: number, max: number) {
  if (max === 0 || count === 0) return "bg-navy-50 text-navy-800/50 border-navy-100";
  const ratio = count / max;
  if (ratio > 0.75) return "bg-navy-900 text-white border-navy-900";
  if (ratio > 0.5) return "bg-navy-700 text-white border-navy-700";
  if (ratio > 0.25) return "bg-navy-600 text-white border-navy-600";
  return "bg-navy-100 text-navy-900 border-navy-100";
}

export function RegionMap() {
  const [online, setOnline] = useState<Record<string, number> | null>(null);
  const [onlineTotal, setOnlineTotal] = useState<number>(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/members/by-region", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setOnline(data.counts ?? {});
        setOnlineTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  // 공식 집계에 온라인 가입자를 더한 최종 지역별 인원
  const counts = useMemo(() => {
    const merged: Record<string, number> = {};
    for (const region of REGIONS) {
      merged[region] = REGION_MEMBER_COUNTS[region] + (online?.[region] ?? 0);
    }
    return merged;
  }, [online]);

  const total = TOTAL_MEMBERS + onlineTotal;

  const max = useMemo(() => {
    if (!counts) return 0;
    return Math.max(0, ...Object.values(counts));
  }, [counts]);

  const ranked = useMemo(() => {
    if (!counts) return [];
    return REGIONS.map((region) => ({ region, count: counts[region] ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }, [counts]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-navy-800/70">
          {loading ? (
            "회원 현황을 불러오는 중입니다..."
          ) : (
            <>
              <span className="font-bold text-navy-950">
                전체 회원 {total.toLocaleString()}명
              </span>
              <span className="ml-2 text-navy-800/55">
                (공식 집계 {TOTAL_MEMBERS.toLocaleString()}명 + 온라인 신규 가입{" "}
                {onlineTotal.toLocaleString()}명)
              </span>
            </>
          )}
        </p>
        {hovered && counts && (
          <p className="text-sm font-semibold text-navy-900">
            {hovered}: {(counts[hovered] ?? 0).toLocaleString()}명
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {REGIONS.map((region) => {
          const pos = REGION_GRID[region];
          const count = counts?.[region] ?? 0;
          return (
            <button
              key={region}
              type="button"
              onMouseEnter={() => setHovered(region)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(region)}
              style={{ gridColumn: pos.col, gridRow: pos.row }}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg border p-2 text-center transition-transform hover:scale-105 ${intensityClass(
                count,
                max
              )}`}
            >
              <span className="text-[11px] font-semibold leading-tight sm:text-xs">
                {region.replace("특별자치시", "").replace("특별자치도", "").replace("특별시", "").replace("광역시", "")}
              </span>
              <span className="mt-1 text-sm font-bold sm:text-base">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold text-navy-800">지역별 회원 순위</p>
        <div className="space-y-2">
          {ranked.map((r, idx) => (
            <div key={r.region} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-sm font-semibold text-navy-800/60">{idx + 1}</span>
              <span className="w-28 shrink-0 text-sm font-medium text-navy-950">{r.region}</span>
              <div className="h-2 flex-1 rounded-full bg-navy-100">
                <div
                  className="h-2 rounded-full bg-accent-600"
                  style={{ width: max > 0 ? `${(r.count / max) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-semibold text-navy-900">{r.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
