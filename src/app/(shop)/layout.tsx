import "../globals.css";

// 쇼핑몰 빌더 전용 루트 레이아웃 — 협회 사이트의 헤더/푸터 없이 쇼핑몰 화면만 보여 줍니다.
export default function ShopRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-white text-neutral-900">{children}</body>
    </html>
  );
}
