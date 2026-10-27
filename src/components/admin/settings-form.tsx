"use client";

import { useState } from "react";
import { adminRequest } from "@/components/admin/api";

interface Settings {
  watermark: boolean;
  pauseOnBlur: boolean;
  singleSession: boolean;
}

const ITEMS: { key: keyof Settings; title: string; body: string }[] = [
  {
    key: "watermark",
    title: "시청자 워터마크",
    body: "영상 위에 수강생 이름 · 아이디 · 전화번호 뒷자리와 시청 시각을 표시하고 위치를 계속 바꿉니다. 녹화본이 유출되면 누가 유출했는지 확인할 수 있습니다.",
  },
  {
    key: "pauseOnBlur",
    title: "창 이탈 · 캡처 감지 시 영상 가림",
    body: "다른 창이나 탭(캡처 도구, 녹화 프로그램 등)으로 이동하면 영상을 멈추고 검은 화면으로 가립니다. 듀얼 모니터로 필기하며 보는 수강생은 불편할 수 있습니다.",
  },
  {
    key: "singleSession",
    title: "동시 접속 차단 (계정 공유 방지)",
    body: "한 계정은 마지막으로 로그인한 기기 한 곳에서만 볼 수 있습니다. 다른 사람에게 아이디를 빌려주면 기존 기기가 로그아웃됩니다.",
  },
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function toggle(key: keyof Settings) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    const err = await adminRequest("/api/admin/settings", "PUT", { [key]: next[key] });
    if (err) {
      setError(err);
      setSettings(settings);
    } else setError(null);
  }

  return (
    <div className="mt-6 space-y-3">
      {ITEMS.map((item) => (
        <label key={item.key} className="card flex cursor-pointer items-start gap-4 p-5">
          <input
            type="checkbox"
            checked={settings[item.key]}
            onChange={() => toggle(item.key)}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent-600)]"
          />
          <span>
            <span className="block font-semibold text-navy-950">{item.title}</span>
            <span className="mt-1 block text-sm text-navy-800/70">{item.body}</span>
          </span>
        </label>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-navy-800/55">
        항상 적용: 다운로드 버튼 · 우클릭 · 드래그 · PIP 차단, 로그인한 수강생만 영상 파일 접근,
        검색엔진 노출 차단
      </p>
    </div>
  );
}
