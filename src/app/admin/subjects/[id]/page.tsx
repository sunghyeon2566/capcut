import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/academy/auth";
import { findSubjectById, getCategories, getVideosBySubject } from "@/lib/academy/store";
import { SubjectForm } from "@/components/admin/subject-form";
import { SubjectContentManager } from "@/components/admin/subject-content";
import { DeleteSubjectButton } from "@/components/admin/delete-subject-button";

export default async function AdminSubjectDetail({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return null;
  const { id } = await params;
  const subject = findSubjectById(id);
  if (!subject) notFound();

  const categories = getCategories(subject.id);
  const videos = getVideosBySubject(subject.id).map((v) => ({
    id: v.id,
    categoryId: v.categoryId,
    title: v.title,
    description: v.description,
    kind: v.source.type,
    size: v.source.type === "file" ? v.source.size : null,
    createdAt: v.createdAt,
  }));

  return (
    <div className="max-w-5xl">
      <Link href="/admin/subjects" className="text-sm text-navy-800/60 hover:text-accent-600">
        ← 과목 목록
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy-950">{subject.name}</h1>
        <Link href={`/class/${subject.slug}`} target="_blank" className="btn-secondary px-3 py-1.5 text-sm">
          과목 페이지 열기 ↗
        </Link>
      </div>

      <SubjectContentManager
        subjectId={subject.id}
        slug={subject.slug}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        videos={videos}
      />

      <details className="card mt-8 p-6">
        <summary className="cursor-pointer font-bold text-navy-950">과목 정보 수정</summary>
        <SubjectForm
          initial={{
            id: subject.id,
            name: subject.name,
            slug: subject.slug,
            description: subject.description,
            access: subject.access,
            listed: Boolean(subject.listed),
          }}
        />
        <div className="mt-6 border-t border-navy-100 pt-4">
          <DeleteSubjectButton id={subject.id} name={subject.name} />
        </div>
      </details>
    </div>
  );
}
