import Link from "next/link";
import { ASSETS } from "@/lib/assets";

export function SiteFooter() {
  return (
    <footer className="border-t border-navy-100 bg-navy-950 text-navy-100">
      <div className="container-wide grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.logo}
              alt="한국콘텐츠능률협회 로고"
              className="h-12 w-12 shrink-0 rounded-full bg-white p-0.5"
            />
            <span className="leading-tight">
              <span className="block text-[0.65rem] tracking-wide text-navy-100/60">
                사단법인
              </span>
              <span className="block font-bold text-white">한국콘텐츠능률협회</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-navy-100/80">
            AI 콘텐츠 제작 교육과 인재 양성을 통해
            <br />
            대한민국 콘텐츠 산업의 미래를 만들어갑니다.
          </p>
        </div>

        <div className="text-sm text-navy-100/80">
          <p className="mb-3 font-semibold text-white">협회 안내</p>
          <p>주소: 서울특별시 강남구 테헤란로 427, 7층</p>
          <p>대표전화: 02-1234-5678</p>
          <p>이메일: info@kcca-edu.or.kr</p>
          <p>사업자등록번호: 123-45-67890</p>
        </div>

        <div className="text-sm text-navy-100/80">
          <p className="mb-3 font-semibold text-white">바로가기</p>
          <ul className="space-y-1.5">
            <li><Link href="/instructors" className="hover:text-white">강사진 소개</Link></li>
            <li><Link href="/programs" className="hover:text-white">교육 프로그램</Link></li>
            <li><Link href="/events" className="hover:text-white">전시회·공모전·행사</Link></li>
            <li><Link href="/resources" className="hover:text-white">회원 전용 자료실</Link></li>
          </ul>
        </div>

        <div className="text-sm text-navy-100/80">
          <p className="mb-3 font-semibold text-white">회원 서비스</p>
          <ul className="space-y-1.5">
            <li><Link href="/signup" className="hover:text-white">회원가입</Link></li>
            <li><Link href="/login" className="hover:text-white">로그인</Link></li>
            <li><Link href="/map" className="hover:text-white">전국 회원 현황</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-navy-100/60">
        © {new Date().getFullYear()} 사단법인 한국콘텐츠능률협회. All rights reserved.
      </div>
    </footer>
  );
}
