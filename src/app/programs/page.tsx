import type { Metadata } from "next";
import Link from "next/link";
import { CURRICULUM_TRACKS, PROGRAM_STATS } from "@/lib/programs";

export const metadata: Metadata = {
  title: "교육 프로그램 | 한국콘텐츠능률협회",
};

export default function ProgramsPage() {
  return (
    <div>
      <section className="bg-navy-950 py-14 text-white">
        <div className="container-x">
          <span className="section-label">교육 프로그램</span>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            연 50주, 50회 강의로 완성하는 AI 콘텐츠 역량
          </h1>
          <p className="mt-3 max-w-2xl text-navy-100/85">
            한국콘텐츠능률협회는 10인의 전담 강사진이 1년 50주 동안 총 50회의
            강의를 운영합니다. 기획, 제작, 실전 활용, 인재 양성까지 이어지는
            5개 트랙으로 커리큘럼을 체계화했습니다.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PROGRAM_STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-2xl font-bold text-accent-500">{stat.value}</p>
                <p className="mt-1 text-sm text-navy-100/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <span className="section-label">커리큘럼 트랙</span>
        <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
          5개 트랙, 50주의 성장 로드맵
        </h2>

        <div className="mt-8 space-y-6">
          {CURRICULUM_TRACKS.map((track, idx) => (
            <div key={track.id} className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-900 font-bold text-white">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-navy-950">{track.title}</h3>
                  <span className="rounded-full bg-navy-100 px-3 py-1 text-xs font-semibold text-navy-700">
                    {track.weeks}
                  </span>
                </div>
                <p className="mt-2 text-sm text-navy-800/85">{track.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {track.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-navy-100 px-3 py-1 text-xs text-navy-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-50 py-14">
        <div className="container-x">
          <span className="section-label">인재 양성</span>
          <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
            수료 후에도 이어지는 성장
          </h2>
          <p className="mt-3 max-w-2xl text-navy-800/80">
            협회는 강의 수료만으로 끝나지 않습니다. 포트폴리오 완성, 창업 코칭,
            기업 실무 연계 프로젝트, 공모전 및 전시회 참가 기회를 통해 실제
            콘텐츠 산업 현장으로 이어지는 인재 양성을 지원합니다.
          </p>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="card overflow-hidden bg-navy-900 p-10 text-white sm:p-14">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                다음 학기 수강을 문의해보세요
              </h2>
              <p className="mt-3 max-w-xl text-navy-100/80">
                회원가입 후 회원 전용 자료실에서 강의 커리큘럼 상세 자료와
                지난 강의 다시보기를 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/signup" className="btn-primary">
                회원가입 하기
              </Link>
              <Link href="/events" className="btn-secondary bg-white text-navy-900 hover:text-navy-900">
                오프라인 교육 일정 보기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
