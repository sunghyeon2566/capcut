"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest } from "@/components/admin/api";

export function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const err = await adminRequest("/api/admin/login", "POST", { username, password });
    setLoading(false);
    if (err) setError(err);
    else router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4 p-6">
        <div>
          <p className="section-label">Admin</p>
          <h1 className="text-xl font-bold text-navy-950">강의실 관리자 로그인</h1>
        </div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
          placeholder="관리자 아이디"
          autoComplete="username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="비밀번호"
          autoComplete="current-password"
          required
        />
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "확인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
