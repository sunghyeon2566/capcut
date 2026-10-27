"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest } from "@/components/admin/api";

interface CategoryItem {
  id: string;
  name: string;
}

interface VideoItem {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  kind: "file" | "youtube";
  size: number | null;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

// 과목 안의 카테고리(왼쪽 메뉴)와 카테고리별 녹화본을 관리합니다.
export function SubjectContentManager({
  subjectId,
  slug,
  categories,
  videos,
}: {
  subjectId: string;
  slug: string;
  categories: CategoryItem[];
  videos: VideoItem[];
}) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    const err = await adminRequest("/api/admin/categories", "POST", { subjectId, name: newName });
    if (err) {
      setError(err);
      return;
    }
    setNewName("");
    setError(null);
    router.refresh();
  }

  return (
    <section className="mt-6">
      <h2 className="font-bold text-navy-950">카테고리 · 녹화본</h2>
      <p className="mt-1 text-sm text-navy-800/65">
        카테고리는 과목 페이지 왼쪽 메뉴에 이 순서대로 표시됩니다.
      </p>

      <div className="mt-4 space-y-4">
        {categories.map((c, i) => (
          <CategoryBlock
            key={c.id}
            category={c}
            slug={slug}
            isFirst={i === 0}
            isLast={i === categories.length - 1}
            categories={categories}
            videos={videos.filter((v) => v.categoryId === c.id)}
          />
        ))}
      </div>

      <form onSubmit={addCategory} className="card mt-4 flex flex-wrap items-center gap-2 border-dashed p-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="새 카테고리 이름 (예: 1주차, 기초반, 2026 여름특강)"
          className="input-field min-w-0 flex-1"
          required
        />
        <button type="submit" className="btn-primary">
          카테고리 추가
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>
    </section>
  );
}

