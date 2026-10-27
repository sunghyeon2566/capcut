"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarCategory {
  id: string;
  name: string;
  count: number;
}

// 과목 페이지 왼쪽 카테고리 목록. 모바일에서는 상단 가로 스크롤 탭으로 바뀝니다.
export function SubjectSidebar({
  slug,
  subjectName,
  categories,
  videoCategory,
}: {
  slug: string;
  subjectName: string;
  categories: SidebarCategory[];
  // 영상 id → 카테고리 id (시청 화면에서 현재 카테고리를 표시하기 위해 사용)
  videoCategory: Record<string, string>;
}) {
  const pathname = usePathname();
  const base = `/class/${slug}`;
  const activeId =
    pathname.match(/\/c\/([^/]+)/)?.[1] ??
    videoCategory[pathname.match(/\/v\/([^/]+)/)?.[1] ?? ""] ??
    null;

  const itemClass = (active: boolean) =>
    `flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-navy-50"
    }`;

  return (
    <aside className="border-b border-navy-100 bg-white lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
        <Link href={base} className="block px-4 pb-2 pt-4 lg:px-5 lg:pt-6">
          <span className="text-xs font-semibold text-navy-800/55">과목</span>
          <span className="block text-lg font-bold text-navy-950">{subjectName}</span>
        </Link>
        <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3 lg:flex-col lg:gap-0.5 lg:px-3 lg:pb-6">
          <Link href={base} className={`${itemClass(pathname === base)} shrink-0`}>
            전체 보기
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`${base}/c/${c.id}`}
              className={`${itemClass(activeId === c.id)} shrink-0`}
            >
              <span className="truncate">{c.name}</span>
              <span
                className={`rounded-full px-1.5 text-xs ${
                  activeId === c.id ? "bg-white/20" : "bg-navy-100 text-navy-800/70"
                }`}
              >
                {c.count}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
