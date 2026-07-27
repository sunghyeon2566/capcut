"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Region } from "@/lib/regions";
import {
  ACTIVE_REGION_COUNT,
  MAX_REGION_COUNT,
  REGION_MEMBER_COUNTS,
  TOTAL_MEMBERS,
  rankedRegions,
  shortRegionName,
} from "@/lib/member-stats";

// 전국 회원 분포 섹션입니다.
//
// 대한민국 실루엣 위에 지역별 회원 수에 비례하는 원형 마커를 올려
// "전국에 고르게 분포해 있다"는 인상을 주는 비례 기호 지도(proportional
// symbol map) 방식으로 그렸습니다. 지도 위 마커와 우측 순위 목록은
// 같은 hover 상태를 공유합니다.
//
// 회원 수를 바꾸려면 src/lib/member-stats.ts 의 표만 수정하면 됩니다.

/**
 * 단순화한 대한민국 외곽선 (viewBox 380 x 500 기준).
 *
 * 실제 지형을 그대로 옮긴 측량 데이터는 아니지만, 형태를 알아볼 수 있도록
 * 아래 특징을 반영했습니다.
 *   - 동해안: 거의 직선으로 남북으로 내려가며 포항 부근만 살짝 돌출
 *   - 서해안: 태안반도·변산 등 만입이 반복되는 복잡한 해안선
 *   - 남해안: 여수·통영·거제로 이어지는 톱니 형태의 다도해
 */
const KOREA_OUTLINE =
  // 북부 경계 (서 → 동)
  "M 88,108 L 104,96 L 126,90 L 150,84 L 172,76 L 196,70 L 222,64 L 248,62 L 270,66 L 288,74 " +
  // 동해안 (북 → 남)
  "L 294,92 L 298,124 L 300,156 L 299,188 L 296,216 L 294,244 L 297,262 L 292,280 " +
  "L 288,298 L 284,316 L 276,332 L 268,344 " +
  // 남해안 (동 → 서, 톱니 형태)
  "L 252,352 L 240,344 L 228,356 L 214,350 L 200,362 L 186,356 L 172,368 L 158,362 " +
  "L 146,376 L 134,370 L 122,382 L 110,390 " +
  // 서해안 (남 → 북, 만입 반복)
  "L 98,380 L 94,364 L 88,350 L 96,336 L 84,322 L 92,306 L 82,292 L 94,276 " +
  "L 84,262 L 96,248 L 86,234 L 98,220 L 84,206 L 74,196 L 86,186 L 96,176 " +
  "L 88,162 L 98,150 L 86,138 L 96,126 L 84,118 Z";

interface RegionPoint {
  region: Region;
  x: number;
  y: number;
  /** 라벨 위치 보정값 — 마커끼리 라벨이 겹치지 않도록 지역별로 지정 */
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
}

const REGION_POINTS: RegionPoint[] = [
  { region: "서울특별시", x: 140, y: 130, dx: 8, dy: -8, anchor: "start" },
  { region: "인천광역시", x: 106, y: 140, dx: -8, dy: 2, anchor: "end" },
  { region: "경기도", x: 164, y: 158, dx: 9, dy: 9, anchor: "start" },
  { region: "강원도", x: 240, y: 110, dx: 10, dy: 0, anchor: "start" },
  { region: "충청북도", x: 196, y: 210, dx: 9, dy: -7, anchor: "start" },
  { region: "충청남도", x: 126, y: 218, dx: -9, dy: -3, anchor: "end" },
  { region: "세종특별자치시", x: 162, y: 222, dx: -8, dy: 13, anchor: "end" },
  // 대전 라벨은 오른쪽에 두면 대구 마커와 겹치므로 왼쪽으로 보냅니다.
  { region: "대전광역시", x: 178, y: 246, dx: -9, dy: 12, anchor: "end" },
  { region: "전북특별자치도", x: 146, y: 284, dx: -9, dy: 0, anchor: "end" },
  { region: "광주광역시", x: 120, y: 330, dx: -8, dy: -4, anchor: "end" },
  { region: "전라남도", x: 140, y: 356, dx: -8, dy: 17, anchor: "end" },
  { region: "경상북도", x: 246, y: 214, dx: 10, dy: 0, anchor: "start" },
  { region: "대구광역시", x: 238, y: 262, dx: 9, dy: -8, anchor: "start" },
  { region: "울산광역시", x: 276, y: 292, dx: 8, dy: 3, anchor: "start" },
  { region: "경상남도", x: 214, y: 316, dx: -9, dy: 9, anchor: "end" },
  { region: "부산광역시", x: 256, y: 330, dx: 9, dy: 13, anchor: "start" },
  { region: "제주특별자치도", x: 112, y: 452, dx: 0, dy: 30, anchor: "middle" },
];