function CategoryBlock({
  category,
  slug,
  isFirst,
  isLast,
  categories,
  videos,
}: {
  category: CategoryItem;
  slug: string;
  isFirst: boolean;
  isLast: boolean;
  categories: CategoryItem[];
  videos: VideoItem[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  async function patch(body: unknown) {
    const err = await adminRequest(`/api/admin/categories/${category.id}`, "PATCH", body);
    if (err) window.alert(err);
    else router.refresh();
  }

  function rename() {
    const name = window.prompt("카테고리 이름", category.name);
    if (name && name.trim() && name !== category.name) patch({ name });
  }

  async function remove() {
    const msg =
      videos.length > 0
        ? `"${category.name}" 카테고리와 그 안의 녹화본 ${videos.length}개를 모두 삭제할까요?`
        : `"${category.name}" 카테고리를 삭제할까요?`;
    if (!window.confirm(msg)) return;
    const err = await adminRequest(`/api/admin/categories/${category.id}`, "DELETE");
    if (err) window.alert(err);
    else router.refresh();
  }

  const iconBtn =
    "rounded border border-navy-100 px-2 py-1 text-xs text-navy-800 hover:border-navy-600 disabled:opacity-30";

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-navy-50 px-4 py-3">
        <p className="font-semibold text-navy-950">
          {category.name} <span className="text-sm font-normal text-navy-800/55">({videos.length})</span>
        </p>
        <div className="flex flex-wrap gap-1">
          <button type="button" className={iconBtn} disabled={isFirst} onClick={() => patch({ move: "up" })}>
            ▲
          </button>
          <button type="button" className={iconBtn} disabled={isLast} onClick={() => patch({ move: "down" })}>
            ▼
          </button>
          <button type="button" className={iconBtn} onClick={rename}>
            이름 변경
          </button>
          <button type="button" className={`${iconBtn} text-red-600`} onClick={remove}>
            삭제
          </button>
          <button
            type="button"
            className="rounded bg-accent-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-accent-500"
            onClick={() => setAdding((v) => !v)}
          >
            {adding ? "닫기" : "+ 녹화본 추가"}
          </button>
        </div>
      </div>

      {adding && <AddVideoPanel categoryId={category.id} onDone={() => setAdding(false)} />}

      {videos.length === 0 ? (
        <p className="px-4 py-4 text-sm text-navy-800/55">아직 녹화본이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-navy-100">
          {videos.map((v, i) => (
            <VideoRow
              key={v.id}
              video={v}
              slug={slug}
              isFirst={i === 0}
              isLast={i === videos.length - 1}
              categories={categories}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function VideoRow({
  video,
  slug,
  isFirst,
  isLast,
  categories,
}: {
  video: VideoItem;
  slug: string;
  isFirst: boolean;
  isLast: boolean;
  categories: CategoryItem[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);

  async function patch(body: unknown) {
    const err = await adminRequest(`/api/admin/videos/${video.id}`, "PATCH", body);
    if (err) {
      window.alert(err);
      return false;
    }
    router.refresh();
    return true;
  }

  async function remove() {
    if (!window.confirm(`"${video.title}" 녹화본을 삭제할까요? 업로드한 파일도 함께 삭제됩니다.`)) return;
    const err = await adminRequest(`/api/admin/videos/${video.id}`, "DELETE");
    if (err) window.alert(err);
    else router.refresh();
  }

  const iconBtn =
    "rounded border border-navy-100 px-2 py-1 text-xs text-navy-800 hover:border-navy-600 disabled:opacity-30";

  if (editing) {
    return (
      <li className="space-y-2 px-4 py-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field min-h-16"
          placeholder="설명 (선택)"
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary px-3 py-1.5 text-sm"
            onClick={async () => {
              if (await patch({ title, description })) setEditing(false);
            }}
          >
            저장
          </button>
          <button type="button" className="btn-secondary px-3 py-1.5 text-sm" onClick={() => setEditing(false)}>
            취소
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
      <div className="min-w-0">
        <Link
          href={`/class/${slug}/v/${video.id}`}
          target="_blank"
          className="block truncate font-medium text-navy-950 hover:text-accent-600"
        >
          {video.title}
        </Link>
        <p className="text-xs text-navy-800/55">
          {video.kind === "file" ? `업로드 파일 · ${formatSize(video.size ?? 0)}` : "유튜브 링크"} ·{" "}
          {new Date(video.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <button type="button" className={iconBtn} disabled={isFirst} onClick={() => patch({ move: "up" })}>
          ▲
        </button>
        <button type="button" className={iconBtn} disabled={isLast} onClick={() => patch({ move: "down" })}>
          ▼
        </button>
        {categories.length > 1 && (
          <select
            value={video.categoryId}
            onChange={(e) => patch({ categoryId: e.target.value })}
            className="rounded border border-navy-100 px-1.5 py-1 text-xs text-navy-800"
            title="다른 카테고리로 이동"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <button type="button" className={iconBtn} onClick={() => setEditing(true)}>
          수정
        </button>
        <button type="button" className={`${iconBtn} text-red-600`} onClick={remove}>
          삭제
        </button>
      </div>
    </li>
  );
}

interface QueueItem {
  file: File;
  title: string;
  progress: number; // 0~100, -1 = 실패
  error?: string;
}

// 파일을 원본 그대로 PUT 으로 보내 서버가 디스크에 바로 기록하게 합니다. (진행률 표시를 위해 XHR 사용)
function uploadFile(categoryId: string, item: QueueItem, onProgress: (p: number) => void): Promise<string | null> {
  return new Promise((resolve) => {
    const qs = new URLSearchParams({ categoryId, title: item.title, filename: item.file.name });
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `/api/admin/videos/upload?${qs}`);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(null);
      else {
        try {
          resolve(JSON.parse(xhr.responseText).error ?? "업로드에 실패했습니다.");
        } catch {
          resolve("업로드에 실패했습니다.");
        }
      }
    };
    xhr.onerror = () => resolve("네트워크 오류로 업로드가 중단되었습니다.");
    xhr.send(item.file);
  });
}

function AddVideoPanel({ categoryId, onDone }: { categoryId: string; onDone: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<"file" | "youtube">("file");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ytTitle, setYtTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function pickFiles(files: FileList | null) {
    if (!files) return;
    setQueue((q) => [
      ...q,
      ...Array.from(files).map((file) => ({
        file,
        title: file.name.replace(/\.[^.]+$/, ""),
        progress: 0,
      })),
    ]);
  }

  async function startUpload() {
    setUploading(true);
    let failed = false;
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].progress === 100) continue;
      const err = await uploadFile(categoryId, queue[i], (p) =>
        setQueue((q) => q.map((x, k) => (k === i ? { ...x, progress: p } : x)))
      );
      if (err) failed = true;
      setQueue((q) =>
        q.map((x, k) => (k === i ? { ...x, progress: err ? -1 : 100, error: err ?? undefined } : x))
      );
    }
    setUploading(false);
    router.refresh();
    if (!failed) {
      setQueue([]);
      onDone();
    }
  }

  async function addYoutube(e: React.FormEvent) {
    e.preventDefault();
    const err = await adminRequest("/api/admin/videos", "POST", {
      categoryId,
      title: ytTitle,
      youtubeUrl: ytUrl,
    });
    if (err) {
      setError(err);
      return;
    }
    router.refresh();
    onDone();
  }

  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-semibold ${active ? "bg-navy-900 text-white" : "text-navy-800 hover:bg-navy-50"}`;

  return (
    <div className="border-b border-navy-100 bg-white px-4 py-4">
      <div className="flex gap-1">
        <button type="button" className={tabClass(tab === "file")} onClick={() => setTab("file")}>
          영상 파일 업로드
        </button>
        <button type="button" className={tabClass(tab === "youtube")} onClick={() => setTab("youtube")}>
          유튜브 링크 등록
        </button>
      </div>

      {tab === "file" ? (
        <div className="mt-3 space-y-3">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-navy-100 px-4 py-6 text-center text-sm text-navy-800/70 hover:border-navy-600">
            <span className="font-semibold text-navy-900">영상 파일 선택 (여러 개 가능)</span>
            <span className="mt-1 text-xs">mp4 권장 · webm · mov · 용량 제한 없음</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                pickFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          {queue.length > 0 && (
            <ul className="space-y-2">
              {queue.map((item, i) => (
                <li key={i} className="rounded-md border border-navy-100 p-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={item.title}
                      disabled={uploading || item.progress === 100}
                      onChange={(e) =>
                        setQueue((q) => q.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))
                      }
                      className="input-field py-1.5 text-sm"
                      placeholder="영상 제목"
                    />
                    <span className="w-20 shrink-0 text-right text-xs text-navy-800/60">
                      {formatSize(item.file.size)}
                    </span>
                    {!uploading && item.progress !== 100 && (
                      <button
                        type="button"
                        className="shrink-0 text-xs text-red-600"
                        onClick={() => setQueue((q) => q.filter((_, k) => k !== i))}
                      >
                        빼기
                      </button>
                    )}
                  </div>
                  {(uploading || item.progress !== 0) && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-100">
                      <div
                        className={`h-full ${item.progress === -1 ? "bg-red-500" : "bg-accent-600"}`}
                        style={{ width: `${item.progress === -1 ? 100 : item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.error && <p className="mt-1 text-xs text-red-600">{item.error}</p>}
                </li>
              ))}
            </ul>
          )}

          {queue.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                disabled={uploading || queue.some((x) => !x.title.trim())}
                onClick={startUpload}
              >
                {uploading ? "업로드 중... 창을 닫지 마세요" : `${queue.length}개 업로드`}
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={addYoutube} className="mt-3 space-y-2">
          <input
            value={ytTitle}
            onChange={(e) => setYtTitle(e.target.value)}
            className="input-field"
            placeholder="영상 제목"
            required
          />
          <input
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            className="input-field"
            placeholder="https://youtu.be/..."
            required
          />
          <p className="text-xs text-navy-800/60">
            기존에 일부공개로 올린 녹화본을 옮길 때 사용하세요. 유튜브 영상은 주소가 유출되면 누구나 볼 수
            있으므로, 보안이 중요하면 파일 업로드를 권장합니다.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary">
            등록
          </button>
        </form>
      )}
    </div>
  );
}
