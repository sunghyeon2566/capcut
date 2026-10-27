import Link from "next/link";
import type { Video } from "@/lib/academy/store";

export function VideoList({
  slug,
  videos,
  activeId,
}: {
  slug: string;
  videos: Video[];
  activeId?: string;
}) {
  if (videos.length === 0) {
    return <p className="card p-6 text-sm text-navy-800/70">아직 등록된 녹화본이 없습니다.</p>;
  }
  return (
    <ol className="card divide-y divide-navy-100 overflow-hidden">
      {videos.map((v, i) => {
        const active = v.id === activeId;
        return (
          <li key={v.id}>
            <Link
              href={`/class/${slug}/v/${v.id}`}
              className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${
                active ? "bg-navy-50" : "hover:bg-navy-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  active ? "bg-accent-600 text-white" : "bg-navy-100 text-navy-800"
                }`}
              >
                {active ? "▶" : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-navy-950">{v.title}</span>
                {v.description && (
                  <span className="block truncate text-sm text-navy-800/65">{v.description}</span>
                )}
              </span>
              <span className="shrink-0 text-xs text-navy-800/50">
                {new Date(v.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
