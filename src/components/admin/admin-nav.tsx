"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/members", label: "수강생 관리" },
  { href: "/admin/subjects", label: "과목 · 영상 관리" },
  { href: "/admin/settings", label: "보안 설정" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
              active ? "bg-white/15 text-white" : "text-navy-100/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
