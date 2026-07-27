"use client";

import { useEffect, useState } from "react";
import { ASSETS, HERO_MEDIA, HERO_INTRO_MS } from "@/lib/assets";

// 메인 상단 배경입니다.
//
// 도입 이미지를 HERO_INTRO_MS(기본 3초) 동안 보여준 뒤 영상(또는 GIF)으로
// 부드럽게 넘어갑니다. 도입 이미지는 아래에 그대로 남겨 두므로 전환 중
// 빈 화면이 생기지 않습니다.
//
// 전환 조건은 "3초 경과"와 "재생 준비 완료" 두 가지가 모두 충족될 때입니다.
// 시간만으로 전환하면, 영상을 재생할 수 없는 환경(코덱 미지원, 네트워크
// 실패 등)에서 빈 영상이 도입 이미지를 덮어버립니다. 준비 상태를 함께
// 확인하면 그런 경우 도입 이미지가 계속 표시됩니다.
//
// 영상 요소는 처음부터 렌더링해 두고 투명하게 감춥니다. 3초 동안 미리
// 버퍼링되므로 전환 시점에 끊기지 않습니다.

export function HeroBackground() {
  const hasMotion = HERO_MEDIA === "video" || HERO_MEDIA === "gif";
  const [introDone, setIntroDone] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    if (!hasMotion) return;
    const timer = setTimeout(() => setIntroDone(true), HERO_INTRO_MS);
    return () => clearTimeout(timer);
  }, [hasMotion]);

  const showMotion = introDone && mediaReady;

  return (
    <div className="absolute inset-0 -z-10">
      {/* 도입 이미지 — 항상 아래에 깔려 있습니다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.heroPoster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {hasMotion && (
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{ opacity: showMotion ? 1 : 0 }}
        >
          {HERO_MEDIA === "video" && (
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onCanPlay={() => setMediaReady(true)}
              onPlaying={() => setMediaReady(true)}
            >
              <source src={ASSETS.heroVideo} type="video/mp4" />
            </video>
          )}

          {HERO_MEDIA === "gif" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ASSETS.heroGif}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              onLoad={() => setMediaReady(true)}
            />
          )}
        </div>
      )}

      {/* 문자 가독성을 위한 어두운 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/92 via-navy-950/70 to-navy-950/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-navy-950/35" />
    </div>
  );
}
