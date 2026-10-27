import type { Metadata } from "next";
import { EVENTS } from "@/lib/events";

export const metadata: Metadata = {
  title: "전시회·공모전·행사 | 한국콘텐츠능률협회",
};

export default function EventsPage() {
  const upcoming = EVENTS.filter((e) => e.status === "예정");
  const past = EVENTS.filter((e) => e.status === "종료");

  return (
    <div>
      <section className="bg-navy-950 py-14 text-white">
        <div className="container-x">
          <span className="section-label">전시회 · 공모전 · 행사</span>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            배움을 넘어 성과로 이어지는 자리
          </h1>
          <p className="mt-3 max-w-2xl text-navy-100/85">
            한국콘텐츠능률협회는 정규 교육 외에도 전시회, 공모전, 오프라인
            행사를 정기적으로 운영하며 수강생과 회원들의 성과를 세상에
            선보일 수 있는 기회를 제공합니다.
          </p>
        </div>
      </section>

      <section className="container-x py-14">
        <h2 className="text-2xl font-bold text-navy-950">예정된 행사</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="bg-navy-50 py-14">
        <div className="container-x">
          <h2 className="text-2xl font-bold text-navy-950">지난 행사</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function EventCard({ event }: { event: (typeof EVENTS)[number] }) {
  const isUpcoming = event.status === "예정";
  return (
    <div className="card flex flex-col p-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-600">
          {event.category}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isUpcoming ? "bg-navy-900 text-white" : "bg-navy-100 text-navy-700"
          }`}
        >
          {event.status}
        </span>
      </div>
      <p className="mt-4 text-lg font-bold text-navy-950">{event.title}</p>
      <p className="mt-1 text-sm font-medium text-navy-700">{event.date}</p>
      <p className="mt-1 text-sm text-navy-800/60">{event.location}</p>
      <p className="mt-3 text-sm leading-relaxed text-navy-800/85">{event.description}</p>
    </div>
  );
}
