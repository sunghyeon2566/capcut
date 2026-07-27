import Link from "next/link";
import Image from "next/image";
import { FEATURED_INSTRUCTORS, INSTRUCTOR_COUNT } from "@/lib/instructors";

// 강사 소개 라인입니다.
//
// 강사 8인이 한 줄에 모두 보이고, 마우스를 올린 패널만 폭이 넓어지면서
// 사진이 크게 드러납니다. 이름은 호버하지 않아도 항상 하단에 표시됩니다.
// 확장 동작은 globals.css 의 .panel-row / .panel 규칙이 담당하므로
// 이 컴포넌트는 상태 없이 렌더링만 합니다.
//
// [향후 강사 상세 페이지 연결]
// 지금은 강사진 목록의 해당 강사 위치(/instructors#슬러그)로 이동합니다.
// 상세 페이지를 만들면 아래 instructorHref 의 반환값만 바꾸면 됩니다.

function instructorHref(slug: string): string {
  return `/instructors#${slug}`;
}

export function InstructorPanels() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container-wide">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Our Instructors</p>
            <h2 className="mt-5 text-2xl font-bold leading-snug text-navy-950 sm:text-4xl">
              현장을 아는 강사가
              <br />
              직접 가르칩니다
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-navy-800/75">
              협회의 모든 강의는 소속 전담 강사 {INSTRUCTOR_COUNT}인이 커리큘럼
              설계부터 강의까지 책임지고 진행합니다. 이론 전달이 아닌 현업 경험을
              기반으로 합니다.
            </p>
          </div>
          <Link href="/instructors" className="btn-secondary shrink-0">
            강사진 전체 보기
          </Link>
        </div>

        <div className="panel-row mt-12">
          {FEATURED_INSTRUCTORS.map((instructor) => (
            <Link
              key={instructor.id}
              href={instructorHref(instructor.slug)}
              aria-label={`${instructor.name} 강사 소개 보기`}
              className="panel group block"
            >
              {/* 원본 사진이 3072x5504 등 매우 크기 때문에 next/image 로 렌더링해
                  화면 크기에 맞게 축소·WebP 변환된 이미지가 전달되도록 합니다.
                  sizes 는 패널의 실제 표시 폭(기본 155px, 확장 시 388px)에 맞춘 값입니다. */}
              <Image
                src={instructor.photo}
                alt={`${instructor.name} 강사`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 400px"
                className="panel-photo"
              />

              {/* 이름이 항상 읽히도록 하단 그라디언트를 깔아 둡니다 */}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 block h-1/2 bg-gradient-to-t from-navy-950 via-navy-950/72 to-transparent" />

              <span className="panel-bar" aria-hidden="true" />

              <span className="absolute inset-x-0 bottom-0 block p-4 lg:p-5">
                {/* 항상 보이는 영역 — 성명 */}
                <span className="block text-base font-bold leading-tight text-white lg:text-lg">
                  {instructor.name}
                </span>
                {instructor.title && (
                  <span className="mt-1 block text-xs leading-snug text-white/70">
                    {instructor.title}
                  </span>
                )}

                {/* 호버 시에만 펼쳐지는 영역 */}
                <span className="panel-extra block">
                  {instructor.specialty && (
                    <span className="mt-3 block text-sm leading-relaxed text-white/75">
                      {instructor.specialty}
                    </span>
                  )}
                  <span className="mt-3 inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-gold-300">
                    강사 소개 보기
                    <span aria-hidden="true">→</span>
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-navy-800/50">
          ※ 강사별 직함·전문 분야는 확정된 정보를 받는 대로 입력됩니다.
        </p>
      </div>
    </section>
  );
}
