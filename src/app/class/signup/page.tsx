import { StudentSignupForm } from "@/components/class/auth-forms";

export default async function ClassSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="container-x w-full py-14">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-navy-950">수강생 회원가입</h1>
        <p className="mt-1 text-navy-800/75">
          간단한 정보만 입력하면 가입이 완료됩니다. 이름과 휴대폰 번호는 수강생 확인에 사용됩니다.
        </p>
        <StudentSignupForm next={next} />
      </div>
    </div>
  );
}
