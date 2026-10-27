"use client";

import { useRouter } from "next/navigation";
import { adminRequest } from "@/components/admin/api";

export function DeleteSubjectButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  async function handleClick() {
    const typed = window.prompt(
      `과목을 삭제하면 카테고리와 업로드한 영상 파일이 모두 삭제됩니다.\n삭제하려면 과목 이름 "${name}"을(를) 입력하세요.`
    );
    if (typed !== name) return;
    const err = await adminRequest(`/api/admin/subjects/${id}`, "DELETE");
    if (err) {
      window.alert(err);
      return;
    }
    router.push("/admin/subjects");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
    >
      과목 삭제
    </button>
  );
}
