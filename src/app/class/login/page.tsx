import { StudentLoginForm } from "@/components/class/auth-forms";

export default async function ClassLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="container-x w-full py-14">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-navy-950">수강생 로그인</h1>
        <p className="mt-1 text-navy-800/75">아이디와 비밀번호로 로그인해 주세요.</p>
        <StudentLoginForm next={next} />
      </div>
    </div>
  );
}
