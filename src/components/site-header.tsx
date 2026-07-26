"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "홈" },
  { href: "/instructors", label: "강사진" },
  { href: "/programs", label: "교육 프로그램" },
  { href: "/events", label: "전시회·공모전·행사" },
  { href: "/resources", label: "회원 전용 자료실" },
  { href: "/map", label: "전국 회원 현황" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-navy-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white">
            KC
          </span>
          <span className="hidden text-base sm:inline">한국콘텐츠능률협회</span>
          <span className="text-base sm:hidden">KCCA</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navy-800 hover:text-accent-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="text-sm font-semibold text-navy-800 hover:text-accent-600">
            로그인
          </Link>
          <Link href="/signup" className="btn-primary text-sm">
            회원가입
          </Link>
        </div>

        <button
          type="button"
          aria-label="메뉴 열기"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-navy-100 lg:hidden"
        >
          <span className="sr-only">메뉴</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-navy-900" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-100 bg-white lg:hidden">
          <nav className="container-x flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-navy-800 hover:bg-navy-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-navy-100 pt-3">
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
