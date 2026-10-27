import { getStudentState, isAdmin, type StudentState } from "@/lib/academy/auth";
import { canStudentView, findSubjectBySlug, type Subject } from "@/lib/academy/store";

export interface Viewer {
  // 워터마크에 표시할 문구
  label: string;
  name: string;
  isAdmin: boolean;
}

export type SubjectAccessResult =
  | { subject: undefined }
  | { subject: Subject; allowed: false; state: StudentState }
  | { subject: Subject; allowed: true; viewer: Viewer };

function maskPhone(phone: string): string {
  return phone.replace(/^(\d{3})-(\d{3,4})-(\d{4})$/, "$1-****-$3");
}

// 과목 페이지의 layout 과 각 page 에서 모두 호출합니다.
// (layout 에서만 막으면 page 데이터가 응답에 섞여 나갈 수 있으므로 page 에서도 다시 확인합니다.)
export async function getSubjectAccess(slug: string): Promise<SubjectAccessResult> {
  const subject = findSubjectBySlug(slug);
  if (!subject) return { subject: undefined };

  const state = await getStudentState();
  if (state.status === "ok" && canStudentView(state.student, subject)) {
    const s = state.student;
    return {
      subject,
      allowed: true,
      viewer: {
        name: s.name,
        label: `${s.name} · ${s.username} · ${maskPhone(s.phone)}`,
        isAdmin: false,
      },
    };
  }
  if (await isAdmin()) {
    return {
      subject,
      allowed: true,
      viewer: { name: "관리자", label: "관리자 미리보기", isAdmin: true },
    };
  }
  return { subject, allowed: false, state };
}
