"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 상단 로그인 · 회원가입 버튼. 과목 페이지에서 눌렀으면 로그인 후 그 과목 페이지로 돌아옵니다.
// (숨긴 과목은 강의실 홈 목록에 없으므로 원래 페이지로 돌려보내야 합니다.)
export function GuestButtons() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/class/login" || pathname === "/class/signup";
  const query = !isAuthPage && pathname !== "/class" ? `?next=${encodeURIComponent(pathname)}` : "";
  return (
    <>
      <Link href={`/class/login${query}`} className="btn-secondary px-3 py-1.5 text-sm">
        로그인
      </Link>
      <Link href={`/class/signup${query}`} className="btn-primary px-3 py-1.5 text-sm">
        회원가입
      </Link>
    </>
  );
}
