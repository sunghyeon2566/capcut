import Link from "next/link";
import { PROGRAM_STATS } from "@/lib/programs";
import { INSTRUCTORS } from "@/lib/instructors";
import { EVENTS } from "@/lib/events";

export default function Home() {
  const featuredInstructors = INSTRUCTORS.slice(0, 4);
  const upcomingEvents = EVENTS.filter((e) => e.status === "예정").slice(0, 3);

  return (
    <div>
      <section className="bg-navy-950 text-white">
        <div className="container-x grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="section-label">사단법인 한국콘텐츠능률협회</span>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
              AI 콘텐츠 제작 교육으로
              <br />
              대한민국 콘텐츠 인재를 키웁니다
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100/90 sm:text-lg">
              한국콘텐츠능률협회는 검증된 10인의 전담 강사진과 함께 연 50주, 50회의
              체계적인 강의를 운영하며 AI 콘텐츠 기획부터 제작, 창업까지 이어지는
              실무형 인재 양성 프로그램을 제공합니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/programs" className="btn-primary">
                교육 프로그램 살펴보기
              </Link>
              <Link href="/signup" className="btn-secondary bg-transparent text-white hover:text-white">
                회원가입 하기
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {PROGRAM_STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-2xl font-bold text-accent-500 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-navy-100/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-50">
        <div className="container-x py-16 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="section-label">협회를 이끄는 사람들</span>
              <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
                현장 경험이 살아있는 강사진
              </h2>
              <p className="mt-2 max-w-2xl text-navy-800/80">
                모든 강의는 협회 소속 전담 강사 10인이 직접 설계하고 진행합니다.
                이론이 아닌 실전 경험을 기반으로 커리큘럼을 만듭니다.
              </p>
            </div>
            <Link href="/instructors" className="btn-secondary shrink-0">
              강사진 전체 보기
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredInstructors.map((instructor) => (
              <Link
                key={instructor.id}
                href="/instructors"
                className="card group flex flex-col items-center p-6 text-center transition-shadow hover:shadow-md"
              >
                {/* NOTE: i.pravatar.cc 임시 이미지입니다. 실제 강사 프로필 사진으로 교체해 주세요. */}
                <img
                  src={`https://i.pravatar.cc/300?img=${instructor.avatarSeed}`}
                  alt={`${instructor.name} 강사 프로필 사진`}
                  className="h-24 w-24 rounded-full border-4 border-navy-100 object-cover"
                />
                <p className="mt-4 font-bold text-navy-950">{instructor.name}</p>
                <p className="mt-1 text-sm text-accent-600">{instructor.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <span className="section-label">협회 소개</span>
            <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
              왜 한국콘텐츠능률협회인가요
            </h2>
            <p className="mt-4 text-navy-800/80">
              단순한 지식 전달이 아니라, 실제로 콘텐츠 산업에서 활동할 수 있는
              역량을 기르는 것을 목표로 합니다.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 lg:col-span-2">
            <div className="card p-6">
              <p className="text-lg font-bold text-navy-950">체계적인 커리큘럼</p>
              <p className="mt-2 text-sm text-navy-800/80">
                연 50주, 50회 강의를 5개 트랙으로 구성해 기획부터 창업까지 단계적으로
                학습합니다.
              </p>
            </div>
            <div className="card p-6">
              <p className="text-lg font-bold text-navy-950">전담 강사진</p>
              <p className="mt-2 text-sm text-navy-800/80">
                현업 경력을 갖춘 10인의 전담 강사가 강의 전 과정을 책임지고
                운영합니다.
              </p>
            </div>
            <div className="card p-6">
              <p className="text-lg font-bold text-navy-950">회원 전용 혜택</p>
              <p className="mt-2 text-sm text-navy-800/80">
                회원 전용 자료실, 전시회·공모전 우선 참가 등 다양한 회원 혜택을
                제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-50">
        <div className="container-x py-16 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="section-label">전시회 · 공모전 · 행사</span>
              <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
                다가오는 협회 행사
              </h2>
            </div>
            <Link href="/events" className="btn-secondary shrink-0">
              행사 전체 보기
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="card p-6">
                <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-600">
                  {event.category}
                </span>
                <p className="mt-3 font-bold text-navy-950">{event.title}</p>
                <p className="mt-1 text-sm text-navy-800/70">{event.date}</p>
                <p className="mt-3 text-sm text-navy-800/80">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 sm:py-20">
        <div className="card overflow-hidden bg-navy-900 p-10 text-white sm:p-14">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                전국 회원 현황을 실시간으로 확인해보세요
              </h2>
              <p className="mt-3 max-w-xl text-navy-100/80">
                우리 지역의 회원 수는 몇 명일까요? 회원가입을 통해 우리 지역의
                순위를 함께 높여보세요.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/map" className="btn-secondary bg-white text-navy-900 hover:text-navy-900">
                전국 회원 현황 보기
              </Link>
              <Link href="/signup" className="btn-primary">
                회원가입 하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
