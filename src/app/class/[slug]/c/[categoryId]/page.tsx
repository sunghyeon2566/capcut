import { notFound } from "next/navigation";
import { getSubjectAccess } from "@/lib/academy/access";
import { findCategoryById, getVideosBySubject } from "@/lib/academy/store";
import { VideoList } from "@/components/class/video-list";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; categoryId: string }>;
}) {
  const { slug, categoryId } = await params;
  const access = await getSubjectAccess(slug);
  if (!access.subject || !access.allowed) return null;

  const category = findCategoryById(categoryId);
  if (!category || category.subjectId !== access.subject.id) notFound();
  const videos = getVideosBySubject(access.subject.id).filter((v) => v.categoryId === category.id);

  return (
    <div className="max-w-4xl">
      <p className="text-sm text-navy-800/60">{access.subject.name}</p>
      <h1 className="text-2xl font-bold text-navy-950">{category.name}</h1>
      <p className="mt-1 text-sm text-navy-800/60">녹화본 {videos.length}개</p>
      <div className="mt-6">
        <VideoList slug={slug} videos={videos} />
      </div>
    </div>
  );
}
