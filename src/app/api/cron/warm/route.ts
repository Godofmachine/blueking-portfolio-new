import { NextResponse } from "next/server";

import { fetchProjectsByCategory } from "@lib/projects/public";

function isAuthorized(request: Request): boolean {
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron === "1") return true;

  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return false;
  const token = auth.slice("bearer ".length);
  return token === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Warm the server + hit Supabase once so the first real visitor is less likely to see a cold path.
    await fetchProjectsByCategory({ featuredOnly: true, featuredLimitPerCategory: 4 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Warm failed" },
      { status: 500 }
    );
  }
}
