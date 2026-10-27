import { isAdmin } from "@/lib/academy/auth";
import { getSettings } from "@/lib/academy/store";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  if (!(await isAdmin())) return null;
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-navy-950">보안 설정</h1>
      <p className="mt-1 text-sm text-navy-800/70">
        녹화본 무단 녹화·유출을 줄이기 위한 기능입니다. 모든 과목 페이지에 함께 적용됩니다.
      </p>
      <SettingsForm initial={getSettings()} />

      <div className="card mt-8 p-5 text-sm leading-relaxed text-navy-800/80">
        <p className="font-bold text-navy-950">화면 녹화를 완전히 막을 수 있나요?</p>
        <p className="mt-2">
          일반 웹페이지에서는 휴대폰으로 화면을 찍거나 OBS 같은 녹화 프로그램을 쓰는 것을 100% 막을 수
          없습니다. 그래서 이 강의실은 <strong>녹화를 어렵게 하고(창 이탈·캡처 단축키 감지, 다운로드 차단),
          유출되면 누가 했는지 알 수 있게(워터마크)</strong> 하는 방식을 씁니다. 실제로 유출 억제 효과가 가장
          큰 것은 워터마크입니다.
        </p>
        <p className="mt-2">
          녹화 프로그램 화면에 영상이 까맣게 나오도록 하려면 DRM(Widevine · FairPlay) 암호화가 필요하며,
          콜러스(Kollus), VdoCipher 같은 DRM 영상 호스팅 서비스와 연동하면 적용할 수 있습니다(유료).
        </p>
      </div>
    </div>
  );
}
