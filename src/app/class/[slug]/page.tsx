import Link from "next/link";
import { getSubjectAccess } from "@/lib/academy/access";
import { getCategories, getVideosBySubject } from "@/lib/academy/store";

export default async function SubjectHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await getSubjectAccess(slug);
  if (!access.subject || !access.allowed) return null;
  const { subject } = access;

  const categories = getCategories(subject.id);
  const videos = getVideosBySubject(subject.id);
  const recent = [...videos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-navy-950">{subject.name}</h1>
      {subject.description && (
        <p className="mt-2 whitespace-pre-line text-navy-800/80">{subject.description}</p>
      )}

      {categories.length === 0 ? (
        <p className="card mt-8 p-6 text-navy-800/70">아직 등록된 강의가 없습니다.</p>
      ) : (
        <>
          <h2 className="mt-8 font-bold text-navy-950">카테고리</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/class/${subject.slug}/c/${c.id}`}
                  className="card block p-4 transition-shadow hover:shadow-md"
                >
                  <span className="block font-semibold text-navy-950">{c.name}</span>
                  <span className="mt-1 block text-sm text-navy-800/60">
                    녹화본 {videos.filter((v) => v.categoryId === c.id).length}개
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {recent.length > 0 && (
            <>
              <h2 className="mt-10 font-bold text-navy-950">최근 올라온 녹화본</h2>
              <ul className="card mt-3 divide-y divide-navy-100">
                {recent.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/class/${subject.slug}/v/${v.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-navy-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-navy-950">{v.title}</span>
                        <span className="text-xs text-navy-800/55">
                          {categories.find((c) => c.id === v.categoryId)?.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-navy-800/50">
                        {new Date(v.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
