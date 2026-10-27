"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// 로그인 후 돌아갈 주소 — 강의실 내부 주소만 허용합니다(외부 사이트로의 이동 방지).
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/class") && !next.startsWith("//") ? next : "/class";
}

async function postJson(url: string, body: unknown): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data.error ?? "요청을 처리하지 못했습니다.";
  } catch {
    return "네트워크 오류가 발생했습니다. 다시 시도해 주세요.";
  }
}

export function StudentLoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await postJson("/api/class/login", { username, password });
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    router.push(safeNext(next));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
      <Field label="아이디">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
          autoComplete="username"
          autoCapitalize="none"
          required
        />
      </Field>
      <Field label="비밀번호">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          autoComplete="current-password"
          required
        />
      </Field>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-center text-sm text-navy-800/70">
        처음 오셨나요?{" "}
        <Link
          href={next ? `/class/signup?next=${encodeURIComponent(next)}` : "/class/signup"}
          className="font-semibold text-accent-600"
        >
          회원가입
        </Link>
      </p>
      <p className="text-center text-xs text-navy-800/50">
        아이디·비밀번호를 잊으셨다면 강사에게 문의해 주세요.
      </p>
    </form>
  );
}

function formatPhoneInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export function StudentSignupForm({ next }: { next?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({
      ...f,
      [key]: key === "phone" ? formatPhoneInput(e.target.value) : e.target.value,
    }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agree) {
      setError("개인정보 수집·이용에 동의해 주세요.");
      return;
    }
    setLoading(true);
    const err = await postJson("/api/class/signup", {
      username: form.username,
      password: form.password,
      name: form.name,
      phone: form.phone,
      agree,
    });
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    router.push(safeNext(next));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
      <Field label="아이디" hint="영문 소문자·숫자·밑줄(_) 4~20자">
        <input
          value={form.username}
          onChange={set("username")}
          className="input-field"
          autoComplete="username"
          autoCapitalize="none"
          pattern="[a-zA-Z0-9_]{4,20}"
          required
        />
      </Field>
      <Field label="비밀번호" hint="6자 이상">
        <input
          type="password"
          value={form.password}
          onChange={set("password")}
          className="input-field"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </Field>
      <Field label="비밀번호 확인">
        <input
          type="password"
          value={form.passwordConfirm}
          onChange={set("passwordConfirm")}
          className="input-field"
          autoComplete="new-password"
          required
        />
      </Field>
      <Field label="이름">
        <input
          value={form.name}
          onChange={set("name")}
          className="input-field"
          autoComplete="name"
          placeholder="홍길동"
          required
        />
      </Field>
      <Field label="휴대폰 번호">
        <input
          type="tel"
          inputMode="numeric"
          value={form.phone}
          onChange={set("phone")}
          className="input-field"
          autoComplete="tel"
          placeholder="010-1234-5678"
          required
        />
      </Field>

      <label className="flex items-start gap-2 rounded-md bg-navy-50 p-3 text-sm text-navy-800/85">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent-600)]"
        />
        <span>
          <strong className="text-navy-950">[필수] 개인정보 수집·이용 동의</strong>
          <br />
          수집 항목: 아이디, 이름, 휴대폰 번호 / 목적: 수강생 확인 및 녹화본 제공, 무단 유출 방지
          / 보유 기간: 회원 탈퇴 시까지
        </span>
      </label>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "가입 처리 중..." : "회원가입"}
      </button>
      <p className="text-center text-sm text-navy-800/70">
        이미 계정이 있으신가요?{" "}
        <Link
          href={next ? `/class/login?next=${encodeURIComponent(next)}` : "/class/login"}
          className="font-semibold text-accent-600"
        >
          로그인
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold text-navy-800">
        {label}
        {hint && <span className="text-xs font-normal text-navy-800/55">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
