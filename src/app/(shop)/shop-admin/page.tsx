import type { Metadata } from "next";
import { InstructorDashboard } from "@/components/shop/instructor-dashboard";
import { PasswordLogin } from "@/components/shop/password-login";
import { isInstructor } from "@/lib/shop-session";
import { getAllShops, toPublicShop } from "@/lib/shops";

export const metadata: Metadata = {
  title: "강사 관리자 | 쇼핑몰 빌더",
  robots: { index: false },
};

export default async function InstructorAdminPage() {
  if (!(await isInstructor())) {
    return (
      <PasswordLogin
        endpoint="/api/shop-admin/login"
        label="강사 관리자"
        title="쇼핑몰 빌더"
        description="수강생 쇼핑몰을 만들고 관리하려면 강사 비밀번호를 입력해 주세요."
      />
    );
  }

  return <InstructorDashboard initialShops={getAllShops().map(toPublicShop)} />;
}