/** 회원 수에 비례한 마커 반지름 — 면적이 인원에 비례하도록 sqrt 사용 */
function markerRadius(count: number): number {
  return 4 + Math.sqrt(count) * 1.45;
}

/** 마운트 시 0 → 목표값으로 올라가는 숫자 연출 */
function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // 모션 최소화 설정이면 연출 없이 첫 프레임에 목표값을 그대로 표시합니다.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : durationMs;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      // ease-out — 끝에서 부드럽게 멈추도록
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

export function MemberDistribution() {
  const [active, setActive] = useState<Region | null>(null);
  const animatedTotal = useCountUp(TOTAL_MEMBERS);
  const ranked = useMemo(() => rankedRegions(), []);
  const topRanked = ranked.slice(0, 8);

  const activeCount = active ? REGION_MEMBER_COUNTS[active] : null;

  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 sm:py-28">
      {/* 배경 장식 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 55% at 72% 38%, rgba(36,101,173,0.28) 0%, rgba(7,26,51,0) 100%)",
        }}
      />

      <div className="container-wide relative">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-20">
          {/* 좌측 — 수치와 순위 */}
          <div>
            <p className="eyebrow">Members Nationwide</p>
            <h2 className="mt-5 text-2xl font-bold leading-snug text-white sm:text-4xl">
              전국 <span className="text-gold-300">17개 시·도</span>에서
              <br />
              함께하고 있습니다
            </h2>

            <div className="mt-10 flex items-end gap-4">
              <span className="stat-figure text-6xl font-bold text-white sm:text-7xl">
                {animatedTotal.toLocaleString()}
              </span>
              <span className="pb-2 text-lg font-semibold text-gold-300 sm:text-xl">명</span>
            </div>
            <p className="mt-4 max-w-md leading-relaxed text-white/65">
              한국콘텐츠능률협회는 수도권에 머무르지 않습니다. 전국
              {" "}{ACTIVE_REGION_COUNT}개 시·도 모두에 회원이 자리하고 있으며,
              각 지역에서 콘텐츠 교육의 거점 역할을 하고 있습니다.
            </p>

            {/* 지역별 순위 */}
            <div className="mt-10 border-t border-white/10 pt-8">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold tracking-wide text-white/80">
                  지역별 회원 분포
                </p>
                <Link
                  href="/map"
                  className="text-xs font-semibold text-gold-300 transition-colors hover:text-white"
                >
                  전체 보기 →
                </Link>
              </div>

              <ul className="mt-5 space-y-3">
                {topRanked.map((row, index) => {
                  const isActive = active === row.region;
                  return (
                    <li
                      key={row.region}
                      onMouseEnter={() => setActive(row.region)}
                      onMouseLeave={() => setActive(null)}
                      className="flex items-center gap-3"
                    >
                      <span className="w-4 shrink-0 text-xs font-semibold text-white/35">
                        {index + 1}
                      </span>
                      <span
                        className={`w-20 shrink-0 text-sm transition-colors ${
                          isActive ? "font-bold text-gold-300" : "text-white/80"
                        }`}
                      >
                        {shortRegionName(row.region)}
                      </span>
                      <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(row.count / MAX_REGION_COUNT) * 100}%`,
                            background: isActive
                              ? "linear-gradient(90deg,#e3caa0,#cfa963)"
                              : "linear-gradient(90deg,#8aa4c6,#5a7ba6)",
                          }}
                        />
                      </span>
                      <span
                        className={`stat-figure w-10 shrink-0 text-right text-sm transition-colors ${
                          isActive ? "font-bold text-white" : "text-white/70"
                        }`}
                      >
                        {row.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* 우측 — 지도 */}
          <div className="relative">
            <svg
              viewBox="0 0 380 500"
              className="mx-auto h-auto w-full max-w-lg"
              role="img"
              aria-label={`전국 회원 분포 지도. 총 ${TOTAL_MEMBERS}명이 ${ACTIVE_REGION_COUNT}개 시·도에 분포해 있습니다.`}
            >
              <defs>
                <linearGradient id="landFill" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0%" stopColor="#153a68" />
                  <stop offset="100%" stopColor="#0d2748" />
                </linearGradient>
                <radialGradient id="markerFill" cx="0.35" cy="0.3" r="0.8">
                  <stop offset="0%" stopColor="#f0dfbe" />
                  <stop offset="60%" stopColor="#cfa963" />
                  <stop offset="100%" stopColor="#a8823f" />
                </radialGradient>
              </defs>

              {/* 국토 실루엣 */}
              <g>
                <path
                  d={KOREA_OUTLINE}
                  fill="url(#landFill)"
                  stroke="#4a7ab0"
                  strokeOpacity="0.55"
                  strokeWidth="1.2"
                />
                {/* 제주도 */}
                <ellipse
                  cx="112"
                  cy="452"
                  rx="31"
                  ry="13.5"
                  fill="url(#landFill)"
                  stroke="#4a7ab0"
                  strokeOpacity="0.55"
                  strokeWidth="1.2"
                />
              </g>

              {/* 지역 마커 */}
              <g>
                {REGION_POINTS.map((point, index) => {
                  const count = REGION_MEMBER_COUNTS[point.region];
                  const r = markerRadius(count);
                  const isActive = active === point.region;
                  const isTop5 = ranked.slice(0, 5).some((x) => x.region === point.region);

                  return (
                    <g
                      key={point.region}
                      onMouseEnter={() => setActive(point.region)}
                      onMouseLeave={() => setActive(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* 확산 링 — 상위 5개 지역에만 절제해서 적용 */}
                      {isTop5 && (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={r}
                          fill="none"
                          stroke="#cfa963"
                          strokeWidth="1"
                          className="marker-pulse"
                          style={{ animationDelay: `${index * 0.45}s` }}
                        />
                      )}

                      {/* 히트 영역 — 작은 마커도 쉽게 가리킬 수 있도록 */}
                      <circle cx={point.x} cy={point.y} r={r + 9} fill="transparent" />

                      {/* 후광 */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isActive ? r + 6 : r + 2.5}
                        fill="#cfa963"
                        opacity={isActive ? 0.28 : 0.12}
                        style={{ transition: "all 0.25s ease" }}
                      />

                      {/* 마커 본체 */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={r}
                        fill="url(#markerFill)"
                        stroke="#ffffff"
                        strokeOpacity={isActive ? 0.9 : 0.4}
                        strokeWidth={isActive ? 1.4 : 0.8}
                        style={{ transition: "all 0.25s ease" }}
                      />

                      {/* 지역명 · 인원 */}
                      <text
                        x={point.x + point.dx + (point.anchor === "end" ? -r : point.anchor === "start" ? r : 0)}
                        y={point.y + point.dy}
                        textAnchor={point.anchor}
                        fontSize="10.5"
                        fontWeight={isActive ? 700 : 500}
                        fill={isActive ? "#ffffff" : "rgba(255,255,255,0.72)"}
                        style={{ transition: "fill 0.2s ease", pointerEvents: "none" }}
                      >
                        {shortRegionName(point.region)}
                        <tspan
                          fill={isActive ? "#e3caa0" : "rgba(227,202,160,0.75)"}
                          fontWeight="700"
                        >
                          {" "}
                          {count}
                        </tspan>
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* 지도 아래 안내 / 선택된 지역 표기 */}
            <div className="mt-2 flex min-h-[2.5rem] flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
              {active ? (
                <p className="text-sm text-white/80">
                  <span className="font-bold text-gold-300">{active}</span>
                  <span className="mx-2 text-white/30">|</span>
                  회원 <span className="stat-figure font-bold text-white">{activeCount}</span>명
                  <span className="mx-2 text-white/30">|</span>
                  전체의{" "}
                  <span className="font-semibold text-white">
                    {(((activeCount ?? 0) / TOTAL_MEMBERS) * 100).toFixed(1)}%
                  </span>
                </p>
              ) : (
                <p className="text-xs text-white/45">
                  지도의 지역을 가리키면 해당 지역 회원 현황이 표시됩니다
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
