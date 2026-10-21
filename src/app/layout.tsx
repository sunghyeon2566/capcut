import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "한국콘텐츠능률협회",
  description:
    "AI 콘텐츠 제작 교육과 인재 양성을 이끄는 한국콘텐츠능률협회입니다. 강사진 소개, 교육 프로그램, 전시회·공모전·행사, 회원 전용 자료실을 만나보세요.",
};

// 공통 뼈대(html/body)만 둡니다.
// 협회 홈페이지의 헤더·푸터는 (site)/layout.tsx 에서 붙이고,
// 민담 안내 페이지(/mindam)는 헤더·푸터 없이 단독으로 보여 줍니다.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-navy-950">{children}</body>
    </html>
  );
}
