import type { Metadata } from "next";
import "../globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "한국콘텐츠능률협회",
  description:
    "AI 콘텐츠 제작 교육과 인재 양성을 이끄는 한국콘텐츠능률협회입니다. 강사진 소개, 교육 프로그램, 전시회·공모전·행사, 회원 전용 자료실을 만나보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-navy-950">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
