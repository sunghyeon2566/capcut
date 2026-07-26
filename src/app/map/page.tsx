import type { Metadata } from "next";
import Link from "next/link";
import { RegionMap } from "@/components/region-map";

export const metadata: Metadata = {
  title: "전국 회원 현황 | 한국콘텐츠능률협회",
};

export default function MapPage() {
  return (
    <div>
      <section className="bg-navy-950 py-14 text-white">
        <div className="container-x">
          <span className="section-label">전국 회원 현황</span>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            우리 지역의 회원 수는 몇 명일까요?
          </h1>
          <p className="mt-3 max-w-2xl text-navy-100/85">
            전국 17개 시/도의 회원 가입 현황을 실시간으로 보여드립니다. 지역
            상자를 눌러보거나 마우스를 올려 자세한 회원 수를 확인해 보세요.
          </p>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="card p-6 sm:p-10">
          <RegionMap />
        </div>

        <div className="card mt-8 overflow-hidden bg-navy-900 p-10 text-white">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold">우리 지역 순위를 높여보세요</h2>
              <p className="mt-3 max-w-xl text-navy-100/80">
                지금 회원가입을 하면 우리 지역의 회원 수와 순위가 바로
                올라갑니다. 지역 콘텐츠 커뮤니티를 함께 키워 나가요.
              </p>
            </div>
            <Link href="/signup" className="btn-primary shrink-0">
              지금 회원가입 하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
