import Link from "next/link";
import { HeroBackground } from "@/components/hero-background";
import { INSTRUCTOR_COUNT } from "@/lib/instructors";

// 메인 상단 비주얼입니다.
//
// 배경(도입 이미지 → 영상 전환)은 HeroBackground 가 담당하고,
// 이 컴포넌트는 그 위에 올라가는 문구와 하단 퀵링크만 그립니다.

const QUICK_LINKS = [
  { href: "/programs", label: "교육 프로그램", desc: "연 50주 · 50회 커리큘럼" },
  { href: "/instructors", label: "강사진 소개", desc: `전담 강사 ${INSTRUCTOR_COUNT}인` },
  { href: "/events", label: "전시회 · 공모전", desc: "협회 주최 행사 안내" },
  { href: "/resources", label: "회원 자료실", desc: "회원 전용 교육 자료" },
];

export function HeroVideo() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950">
      {/* 배경 레이어 — 도입 이미지 3초 후 영상으로 전환 */}
      <HeroBackground />

      {/* 본문 */}
      <div className="container-wide flex min-h-[34rem] flex-col justify-center py-24 sm:min-h-[40rem] lg:min-h-[44rem]">
        <div className="max-w-3xl rise-in">
          <p className="eyebrow text-gold-400">Korea Content Management Association</p>

          <h1 className="mt-6 text-3xl font-bold leading-[1.25] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            콘텐츠로 성장하는 사람,
            <br />
            <span className="text-gold-300">한국콘텐츠능률협회</span>가 함께합니다
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            사단법인 한국콘텐츠능률협회는 검증된 전담 강사진과 연 50주·50회의
            체계적인 교육으로 AI 콘텐츠 기획부터 제작, 창업까지 이어지는
            실무형 인재를 양성합니다.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/programs" className="btn-outline-light">
              교육 프로그램 보기
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white px-7 py-[0.8rem] font-semibold text-navy-950 transition-colors hover:bg-gold-300"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>

      {/* 하단 퀵 링크 띠 — 협회 사이트에서 흔히 쓰는 구성 */}
      <div className="relative border-t border-white/15 bg-navy-950/45 backdrop-blur-sm">
        <div className="container-wide grid grid-cols-2 divide-white/10 lg:grid-cols-4 lg:divide-x">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between gap-3 px-1 py-5 transition-colors hover:bg-white/5 lg:px-7"
            >
              <span>
                <span className="block text-sm font-semibold text-white sm:text-base">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-white/55">{item.desc}</span>
              </span>
              <span
                aria-hidden="true"
                className="text-gold-400 transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
