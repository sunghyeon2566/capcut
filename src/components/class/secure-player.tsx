"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// 녹화·캡처 억제 기능이 들어간 강의 영상 플레이어
//
// 웹 브라우저에서는 화면 녹화를 100% 막을 수 없습니다(OBS·휴대폰 촬영 등).
// 그래서 "막기 어렵게 만들고, 유출되면 누가 했는지 알 수 있게" 하는 방식을 함께 씁니다.
//  1) 워터마크  — 시청자 이름·아이디·전화번호 뒷자리가 영상 위를 떠다님 (유출자 추적)
//  2) 창 이탈 시 정지·가림 — 캡처 도구/녹화 프로그램으로 창을 옮기면 영상이 가려짐
//  3) 캡처 단축키 감지 — PrintScreen, ⌘+Shift(맥 캡처), Win+Shift+S 입력 시 화면 가림
//  4) 다운로드 차단 — 다운로드 버튼·우클릭·드래그·PIP·원격재생 비활성화,
//                    영상 파일은 로그인한 수강생의 video 태그 요청에만 내려감
//  5) 전체화면은 워터마크가 함께 보이도록 플레이어 영역 전체를 전체화면으로 전환

const noopSubscribe = () => () => {};

type Source = { type: "file"; src: string } | { type: "youtube"; youtubeId: string };

export function SecurePlayer({
  source,
  watermarkText,
  watermark,
  pauseOnBlur,
}: {
  source: Source;
  watermarkText: string;
  watermark: boolean;
  pauseOnBlur: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [covered, setCovered] = useState<null | "blur" | "capture">(null);
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
    function pause() {
      videoRef.current?.pause();
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
        "*"
      );
    }
    function hide(reason: "blur" | "capture") {
      pause();
      setCovered(reason);
    }

    function onVisibility() {
      if (pauseOnBlur && document.visibilityState === "hidden") hide("blur");
    }
    function onBlur() {
      if (!pauseOnBlur) return;
      // 유튜브 플레이어(iframe)를 클릭해도 창 blur 가 발생하므로 그 경우는 제외합니다.
      setTimeout(() => {
        if (document.activeElement !== iframeRef.current) hide("blur");
      }, 0);
    }
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      // 맥 캡처(⌘+Shift+3/4/5), 윈도우 캡처 도구(Win+Shift+S)
      if (e.metaKey && e.shiftKey) {
        hide("capture");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (key === "s" || key === "p" || key === "u")) {
        e.preventDefault();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "PrintScreen") {
        hide("capture");
        // 이미 클립보드에 들어간 캡처 이미지를 지웁니다 (브라우저가 허용하는 경우).
        navigator.clipboard?.writeText("").catch(() => {});
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
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [pauseOnBlur]);

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
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${source.youtubeId}?enablejsapi=1&rel=0&modestbranding=1&fs=0&disablekb=0`}
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

      {covered && (
        <button
          type="button"
          onClick={() => setCovered(null)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black px-6 text-center text-white"
        >
          <span className="text-base font-bold">
            {covered === "capture" ? "화면 캡처가 감지되어 영상을 가렸습니다" : "영상이 일시정지되었습니다"}
          </span>
          <span className="text-sm text-white/70">
            {covered === "capture"
              ? "녹화본의 캡처·녹화·공유는 금지되어 있습니다."
              : "다른 창으로 이동하면 영상이 자동으로 멈춥니다."}{" "}
            화면을 클릭하면 다시 볼 수 있습니다.
          </span>
        </button>
      )}
    </div>
  );
}
