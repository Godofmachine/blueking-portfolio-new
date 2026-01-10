import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { getLandingSettings, saveLandingSettings } from "@/lib/site/settings";

function errorToMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const anyErr = err as any;
    if (typeof anyErr.message === "string" && anyErr.message.trim()) return anyErr.message;
    if (typeof anyErr.error === "string" && anyErr.error.trim()) return anyErr.error;
    if (typeof anyErr.details === "string" && anyErr.details.trim()) return anyErr.details;
    try {
      return JSON.stringify(err);
    } catch {
      return "Request failed";
    }
  }
  return "Request failed";
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  let userData = await supabase.auth.getUser();
  if (userData.error) {
    await new Promise((r) => setTimeout(r, 300));
    userData = await supabase.auth.getUser();
  }

  if (userData.error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "Supabase Auth is temporarily unreachable. Please refresh and try again.",
        },
        { status: 503 }
      ),
    };
  }

  const user = userData.data.user;
  const email = user?.email ?? null;

  if (!user || !isAdminEmail(email)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true as const };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const settings = await getLandingSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json(
      { error: errorToMessage(err) || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const body = await request.json().catch(() => ({} as any));
    const settings = await saveLandingSettings(body?.settings);
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json(
      { error: errorToMessage(err) || "Failed to save settings" },
      { status: 500 }
    );
  }
}
