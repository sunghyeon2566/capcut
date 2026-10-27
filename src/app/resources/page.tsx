import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { ResourcesView } from "@/components/resources-view";

export const metadata: Metadata = {
  title: "회원 전용 자료실 | 한국콘텐츠능률협회",
};

export default async function ResourcesPage() {
  const session = await getSession();

  return (
    <div className="container-x max-w-3xl py-16">
      <span className="section-label">회원 전용 혜택</span>
      <h1 className="mt-2 text-3xl font-bold text-navy-950">회원 전용 자료실</h1>
      <p className="mt-2 text-navy-800/80">
        정회원에게 제공되는 강의 자료, 템플릿, 다시보기 영상을 확인할 수
        있습니다.
      </p>

      <div className="card mt-8 p-6">
        {session ? (
          <ResourcesView name={session.name} />
        ) : (
          <LoginGate />
        )}
      </div>
    </div>
  );
}

function LoginGate() {
  return (
    <div>
      <p className="text-navy-800/80">
        회원 전용 자료실은 로그인 후 이용하실 수 있습니다.
      </p>
      <div className="mt-4 flex gap-3">
        <Link href="/login" className="btn-primary">
          로그인하기
        </Link>
        <Link href="/signup" className="btn-secondary">
          회원가입하기
        </Link>
      </div>
      <p className="mt-4 text-xs text-navy-800/50">
        데모 계정: member01@example.com / demo1234
      </p>
    </div>
  );
}
