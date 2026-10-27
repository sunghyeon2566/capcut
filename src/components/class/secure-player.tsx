"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// 다운로드 방지 기능이 들어간 강의 영상 플레이어
//
// 웹 브라우저에서는 화면 녹화를 100% 막을 수 없으므로, 다운로드를 막고
// 유출되면 누가 했는지 알 수 있게 하는 데 집중합니다. (화면 캡처는 허용)
//  1) 워터마크  — 시청자 이름·아이디·전화번호 뒷자리가 영상 위를 떠다님 (유출자 추적)
//  2) 다운로드 차단 — 다운로드 버튼·우클릭·드래그·PIP·원격재생 비활성화, 페이지 저장 단축키 차단,
//                    영상 파일은 로그인한 수강생의 video 태그 요청에만 내려감
//  3) 전체화면은 워터마크가 함께 보이도록 플레이어 영역 전체를 전체화면으로 전환

const noopSubscribe = () => () => {};

type Source = { type: "file"; src: string } | { type: "youtube"; youtubeId: string };

export function SecurePlayer({
  source,
  watermarkText,
  watermark,
}: {
  source: Source;
  watermarkText: string;
  watermark: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pos, setPos] = useState({ top: 12, left: 8 });
  const [now, setNow] = useState("");
  // 아이폰처럼 요소 전체화면을 지원하지 않는 브라우저에서는 버튼을 숨깁니다.
  const canFullscreen = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(document.fullscreenEnabled),
    () => false
  );

  // 워터마크 위치를 주기적으로 옮겨 잘라내기·가리기 어렵게 합니다.
  useEffect(() => {
    if (!watermark) return;
    const move = () => {
      setPos({ top: 5 + Math.random() * 75, left: 3 + Math.random() * 40 });
      setNow(new Date().toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }));
    };
    move();
    const timer = setInterval(move, 4000);
    return () => clearInterval(timer);
  }, [watermark]);

  useEffect(() => {
    // 페이지 저장(Ctrl/⌘+S)·소스 보기(Ctrl/⌘+U)로 영상 주소를 찾아내는 것을 막습니다.
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === "s" || key === "u")) {
        e.preventDefault();
      }
    }

    // 영상 더블클릭 등으로 브라우저 기본 전체화면이 되면 워터마크가 빠지므로,
    // 워터마크를 포함한 플레이어 영역 전체화면으로 바꿔 줍니다.
    function onFullscreenChange() {
      if (document.fullscreenElement && document.fullscreenElement === videoRef.current) {
        document.exitFullscreen().then(() => boxRef.current?.requestFullscreen()).catch(() => {});
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else boxRef.current?.requestFullscreen();
  }

  return (
    <div
      ref={boxRef}
      className="secure-player relative aspect-video w-full overflow-hidden rounded-lg bg-black"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {source.type === "file" ? (
        <video
          ref={videoRef}
          src={source.src}
          controls
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          playsInline
          preload="metadata"
          className="h-full w-full"
        />
      ) : (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${source.youtubeId}?rel=0&modestbranding=1&fs=0&disablekb=0`}
          title="강의 영상"
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full"
        />
      )}

      {watermark && (
        <>
          {/* 화면 전체에 옅게 깔리는 고정 워터마크 */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 place-items-center overflow-hidden opacity-[0.09]">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="-rotate-[20deg] whitespace-nowrap text-sm font-bold text-white">
                {watermarkText}
              </span>
            ))}
          </div>
          {/* 떠다니는 워터마크 */}
          <div
            className="pointer-events-none absolute whitespace-nowrap rounded bg-black/25 px-2 py-1 text-xs font-semibold text-white/70 transition-all duration-[1500ms] sm:text-sm"
            style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
          >
            {watermarkText}
            {now && <span className="ml-2 font-normal text-white/60">{now}</span>}
          </div>
        </>
      )}

      {canFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute right-2 top-2 rounded bg-black/50 px-2 py-1 text-xs font-semibold text-white hover:bg-black/70"
        >
          전체화면
        </button>
      )}

    </div>
  );
}
