import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectAccess } from "@/lib/academy/access";
import { findCategoryById, findVideoById, getSettings, getVideosBySubject } from "@/lib/academy/store";
import { SecurePlayer } from "@/components/class/secure-player";
import { VideoList } from "@/components/class/video-list";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string; videoId: string }>;
}) {
  const { slug, videoId } = await params;
  const access = await getSubjectAccess(slug);
  if (!access.subject || !access.allowed) return null;

  const video = findVideoById(videoId);
  if (!video || video.subjectId !== access.subject.id) notFound();
  const category = findCategoryById(video.categoryId);
  const siblings = getVideosBySubject(access.subject.id).filter((v) => v.categoryId === video.categoryId);
  const index = siblings.findIndex((v) => v.id === video.id);
  const prev = siblings[index - 1];
  const next = siblings[index + 1];
  const settings = getSettings();

  return (
    <div className="max-w-5xl">
      <p className="text-sm text-navy-800/60">
        {access.subject.name}
        {category && (
          <>
            {" › "}
            <Link href={`/class/${slug}/c/${category.id}`} className="hover:text-accent-600">
              {category.name}
            </Link>
          </>
        )}
      </p>
      <h1 className="mt-1 text-xl font-bold text-navy-950 sm:text-2xl">{video.title}</h1>

      <div className="mt-4">
        <SecurePlayer
          // 영상이 바뀌면 플레이어를 새로 만듭니다
          key={video.id}
          source={
            video.source.type === "file"
              ? { type: "file", src: `/api/class/videos/${video.id}/stream` }
              : { type: "youtube", youtubeId: video.source.youtubeId }
          }
          watermarkText={access.viewer.label}
          watermark={settings.watermark}
        />
      </div>

      <p className="mt-3 rounded-md bg-navy-100/60 px-3 py-2 text-xs leading-relaxed text-navy-800/80">
        이 녹화본은 <strong>{access.viewer.name}</strong>님 계정으로 시청 중입니다. 녹화본의 무단
        녹화·캡처·공유·재배포는 저작권법에 따라 금지되며, 영상에 표시된 정보로 유출자를 확인할 수
        있습니다.
      </p>

      {video.description && (
        <p className="mt-5 whitespace-pre-line text-navy-800/85">{video.description}</p>
      )}

      <div className="mt-6 flex justify-between gap-3">
        {prev ? (
          <Link href={`/class/${slug}/v/${prev.id}`} className="btn-secondary min-w-0 text-sm">
            <span className="truncate">← {prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/class/${slug}/v/${next.id}`} className="btn-secondary min-w-0 text-sm">
            <span className="truncate">{next.title} →</span>
          </Link>
        )}
      </div>

      <h2 className="mt-10 font-bold text-navy-950">{category?.name ?? "같은 카테고리"} 녹화본</h2>
      <div className="mt-3">
        <VideoList slug={slug} videos={siblings} activeId={video.id} />
      </div>
    </div>
  );
}
