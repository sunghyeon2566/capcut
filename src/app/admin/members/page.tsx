import { isAdmin } from "@/lib/academy/auth";
import { getStudents, getSubjects } from "@/lib/academy/store";
import { MembersTable, type StudentRow } from "@/components/admin/members-table";

export default async function AdminMembersPage() {
  if (!(await isAdmin())) return null;
  // 비밀번호 해시 · 세션 id 는 화면으로 보내지 않습니다.
  const students: StudentRow[] = getStudents().map((s) => ({
    id: s.id,
    username: s.username,
    name: s.name,
    phone: s.phone,
    subjectIds: s.subjectIds,
    active: s.active,
    createdAt: s.createdAt,
    lastLoginAt: s.lastLoginAt,
  }));
  const subjects = getSubjects().map((s) => ({ id: s.id, name: s.name, access: s.access }));

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-navy-950">수강생 관리</h1>
      <p className="mt-1 text-sm text-navy-800/70">
        수강생의 아이디·이름·전화번호를 확인하고, 과목별 시청 권한을 지정합니다. 비밀번호는 암호화되어
        저장되므로 확인할 수 없고, 필요하면 새 비밀번호로 재설정할 수 있습니다.
      </p>
      <MembersTable students={students} subjects={subjects} />
    </div>
  );
}
