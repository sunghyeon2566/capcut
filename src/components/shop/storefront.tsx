import type { CSSProperties } from "react";
import type { Product, ShopDesign } from "@/lib/shop-types";

// 수강생 쇼핑몰 화면. 공개 페이지(/shop/[slug])와 수강생 관리자의 실시간 미리보기에서
// 같이 사용합니다. 미리보기 패널 폭에서도 맞게 보이도록 화면 폭 대신 컨테이너 쿼리(@)를 씁니다.

const COLUMN_CLASS: Record<ShopDesign["columns"], string> = {
  3: "@4xl:grid-cols-3",
  4: "@4xl:grid-cols-4",
  5: "@4xl:grid-cols-5",
};

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function hasContent(p: Product): boolean {
  return Boolean(p.image || p.name);
}

interface StorefrontProps {
  name: string;
  design: ShopDesign;
  products: Product[];
}

export function Storefront({ name, design, products }: StorefrontProps) {
  const visible = products.filter(hasContent);

  return (
    <div
      className="@container min-h-full bg-white text-neutral-900"
      style={{ "--shop": design.primaryColor } as CSSProperties}
    >
      {design.noticeText && (
        <div className="bg-[var(--shop)] px-4 py-2 text-center text-xs font-medium tracking-tight text-white">
          {design.noticeText}
        </div>
      )}

      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-center px-4 @2xl:h-20">
          {design.logoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={design.logoImage} alt={name} className="max-h-10 max-w-[200px] object-contain @2xl:max-h-12" />
          ) : (
            <span className="text-xl font-extrabold tracking-tight @2xl:text-2xl">{name}</span>
          )}
        </div>
        <nav className="mx-auto flex max-w-[1240px] justify-center gap-6 px-4 pb-3 text-[13px] font-semibold text-neutral-600 @2xl:gap-10">
          <a href="#products" className="hover:text-[var(--shop)]">BEST</a>
          <a href="#products" className="hover:text-[var(--shop)]">NEW</a>
          <a href="#products" className="hover:text-[var(--shop)]">SALE</a>
          <a href="#shop-info" className="hover:text-[var(--shop)]">고객센터</a>
        </nav>
      </header>

      {(design.bannerImage || design.bannerTitle || design.bannerSubtitle) && (
        <section className="relative overflow-hidden">
          {design.bannerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={design.bannerImage}
              alt=""
              className="aspect-[4/3] w-full object-cover @2xl:aspect-[21/8]"
            />
          ) : (
            <div
              className="aspect-[4/3] w-full @2xl:aspect-[21/8]"
              style={{
                background: `linear-gradient(135deg, ${design.primaryColor} 0%, ${design.primaryColor}cc 45%, ${design.primaryColor}66 100%)`,
              }}
            />
          )}
          {(design.bannerTitle || design.bannerSubtitle) && (
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/10 to-transparent">
              <div className="mx-auto w-full max-w-[1240px] px-5 pb-8 text-white @2xl:px-8 @2xl:pb-14">
                {design.bannerTitle && (
                  <h2 className="text-2xl font-extrabold leading-tight tracking-tight @2xl:text-4xl">
                    {design.bannerTitle}
                  </h2>
                )}
                {design.bannerSubtitle && (
                  <p className="mt-2 text-sm text-white/85 @2xl:text-lg">{design.bannerSubtitle}</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <section id="products" className="mx-auto max-w-[1240px] px-4 py-12 @2xl:py-16">
        {(design.sectionTitle || design.sectionSubtitle) && (
          <div className="mb-8 text-center @2xl:mb-10">
            {design.sectionTitle && (
              <h3 className="text-xl font-extrabold tracking-tight @2xl:text-2xl">{design.sectionTitle}</h3>
            )}
            {design.sectionSubtitle && (
              <p className="mt-1.5 text-sm text-neutral-500">{design.sectionSubtitle}</p>
            )}
          </div>
        )}

        {visible.length === 0 ? (
          <p className="py-20 text-center text-sm text-neutral-400">곧 멋진 상품으로 찾아뵙겠습니다.</p>
        ) : (
          <ul className={`grid grid-cols-2 gap-x-3 gap-y-8 @2xl:grid-cols-3 @2xl:gap-x-5 ${COLUMN_CLASS[design.columns]}`}>
            {visible.map((p, i) => (
              <li key={i}>
                <ProductCard product={p} ratio={design.imageRatio} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer id="shop-info" className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-[1240px] px-4 py-10 text-xs leading-relaxed text-neutral-500">
          <p className="mb-2 text-sm font-bold text-neutral-800">{name}</p>
          {design.footerText && <p className="whitespace-pre-line">{design.footerText}</p>}
          <p className="mt-4 text-neutral-400">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, ratio }: { product: Product; ratio: ShopDesign["imageRatio"] }) {
  const discount =
    product.price && product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const body = (
    <>
      <div
        className={`relative overflow-hidden rounded-md bg-neutral-100 ${ratio === "portrait" ? "aspect-[3/4]" : "aspect-square"}`}
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">이미지 준비중</div>
        )}
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-sm bg-[var(--shop)] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <p className="line-clamp-2 text-[13px] leading-snug text-neutral-800 @2xl:text-sm">{product.name}</p>
        {product.price !== null && (
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
            {discount > 0 && <span className="text-[15px] font-extrabold text-red-500">{discount}%</span>}
            <span className="text-[15px] font-extrabold">{formatPrice(product.price)}</span>
            {discount > 0 && product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        )}
      </div>
    </>
  );

  return product.link ? (
    <a href={product.link} target="_blank" rel="noopener noreferrer" className="group block">
      {body}
    </a>
  ) : (
    <div className="group block">{body}</div>
  );
}
