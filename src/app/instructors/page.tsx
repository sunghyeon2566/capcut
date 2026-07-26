import type { Metadata } from "next";
import { INSTRUCTORS } from "@/lib/instructors";

export const metadata: Metadata = {
  title: "강사진 소개 | 한국콘텐츠능률협회",
};

export default function InstructorsPage() {
  return (
    <div>
      <section className="bg-navy-950 py-14 text-white">
        <div className="container-x">
          <span className="section-label">강사진 소개</span>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            현장을 아는 전담 강사 10인
          </h1>
          <p className="mt-3 max-w-2xl text-navy-100/85">
            한국콘텐츠능률협회의 모든 강의는 협회에 소속된 전담 강사진이 직접
            설계하고 진행합니다. 각 분야에서 검증된 실무 경험을 가진 강사들이
            수강생과 함께합니다.
          </p>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INSTRUCTORS.map((instructor) => (
            <div key={instructor.id} className="card flex flex-col p-6">
              <div className="flex items-center gap-4">
                {/* NOTE: i.pravatar.cc 임시 이미지입니다. 실제 강사 프로필 사진으로 교체해 주세요. */}
                <img
                  src={`https://i.pravatar.cc/300?img=${instructor.avatarSeed}`}
                  alt={`${instructor.name} 강사 프로필 사진`}
                  className="h-20 w-20 rounded-full border-4 border-navy-100 object-cover"
                />
                <div>
                  <p className="text-lg font-bold text-navy-950">{instructor.name}</p>
                  <p className="text-sm font-semibold text-accent-600">{instructor.title}</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-semibold text-navy-700">
                전문 분야 · {instructor.specialty}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-navy-800/85">
                {instructor.bio}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
