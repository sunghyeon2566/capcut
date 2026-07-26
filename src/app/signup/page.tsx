"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { REGIONS } from "@/lib/regions";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!region) {
      setError("거주 지역(시/도)을 선택해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, region }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "회원가입에 실패했습니다.");
        setLoading(false);
        return;
      }
      router.push(`/welcome?name=${encodeURIComponent(name)}&region=${encodeURIComponent(region)}`);
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="container-x max-w-lg py-16">
      <span className="section-label">회원가입</span>
      <h1 className="mt-2 text-3xl font-bold text-navy-950">협회 회원가입</h1>
      <p className="mt-2 text-navy-800/80">
        회원가입 후 회원 전용 자료실과 전국 회원 현황 서비스를 이용할 수
        있습니다.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        <Field label="이름">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="홍길동"
            required
          />
        </Field>

        <Field label="이메일">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
            required
          />
        </Field>

        <Field label="비밀번호">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="8자 이상 입력해 주세요"
            required
          />
        </Field>

        <Field label="비밀번호 확인">
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="input-field"
            required
          />
        </Field>

        <Field label="거주 지역 (시/도)">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="input-field"
            required
          >
            <option value="">지역을 선택해 주세요</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "가입 처리 중..." : "회원가입"}
        </button>

        <p className="text-center text-sm text-navy-800/70">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-accent-600">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy-800">{label}</span>
      {children}
    </label>
  );
}
