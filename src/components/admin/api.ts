// 관리자 화면에서 쓰는 fetch 도우미. 실패하면 서버가 준 오류 문구를 돌려줍니다.
export async function adminRequest(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data.error ?? "요청을 처리하지 못했습니다.";
  } catch {
    return "네트워크 오류가 발생했습니다.";
  }
}
