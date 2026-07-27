import Link from "next/link";
import { HeroVideo } from "@/components/hero-video";
import { MemberDistribution } from "@/components/member-distribution";
import { InstructorPanels } from "@/components/instructor-panels";
import { PROGRAM_STATS } from "@/lib/programs";
import { EVENTS } from "@/lib/events";

// 메인 페이지 구성 순서
//   1) 상단 메인 비주얼 (영상)
//   2) 전국 회원 분포 지도
//   3) 강사 소개 패널 (마우스 오버 시 확장)
//   4) 협회 소개 · 행사 안내 (기존 내용 유지)

export default function Home() {
  const upcomingEvents = EVENTS.filter((e) => e.status === "예정").slice(0, 3);

  return (
    <div>
      {/* 1. 메인 비주얼 */}
      <HeroVideo />

      {/* 2. 전국 회원 분포 */}
      <MemberDistribution />

      {/* 3. 강사 소개 */}
      <InstructorPanels />

      {/* 4. 협회 소개 */}
      <section className="border-t border-navy-100 bg-navy-50 py-20 sm:py-24">
        <div className="container-wide grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <p className="eyebrow">About KCMA</p>
            <h2 className="mt-5 text-2xl font-bold leading-snug text-navy-950 sm:text-4xl">
              왜 한국콘텐츠능률협회
              <br />
              인가요
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-navy-800/75">
              단순한 지식 전달이 아니라, 실제로 콘텐츠 산업에서 활동할 수 있는
              역량을 기르는 것을 목표로 합니다.
            </p>
            <Link href="/programs" className="btn-secondary mt-8 inline-flex">
              커리큘럼 자세히 보기
            </Link>
          </div>

          <div>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  title: "체계적인 커리큘럼",
                  body: "연 50주, 50회 강의를 5개 트랙으로 구성해 기획부터 창업까지 단계적으로 학습합니다.",
                },
                {
                  title: "전담 강사진",
                  body: "현업 경력을 갖춘 8인의 전담 강사가 강의 전 과정을 책임지고 운영합니다.",
                },
                {
                  title: "회원 전용 혜택",
                  body: "회원 전용 자료실, 전시회·공모전 우선 참가 등 다양한 회원 혜택을 제공합니다.",
                },
              ].map((item) => (
                <div key={item.title} className="border-t-2 border-navy-900 bg-white p-6">
                  <p className="font-bold text-navy-950">{item.title}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-navy-800/75">{item.body}</p>
                </div>
              ))}
            </div>

            {/* 협회 운영 실적 */}
            <div className="mt-5 grid grid-cols-2 divide-navy-100 border border-navy-100 bg-white sm:grid-cols-4 sm:divide-x">
              {PROGRAM_STATS.map((stat) => (
                <div key={stat.label} className="p-6 text-center">
                  <p className="stat-figure text-2xl font-bold text-navy-900 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-navy-800/65 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. 다가오는 행사 */}
      <section className="bg-white py-20 sm:py-24">
        <div className="container-wide">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Events</p>
              <h2 className="mt-5 text-2xl font-bold text-navy-950 sm:text-4xl">
                다가오는 협회 행사
              </h2>
            </div>
            <Link href="/events" className="btn-secondary shrink-0">
              행사 전체 보기
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href="/events"
                className="group border border-navy-100 bg-white p-7 transition-all hover:border-navy-600 hover:shadow-lg"
              >
                <span className="inline-block bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-600">
                  {event.category}
                </span>
                <p className="mt-4 text-lg font-bold leading-snug text-navy-950 group-hover:text-navy-700">
                  {event.title}
                </p>
                <p className="mt-2 text-sm text-navy-800/60">{event.date}</p>
                <p className="mt-4 text-sm leading-relaxed text-navy-800/75">
                  {event.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 회원가입 유도 */}
      <section className="relative overflow-hidden bg-navy-900 py-16 sm:py-20">
        <div className="container-wide flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow">Join Us</p>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              우리 지역의 회원으로 함께해 주세요
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-white/70">
              회원가입 후 전국 회원 현황에서 우리 지역의 회원 수가 함께 올라가는
              것을 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/map" className="btn-outline-light">
              전국 회원 현황 보기
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-white px-7 py-[0.8rem] font-semibold text-navy-950 transition-colors hover:bg-gold-300"
            >
              회원가입
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
