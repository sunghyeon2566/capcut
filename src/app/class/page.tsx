import Link from "next/link";
import { getStudentState } from "@/lib/academy/auth";
import { canStudentView, getCategories, getSubjects, getVideosBySubject } from "@/lib/academy/store";

// 온라인 강의실 첫 화면 — 관리자가 "홈에 표시"로 정한 과목만 보여 줍니다.
// 숨긴 과목은 목록에 나오지 않고, 과목 링크(/class/과목주소)를 받은 사람만 들어올 수 있습니다.
export default async function ClassHome() {
  const state = await getStudentState();
  const student = state.status === "ok" ? state.student : null;
  const subjects = getSubjects().filter((s) => s.listed);

  return (
    <div className="container-x w-full py-12">
      {!student && (
        <section className="card mb-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="section-label">수강생 전용</p>
            <h1 className="mt-1 text-2xl font-bold text-navy-950">강의 녹화본 다시보기</h1>
            <p className="mt-2 text-navy-800/80">
              회원가입 후 로그인하면 수강 중인 과목의 녹화본을 언제든 다시 볼 수 있습니다.
            </p>
            {state.status === "replaced" && (
              <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                다른 기기에서 같은 계정으로 로그인하여 이 기기에서는 로그아웃되었습니다.
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/class/login" className="btn-secondary">
              로그인
            </Link>
            <Link href="/class/signup" className="btn-primary">
              회원가입
            </Link>
          </div>
        </section>
      )}

      <h2 className="text-xl font-bold text-navy-950">개설 과목</h2>
      {subjects.length === 0 ? (
        <p className="card mt-4 p-6 text-navy-800/70">
          강사에게 받은 과목 링크로 접속해 주세요.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const allowed = student ? canStudentView(student, subject) : false;
            const categoryCount = getCategories(subject.id).length;
            const videoCount = getVideosBySubject(subject.id).length;
            return (
              <li key={subject.id}>
                <Link
                  href={`/class/${subject.slug}`}
                  className="card flex h-full flex-col p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-navy-950">{subject.name}</h3>
                    {student && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          allowed ? "bg-emerald-50 text-emerald-700" : "bg-navy-100 text-navy-800/70"
                        }`}
                      >
                        {allowed ? "시청 가능" : "승인 대기"}
                      </span>
                    )}
                  </div>
                  {subject.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-navy-800/75">{subject.description}</p>
                  )}
                  <p className="mt-auto pt-4 text-xs text-navy-800/60">
                    카테고리 {categoryCount}개 · 녹화본 {videoCount}개
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
