import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입 완료 | 한국콘텐츠능률협회",
};

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; region?: string }>;
}) {
  const params = await searchParams;
  const name = params.name ?? "회원";
  const region = params.region ?? "";

  return (
    <div className="container-x max-w-lg py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-2xl">
        🎉
      </div>
      <h1 className="mt-6 text-3xl font-bold text-navy-950">
        {name}님, 환영합니다!
      </h1>
      <p className="mt-3 text-navy-800/80">
        한국콘텐츠능률협회의 정회원이 되신 것을 축하드립니다.
        {region && (
          <>
            {" "}
            <strong className="text-navy-900">{region}</strong> 지역 회원으로
            등록되었습니다.
          </>
        )}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/resources" className="card p-6 text-left transition-shadow hover:shadow-md">
          <p className="font-bold text-navy-950">회원 전용 자료실</p>
          <p className="mt-1 text-sm text-navy-800/80">
            강의 자료와 다시보기를 지금 바로 확인해 보세요.
          </p>
        </Link>
        <Link href="/map" className="card p-6 text-left transition-shadow hover:shadow-md">
          <p className="font-bold text-navy-950">전국 회원 현황</p>
          <p className="mt-1 text-sm text-navy-800/80">
            우리 지역의 회원 수와 순위를 확인해 보세요.
          </p>
        </Link>
      </div>

      <Link href="/" className="btn-secondary mt-8 inline-flex">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
