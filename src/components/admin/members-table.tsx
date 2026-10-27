"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { adminRequest } from "@/components/admin/api";

export interface StudentRow {
  id: string;
  username: string;
  name: string;
  phone: string;
  subjectIds: string[];
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface SubjectOption {
  id: string;
  name: string;
  access: "all" | "approved";
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }) : "-";

export function MembersTable({
  students,
  subjects,
}: {
  students: StudentRow[];
  subjects: SubjectOption[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return students.filter((s) => {
      if (filter === "pending" && s.subjectIds.length > 0) return false;
      if (filter && filter !== "pending" && !s.subjectIds.includes(filter)) return false;
      if (!q) return true;
      return (
        s.username.includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (qDigits.length > 0 && s.phone.replace(/\D/g, "").includes(qDigits))
      );
    });
  }, [students, query, filter]);

  function downloadCsv() {
    const header = ["아이디", "이름", "전화번호", "시청 과목", "상태", "가입일", "최근 로그인"];
    const rows = filtered.map((s) => [
      s.username,
      s.name,
      s.phone,
      subjects.filter((x) => s.subjectIds.includes(x.id)).map((x) => x.name).join(" / "),
      s.active ? "이용 중" : "정지",
      fmt(s.createdAt),
      fmt(s.lastLoginAt),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    // 엑셀에서 한글이 깨지지 않도록 BOM 을 붙입니다.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `수강생목록_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-72">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="아이디 · 이름 · 전화번호 검색"
            className="input-field"
          />
        </div>
        <div className="w-full sm:w-52">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field">
          <option value="">전체 수강생</option>
          <option value="pending">배정된 과목 없음</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} 수강생
            </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-navy-800/60">{filtered.length}명</span>
        <button type="button" onClick={downloadCsv} className="btn-secondary ml-auto px-3 py-2 text-sm">
          엑셀(CSV) 내려받기
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="card mt-4 p-6 text-sm text-navy-800/70">해당하는 수강생이 없습니다.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {filtered.map((s) => (
            <MemberRow key={s.id} student={s} subjects={subjects} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MemberRow({ student, subjects }: { student: StudentRow; subjects: SubjectOption[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(student.name);
  const [phone, setPhone] = useState(student.phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(body: Record<string, unknown>, done?: () => void) {
    setBusy(true);
    setError(null);
    const err = await adminRequest(`/api/admin/students/${student.id}`, "PATCH", body);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    done?.();
    router.refresh();
  }

  function toggleSubject(id: string) {
    const next = student.subjectIds.includes(id)
      ? student.subjectIds.filter((x) => x !== id)
      : [...student.subjectIds, id];
    save({ subjectIds: next });
  }

  function resetPassword() {
    const pw = window.prompt(`${student.name}(${student.username})님의 새 비밀번호를 입력하세요. (6자 이상)`);
    if (!pw) return;
    save({ password: pw }, () => window.alert("비밀번호를 변경했습니다. 수강생에게 새 비밀번호를 알려 주세요."));
  }

  async function remove() {
    if (!window.confirm(`${student.name}(${student.username}) 수강생을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setBusy(true);
    const err = await adminRequest(`/api/admin/students/${student.id}`, "DELETE");
    setBusy(false);
    if (err) setError(err);
    else router.refresh();
  }

  return (
    <li className={`card p-4 ${student.active ? "" : "opacity-60"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {editing ? (
            <div className="flex flex-wrap gap-2">
              <div className="w-32">
                <input value={name} onChange={(e) => setName(e.target.value)} className="input-field py-1.5" />
              </div>
              <div className="w-40">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field py-1.5" />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => save({ name, phone }, () => setEditing(false))}
                className="btn-primary px-3 py-1.5 text-sm"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setName(student.name);
                  setPhone(student.phone);
                }}
                className="btn-secondary px-3 py-1.5 text-sm"
              >
                취소
              </button>
            </div>
          ) : (
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <strong className="text-navy-950">{student.name}</strong>
              <span className="font-mono text-sm text-navy-800/80">{student.username}</span>
              <span className="text-sm text-navy-800/80">{student.phone}</span>
              {!student.active && (
                <span className="rounded bg-red-50 px-1.5 text-xs font-semibold text-red-600">정지</span>
              )}
            </p>
          )}
          <p className="mt-1 text-xs text-navy-800/55">
            가입 {fmt(student.createdAt)} · 최근 로그인 {fmt(student.lastLoginAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {!editing && (
            <button type="button" onClick={() => setEditing(true)} className="btn-secondary px-2.5 py-1 text-xs">
              정보 수정
            </button>
          )}
          <button type="button" disabled={busy} onClick={resetPassword} className="btn-secondary px-2.5 py-1 text-xs">
            비밀번호 재설정
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => save({ active: !student.active })}
            className="btn-secondary px-2.5 py-1 text-xs"
          >
            {student.active ? "이용 정지" : "정지 해제"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="rounded-lg border border-red-200 px-2.5 py-1 font-semibold text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy-100 pt-3">
          <span className="text-xs font-semibold text-navy-800/60">시청 가능 과목</span>
          {subjects.map((sub) =>
            sub.access === "all" ? (
              <span
                key={sub.id}
                className="rounded-full bg-navy-50 px-2.5 py-1 text-xs text-navy-800/60"
                title="전체 공개 과목은 모든 수강생이 볼 수 있습니다"
              >
                {sub.name} (전체 공개)
              </span>
            ) : (
              <label
                key={sub.id}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                  student.subjectIds.includes(sub.id)
                    ? "border-navy-700 bg-navy-900 text-white"
                    : "border-navy-100 text-navy-800"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={student.subjectIds.includes(sub.id)}
                  disabled={busy}
                  onChange={() => toggleSubject(sub.id)}
                />
                {student.subjectIds.includes(sub.id) ? "✓ " : "+ "}
                {sub.name}
              </label>
            )
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </li>
  );
}
