import type { Metadata } from "next";
import Link from "next/link";
import { MINDAM_LINKS } from "@/lib/mindam";

// 수강생에게 링크로 보내는 민담 안내 페이지
//   1) 프로그램 받기 (구글 신청서)
//   2) 민담 제작 방법 (슬라이드 화면 /mindam/guide)
//   3) 민담 유튜브 강의 신청서
//   4) 딥마크온 클래스 단톡방 입장 (카카오톡)

export const metadata: Metadata = {
  title: "딥마크온 클래스 · 민담 유튜브",
  description:
    "컷편집 프로그램과 민담 자동 편집기, 민담 주제 600개와 지침 스킬, 민담 유튜브 강의 신청과 단톡방 안내",
  openGraph: {
    title: "딥마크온 클래스 · 민담 유튜브",
    description: "컷편집 프로그램 · 민담 자동 편집기 받기, 강의 신청, 단톡방 입장",
  },
};

function Arrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const cardClass =
  "group block rounded-3xl border border-white/15 bg-white/[0.04] px-6 py-10 transition hover:border-amber-300/70 hover:bg-white/[0.08] sm:px-10 sm:py-14";

const buttonBase =
  "mt-8 inline-flex items-center gap-3 rounded-full px-6 py-4 text-lg font-bold text-black sm:text-xl";
const buttonClass = `${buttonBase} bg-amber-300`;

export default function MindamPage() {
  return (
    <div className="min-h-screen flex-1 bg-black text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:gap-8 sm:py-20">
        {/* 1. 프로그램 받기 */}
        <a href={MINDAM_LINKS.programForm} className={cardClass}>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
            컷편집 프로그램,
            <br />
            민담 자동 편집기
            <br />
            프로그램 받기
          </h1>
          <span className={buttonClass}>
            민담 각종 주제 600개와 민담 지침 스킬을 함께 드려요
            <Arrow />
          </span>
        </a>

        {/* 2. 민담 제작 방법 (슬라이드) */}
        <Link href="/mindam/guide" className={cardClass}>
          <p className="text-sm font-semibold tracking-widest text-amber-300">02 · 제작 방법</p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            민담 제작 방법 보기
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            민담 영상을 만드는 순서를 한 장씩 차례대로 보여 드려요.
          </p>
          <span className={buttonClass}>
            제작 방법 슬라이드 보기
            <Arrow />
          </span>
        </Link>

        {/* 3. 강의 신청 */}
        <a href={MINDAM_LINKS.lectureForm} className={cardClass}>
          <p className="text-sm font-semibold tracking-widest text-amber-300">03 · 특강 신청</p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            민담 유튜브 강의
            <br />
            신청서 작성
          </h2>
          <span className={buttonClass}>
            신청서 작성하러 가기
            <Arrow />
          </span>
        </a>

        {/* 4. 단톡방 입장 */}
        <a href={MINDAM_LINKS.kakaoOpenChat} className={cardClass}>
          <p className="text-sm font-semibold tracking-widest text-amber-300">04 · 단톡방</p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            딥마크온 클래스
            <br />
            단톡방 입장
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            딥마크온 클래스 무료특강과 다양한 자료를 신청서 없이 바로 받아 보실 수 있습니다
          </p>
          <span className={`${buttonBase} bg-[#FEE500]`}>
            카카오톡 단톡방 입장하기
            <Arrow />
          </span>
        </a>
      </div>
    </div>
  );
}
