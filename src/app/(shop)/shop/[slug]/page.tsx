import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Storefront } from "@/components/shop/storefront";
import { findShopBySlug } from "@/lib/shops";

export async function generateMetadata(props: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const shop = findShopBySlug(slug);
  return {
    title: shop?.name ?? "쇼핑몰을 찾을 수 없습니다",
    description: shop?.design.bannerSubtitle || undefined,
  };
}

export default async function ShopPage(props: PageProps<"/shop/[slug]">) {
  // 수강생이 저장하면 바로 반영되도록 매 요청마다 데이터를 읽습니다.
  await connection();
  const { slug } = await props.params;
  const shop = findShopBySlug(slug);
  if (!shop) notFound();

  return <Storefront name={shop.name} design={shop.design} products={shop.products} />;
}
