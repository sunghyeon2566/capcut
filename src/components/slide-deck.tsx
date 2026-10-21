"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/mindam";

// PPT처럼 한 장씩 넘겨 보는 화면
// 버튼 · 키보드 방향키 · 휴대폰 좌우 밀기로 넘길 수 있습니다.
export function SlideDeck({ slides, backHref }: { slides: Slide[]; backHref: string }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const last = slides.length - 1;

  const go = useCallback(
    (next: number) => setIndex(Math.min(Math.max(next, 0), last)),
    [last],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") go(index + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const slide = slides[index];

  return (
    <div
      className="flex min-h-screen flex-1 flex-col bg-black text-white"
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx < -50) go(index + 1);
        if (dx > 50) go(index - 1);
        touchStartX.current = null;
      }}
    >
      {/* 상단: 처음으로 · 쪽수 */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Link href={backHref} className="text-base text-white/70 hover:text-white">
          ← 처음 화면으로
        </Link>
        <span className="text-base tabular-nums text-white/60">
          {index + 1} / {slides.length}
        </span>
      </div>

      {/* 진행 막대 */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-amber-300 transition-all"
          style={{ width: `${((index + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* 슬라이드 본문 */}
      <div key={index} className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12">
        <div className="w-full max-w-4xl">
          {slide.label && (
            <p className="text-sm font-semibold tracking-widest text-amber-300 sm:text-base">
              {slide.label}
            </p>
          )}
          <h1 className="mt-4 whitespace-pre-line text-3xl font-extrabold leading-tight sm:text-5xl">
            {slide.title}
          </h1>
          {slide.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.image}
              alt={slide.title}
              className="mt-8 max-h-[50vh] w-full rounded-2xl object-contain"
            />
          )}
          {slide.points && (
            <ul className="mt-8 space-y-4">
              {slide.points.map((point) => (
                <li key={point} className="flex gap-3 text-lg leading-relaxed text-white/80 sm:text-2xl">
                  <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-amber-300" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 하단: 이전 · 다음 */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-6 sm:px-8">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="rounded-full border border-white/25 py-4 text-lg font-bold disabled:opacity-30"
        >
          ← 이전
        </button>
        {index < last ? (
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="rounded-full bg-amber-300 py-4 text-lg font-bold text-black"
          >
            다음 →
          </button>
        ) : (
          <Link
            href={backHref}
            className="rounded-full bg-amber-300 py-4 text-center text-lg font-bold text-black"
          >
            처음 화면으로
          </Link>
        )}
      </div>
    </div>
  );
}
