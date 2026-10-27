import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/academy/auth";
import { updateSettings, type SecuritySettings } from "@/lib/academy/store";

const KEYS: (keyof SecuritySettings)[] = ["watermark", "singleSession"];

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = ((await req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const patch: Partial<SecuritySettings> = {};
  for (const key of KEYS) {
    if (typeof body[key] === "boolean") patch[key] = body[key];
  }
  return NextResponse.json({ settings: updateSettings(patch) });
}
