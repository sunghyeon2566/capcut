import type { Metadata } from "next";
import Link from "next/link";
import { getStudent } from "@/lib/academy/auth";
import { LogoutButton } from "@/components/class/logout-button";
import { ASSETS } from "@/lib/assets";

export const metadata: Metadata = {
  title: "온라인 강의실 | 한국콘텐츠능률협회",
  // 녹화본 페이지가 검색엔진에 노출되지 않도록 합니다.
  robots: { index: false, follow: false },
};

export default async function ClassLayout({ children }: { children: React.ReactNode }) {
  const student = await getStudent();

  return (
    <div className="flex min-h-screen flex-col bg-navy-50">
      <header className="sticky top-0 z-40 border-b border-navy-100 bg-white">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/class" className="flex min-w-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ASSETS.logo} alt="" className="h-9 w-9 shrink-0" />
            <span className="truncate font-bold tracking-tight text-navy-950">온라인 강의실</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 text-sm">
            {student ? (
              <>
                <span className="hidden text-navy-800/80 sm:inline">
                  <strong className="text-navy-950">{student.name}</strong>님
                </span>
                <LogoutButton
                  endpoint="/api/class/logout"
                  redirectTo="/class"
                  className="btn-secondary px-3 py-1.5 text-sm"
                />
              </>
            ) : (
              <>
                <Link href="/class/login" className="btn-secondary px-3 py-1.5 text-sm">
                  로그인
                </Link>
                <Link href="/class/signup" className="btn-primary px-3 py-1.5 text-sm">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
