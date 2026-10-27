"use client";

import { usePathname } from "next/navigation";

// 온라인 강의실(/class)과 관리자 페이지(/admin)는 협회 홈페이지와 별개의 화면이므로
// 협회 공통 헤더 · 푸터를 숨깁니다.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/class") || pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
