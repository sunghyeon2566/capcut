import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin, USING_DEFAULT_ADMIN_PASSWORD } from "@/lib/academy/auth";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/class/logout-button";

export const metadata: Metadata = {
  title: "강의실 관리자 | 한국콘텐츠능률협회",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) return <AdminLogin />;

  return (
    <div className="flex min-h-screen flex-col bg-navy-50 lg:flex-row">
      <aside className="bg-navy-950 p-4 text-white lg:w-56 lg:shrink-0 lg:p-5">
        <div className="mb-4 flex items-center justify-between lg:mb-6 lg:block">
          <Link href="/admin" className="font-bold">
            강의실 관리자
          </Link>
          <div className="flex gap-3 text-xs text-navy-100/70 lg:mt-2">
            <Link href="/class" className="hover:text-white">
              강의실 보기 ↗
            </Link>
            <LogoutButton endpoint="/api/admin/logout" redirectTo="/admin" className="hover:text-white" />
          </div>
        </div>
        <AdminNav />
      </aside>
      <div className="min-w-0 flex-1 p-4 sm:p-8">
        {USING_DEFAULT_ADMIN_PASSWORD && (
          <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            기본 관리자 비밀번호(admin / admin1234)를 사용 중입니다. 실제 운영 전에 서버 환경변수{" "}
            <code className="font-mono">ADMIN_PASSWORD</code>와{" "}
            <code className="font-mono">SESSION_SECRET</code>을 꼭 설정해 주세요.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
