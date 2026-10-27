import Link from "next/link";
import { isAdmin } from "@/lib/academy/auth";
import { getCategories, getStudents, getSubjects, getVideoCount, getVideosBySubject } from "@/lib/academy/store";

export default async function AdminDashboard() {
  if (!(await isAdmin())) return null;
  const students = getStudents();
  const subjects = getSubjects();

  const stats = [
    { label: "가입 수강생", value: students.length, href: "/admin/members" },
    { label: "개설 과목", value: subjects.length, href: "/admin/subjects" },
    { label: "등록 녹화본", value: getVideoCount(), href: "/admin/subjects" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-navy-950">대시보드</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 hover:shadow-md">
            <p className="text-sm text-navy-800/65">{s.label}</p>
            <p className="stat-figure mt-2 text-3xl font-bold text-navy-950">{s.value}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-bold text-navy-950">과목별 페이지</h2>
      {subjects.length === 0 ? (
        <p className="card mt-3 p-5 text-sm text-navy-800/70">
          아직 과목이 없습니다.{" "}
          <Link href="/admin/subjects" className="font-semibold text-accent-600">
            과목 만들기 →
          </Link>
        </p>
      ) : (
        <div className="card mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-left text-navy-800/70">
              <tr>
                <th className="px-4 py-2.5 font-semibold">과목</th>
                <th className="px-4 py-2.5 font-semibold">페이지 주소</th>
                <th className="px-4 py-2.5 font-semibold">카테고리</th>
                <th className="px-4 py-2.5 font-semibold">녹화본</th>
                <th className="px-4 py-2.5 font-semibold">시청 가능 수강생</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/subjects/${s.id}`} className="font-semibold text-navy-950 hover:text-accent-600">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/class/${s.slug}`} className="font-mono text-xs text-navy-700 hover:underline">
                      /class/{s.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{getCategories(s.id).length}</td>
                  <td className="px-4 py-3">{getVideosBySubject(s.id).length}</td>
                  <td className="px-4 py-3">
                    {s.access === "all"
                      ? `전체 (${students.filter((st) => st.active).length}명)`
                      : `${students.filter((st) => st.active && st.subjectIds.includes(s.id)).length}명`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
