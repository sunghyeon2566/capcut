// 사이트에서 사용하는 이미지·영상 에셋 경로를 한곳에 모아둔 파일입니다.
//
// 실제 파일을 public/media/ 에 넣은 뒤 이 파일의 경로만 바꾸면
// 사이트 전체에 한 번에 반영됩니다. 컴포넌트를 수정할 필요가 없습니다.
//
// 자세한 파일명 규칙은 public/media/README.md 를 참고하세요.

export const ASSETS = {
  /** 협회 로고 — 현재는 벡터로 재현한 SVG. 원본을 받으면 logo.png 로 교체 */
  logo: "/media/logo.svg",

  /** 메인 비주얼 영상 (MP4) */
  heroVideo: "/media/hero.mp4",

  /** 메인 비주얼 GIF — 변환 없이 GIF 를 그대로 쓸 때 사용 */
  heroGif: "/media/hero.gif",

  /** 메인 비주얼의 포스터(대체) 이미지 */
  heroPoster: "/media/hero-poster.svg",
} as const;

/**
 * 메인 상단 배경에 무엇을 보여줄지 결정합니다.
 *
 *   "poster" — 파일을 아직 넣지 않은 상태. 포스터 이미지만 표시 (현재 값)
 *   "gif"    — public/media/hero.gif 를 넣었을 때. 변환 없이 그대로 재생됩니다
 *   "video"  — public/media/hero.mp4 를 넣었을 때. 용량·화질 면에서 가장 좋습니다
 *
 * 파일을 넣고 이 값만 바꾸면 됩니다. 컴포넌트는 수정할 필요가 없습니다.
 */
export type HeroMedia = "poster" | "gif" | "video";

export const HERO_MEDIA: HeroMedia = "video";

/**
 * 메인 상단에서 도입 이미지를 보여주는 시간(밀리초)입니다.
 * 이 시간이 지나면 영상(또는 GIF)으로 부드럽게 전환됩니다.
 * HERO_MEDIA 가 "poster" 인 동안에는 전환이 일어나지 않습니다.
 */
export const HERO_INTRO_MS = 3000;
