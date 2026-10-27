import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopEditor } from "@/components/shop/shop-editor";
import { PasswordLogin } from "@/components/shop/password-login";
import { getStudentShopId } from "@/lib/shop-session";
import { findShopBySlug, toPublicShop } from "@/lib/shops";

export const metadata: Metadata = {
  title: "쇼핑몰 관리자",
  robots: { index: false },
};

export default async function StudentAdminPage(props: PageProps<"/shop/[slug]/admin">) {
  const { slug } = await props.params;
  const shop = findShopBySlug(slug);
  if (!shop) notFound();

  if ((await getStudentShopId()) !== shop.id) {
    return (
      <PasswordLogin
        endpoint={`/api/shop/${shop.slug}/login`}
        label="수강생 관리자"
        title={shop.name}
        description="쇼핑몰을 꾸미고 상품을 등록하려면 강사님께 받은 비밀번호를 입력해 주세요."
      />
    );
  }

  return <ShopEditor initialShop={toPublicShop(shop)} />;
}
