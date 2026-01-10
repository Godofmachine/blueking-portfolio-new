import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@lib/supabase/server";
import { createSupabaseServiceClient } from "@lib/supabase/service";
import { isAdminEmail } from "@lib/auth/admin";
import type { ProjectStatus } from "@lib/projects/types";

function asStatus(value: unknown): ProjectStatus | null {
  if (value === "draft" || value === "published") return value;
  return null;
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
          error:
            "Supabase Auth is temporarily unreachable. Please refresh and try again.",
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

  return { ok: true as const, userEmail: email! };
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json()) as any;

    const idsRaw = Array.isArray(body?.ids) ? body.ids : [];
    const ids = idsRaw.map((id: any) => String(id)).filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }

    const status = asStatus(body?.status);
    const isFeatured =
      body?.isFeatured === true ? true : body?.isFeatured === false ? false : null;

    if (status === null && isFeatured === null) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const update: any = {
      updated_at: new Date().toISOString(),
    };

    if (status !== null) update.status = status;
    if (isFeatured !== null) update.is_featured = isFeatured;

    const supabase = createSupabaseServiceClient();

    const { error } = await supabase.from("projects").update(update).in("id", ids);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Bulk update failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
