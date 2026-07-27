import type { Metadata } from "next";
import Image from "next/image";
import { INSTRUCTORS, INSTRUCTOR_COUNT } from "@/lib/instructors";

export const metadata: Metadata = {
  title: "강사진 소개 | 한국콘텐츠능률협회",
};

export default function InstructorsPage() {
  return (
    <div>
      <section className="bg-navy-950 py-16 text-white">
        <div className="container-wide">
          <p className="eyebrow">Our Instructors</p>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            현장을 아는 전담 강사 {INSTRUCTOR_COUNT}인
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/70">
            한국콘텐츠능률협회의 모든 강의는 협회에 소속된 전담 강사진이 직접
            설계하고 진행합니다. 각 분야에서 검증된 실무 경험을 가진 강사들이
            수강생과 함께합니다.
          </p>
        </div>
      </section>

      <section className="container-wide py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INSTRUCTORS.map((instructor) => (
            /* id 는 메인 화면 강사 패널에서 넘어오는 앵커(/instructors#슬러그) 대상입니다.
               scroll-mt 은 상단 고정 헤더에 가려지지 않도록 하는 여백입니다. */
            <div
              key={instructor.id}
              id={instructor.slug}
              className="scroll-mt-32 border border-navy-100 bg-white"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-navy-900">
                <Image
                  src={instructor.photo}
                  alt={`${instructor.name} 강사`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  className="object-cover"
                  style={{ objectPosition: "50% 22%" }}
                />
              </div>

              <div className="p-5">
                <p className="text-lg font-bold text-navy-950">{instructor.name}</p>

                {instructor.title ? (
                  <p className="mt-1 text-sm font-semibold text-accent-600">
                    {instructor.title}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-navy-800/40">직함 준비 중</p>
                )}

                {instructor.specialty && (
                  <p className="mt-3 text-xs font-semibold text-navy-700">
                    전문 분야 · {instructor.specialty}
                  </p>
                )}

                {instructor.bio && (
                  <p className="mt-3 text-sm leading-relaxed text-navy-800/85">
                    {instructor.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-navy-800/50">
          ※ 강사별 직함·전문 분야·약력은 확정된 정보를 받는 대로 입력됩니다.
        </p>
      </section>
    </div>
  );
}
