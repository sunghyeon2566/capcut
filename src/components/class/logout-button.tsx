"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({
  endpoint,
  redirectTo,
  className,
}: {
  endpoint: string;
  redirectTo: string;
  className?: string;
}) {
  const router = useRouter();
  async function handleClick() {
    await fetch(endpoint, { method: "POST" });
    router.push(redirectTo);
    router.refresh();
  }
  return (
    <button type="button" onClick={handleClick} className={className}>
      로그아웃
    </button>
  );
}
