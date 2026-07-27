"use client";

import Link from "next/link";
import { useState } from "react";
import { ASSETS } from "@/lib/assets";

const NAV_LINKS = [
  { href: "/instructors", label: "강사진" },
  { href: "/programs", label: "교육 프로그램" },
  { href: "/events", label: "전시회·공모전·행사" },
  { href: "/resources", label: "회원 전용 자료실" },
  { href: "/map", label: "전국 회원 현황" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* 상단 유틸리티 바 */}
      <div className="hidden border-b border-navy-100 bg-navy-50 lg:block">
        <div className="container-wide flex h-9 items-center justify-end gap-5 text-xs text-navy-800/75">
          <Link href="/map" className="hover:text-accent-600">
            전국 회원 현황
          </Link>
          <span className="text-navy-100">|</span>
          <Link href="/login" className="hover:text-accent-600">
            로그인
          </Link>
          <span className="text-navy-100">|</span>
          <Link href="/signup" className="font-semibold text-navy-900 hover:text-accent-600">
            회원가입
          </Link>
        </div>
      </div>

      {/* 메인 바 */}
      <div className="border-b border-navy-100">
        <div className="container-wide flex h-[4.5rem] items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.logo}
              alt="한국콘텐츠능률협회 로고"
              className="h-11 w-11 shrink-0"
            />
            <span className="leading-tight">
              <span className="block text-[0.65rem] font-medium tracking-wide text-navy-800/60">
                사단법인
              </span>
              <span className="block text-base font-bold tracking-tight text-navy-950 sm:text-[1.05rem]">
                한국콘텐츠능률협회
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative py-2 text-[0.95rem] font-semibold text-navy-900 transition-colors after:absolute after:inset-x-0 after:-bottom-[1.35rem] after:h-[3px] after:scale-x-0 after:bg-accent-600 after:transition-transform hover:text-accent-600 hover:after:scale-x-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href="/signup" className="btn-primary hidden shrink-0 text-sm xl:inline-flex">
            회원가입
          </Link>

          <button
            type="button"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-navy-100 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-navy-900"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <div className="border-b border-navy-100 bg-white lg:hidden">
          <nav className="container-x flex flex-col py-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="border-b border-navy-50 px-1 py-3 text-sm font-semibold text-navy-900"
            >
              홈
            </Link>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-navy-50 px-1 py-3 text-sm font-semibold text-navy-900"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2 pb-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-secondary flex-1 text-sm"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="btn-primary flex-1 text-sm"
              >
                회원가입
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
