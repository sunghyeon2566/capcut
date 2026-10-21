import type { Metadata } from "next";
import { SlideDeck } from "@/components/slide-deck";
import { MINDAM_SLIDES } from "@/lib/mindam";

export const metadata: Metadata = {
  title: "민담 제작 방법 · 딥마크온 클래스",
  description: "민담 롱폼 영상을 만드는 순서를 슬라이드로 안내합니다.",
};

export default function MindamGuidePage() {
  return <SlideDeck slides={MINDAM_SLIDES} backHref="/mindam" />;
}
