// 쇼핑몰 빌더의 타입과 기본값. 서버(shops.ts)와 브라우저(수강생 관리자) 양쪽에서 씁니다.

export const PRODUCT_SLOTS = 15;

export interface Product {
  name: string;
  price: number | null;
  // 정가. 판매가보다 높으면 할인율과 함께 취소선으로 표시됩니다.
  originalPrice: number | null;
  image: string;
  link: string;
  badge: "" | "BEST" | "NEW" | "SALE" | "HOT";
}

export interface ShopDesign {
  primaryColor: string;
  noticeText: string;
  logoImage: string;
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  sectionTitle: string;
  sectionSubtitle: string;
  columns: 3 | 4 | 5;
  imageRatio: "square" | "portrait";
  footerText: string;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  studentName: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  design: ShopDesign;
  products: Product[];
}


export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,29}$/;
export const BADGES: Product["badge"][] = ["", "BEST", "NEW", "SALE", "HOT"];

export function emptyProduct(): Product {
  return { name: "", price: null, originalPrice: null, image: "", link: "", badge: "" };
}

export function defaultDesign(shopName: string): ShopDesign {
  return {
    primaryColor: "#111111",
    noticeText: "신규 회원 첫 구매 10% 할인 · 5만원 이상 무료배송",
    logoImage: "",
    bannerImage: "",
    bannerTitle: `${shopName}에 오신 것을 환영합니다`,
    bannerSubtitle: "엄선한 인기 상품을 만나보세요",
    sectionTitle: "BEST ITEMS",
    sectionSubtitle: "지금 가장 많이 찾는 상품",
    columns: 5,
    imageRatio: "square",
    footerText: "",
  };
}

// 클라이언트로 내려보낼 때 비밀번호 해시는 제외합니다.
export type PublicShop = Omit<Shop, "passwordHash">;
