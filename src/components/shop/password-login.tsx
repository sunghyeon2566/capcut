"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface PasswordLoginProps {
  endpoint: string;
  label: string;
  title: string;
  description: string;
}

// 강사 관리자 / 수강생 관리자 공용 비밀번호 로그인 화면
export function PasswordLogin({ endpoint, label, title, description }: PasswordLoginProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <span className="text-xs font-bold tracking-wide text-neutral-400">{label}</span>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{description}</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shop-input mt-6"
          placeholder="비밀번호"
          autoFocus
          required
        />
        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="shop-btn-dark mt-4 w-full">
          {loading ? "확인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
