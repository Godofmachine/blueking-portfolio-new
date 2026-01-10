import { NextResponse } from "next/server";

import { seedStaticProjectsToDb } from "@lib/projects/seedStatic";

function isAuthorized(request: Request): boolean {
  // Vercel Cron Jobs send x-vercel-cron: 1
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
    const result = await seedStaticProjectsToDb({
      categories: ["development", "motion"],
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Seed failed",
      },
      { status: 500 }
    );
  }
}
