import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectAccess } from "@/lib/academy/access";
import { getCategories, getVideosBySubject } from "@/lib/academy/store";
import { SubjectSidebar } from "@/components/class/subject-sidebar";

export default async function SubjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const access = await getSubjectAccess(slug);
  if (!access.subject) notFound();
  const { subject } = access;

  if (!access.allowed) {
    const next = `/class/${subject.slug}`;
    const status = access.state.status;
    return (
      <div className="container-x w-full py-16">
        <div className="mx-auto max-w-lg text-center">
          <p className="section-label">{subject.name}</p>
          {status === "ok" ? (
            <>
              <h1 className="mt-2 text-2xl font-bold text-navy-950">수강 승인 대기 중입니다</h1>
              <p className="mt-3 text-navy-800/80">
                강사가 수강 등록을 확인하면 이 과목의 녹화본을 볼 수 있습니다.
                <br />
                승인이 늦어지면 강사에게 아이디를 알려 주세요.
              </p>
              <Link href="/class" className="btn-secondary mt-8 inline-flex">
                강의실 홈으로
              </Link>
            </>
          ) : (
            <>
              <h1 className="mt-2 text-2xl font-bold text-navy-950">로그인이 필요합니다</h1>
              <p className="mt-3 text-navy-800/80">
                {status === "replaced"
                  ? "다른 기기에서 같은 계정으로 로그인하여 이 기기에서는 로그아웃되었습니다."
                  : status === "inactive"
                    ? "이용이 정지된 계정입니다. 강사에게 문의해 주세요."
                    : "수강생 계정으로 로그인하면 녹화본을 볼 수 있습니다."}
              </p>
              <div className="mt-8 flex justify-center gap-2">
                <Link href={`/class/login?next=${encodeURIComponent(next)}`} className="btn-primary">
                  로그인
                </Link>
                <Link href={`/class/signup?next=${encodeURIComponent(next)}`} className="btn-secondary">
                  회원가입
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const videos = getVideosBySubject(subject.id);
  const categories = getCategories(subject.id).map((c) => ({
    id: c.id,
    name: c.name,
    count: videos.filter((v) => v.categoryId === c.id).length,
  }));
  const videoCategory = Object.fromEntries(videos.map((v) => [v.id, v.categoryId]));

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <SubjectSidebar
        slug={subject.slug}
        subjectName={subject.name}
        categories={categories}
        videoCategory={videoCategory}
      />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        {access.viewer.isAdmin && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            관리자 미리보기 화면입니다. 수강생에게는 이 안내가 보이지 않습니다.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
