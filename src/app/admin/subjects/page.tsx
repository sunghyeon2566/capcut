import Link from "next/link";
import { isAdmin } from "@/lib/academy/auth";
import { getCategories, getSubjects, getVideosBySubject } from "@/lib/academy/store";
import { SubjectForm } from "@/components/admin/subject-form";

export default async function AdminSubjectsPage() {
  if (!(await isAdmin())) return null;
  const subjects = getSubjects();

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-navy-950">과목 · 영상 관리</h1>
      <p className="mt-1 text-sm text-navy-800/70">
        과목을 만들면 과목마다 별도의 웹페이지(/class/페이지주소)가 생깁니다. 과목을 눌러 카테고리를
        만들고 녹화본을 올리세요.
      </p>

      {subjects.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {subjects.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/subjects/${s.id}`} className="card block p-5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-lg font-bold text-navy-950">{s.name}</span>
                  <span className="shrink-0 rounded-full bg-navy-50 px-2 py-0.5 text-xs text-navy-800/70">
                    {s.access === "all" ? "가입자 전체 공개" : "승인된 수강생만"}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-navy-700">/class/{s.slug}</p>
                <p className="mt-3 text-sm text-navy-800/65">
                  카테고리 {getCategories(s.id).length}개 · 녹화본 {getVideosBySubject(s.id).length}개
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="card mt-8 p-6">
        <h2 className="font-bold text-navy-950">새 과목 만들기</h2>
        <SubjectForm />
      </section>
    </div>
  );
}
