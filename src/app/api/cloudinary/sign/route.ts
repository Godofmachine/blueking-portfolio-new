import crypto from "crypto";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@lib/supabase/server";
import { isAdminEmail } from "@lib/auth/admin";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  let userData = await supabase.auth.getUser();
  if (userData.error) {
    await new Promise((r) => setTimeout(r, 300));
    userData = await supabase.auth.getUser();
  }

  if (userData.error) {
    return NextResponse.json(
      { error: "Supabase Auth is temporarily unreachable. Please refresh and try again." },
      { status: 503 }
    );
  }

  const email = userData.data.user?.email ?? null;

  if (!userData.data.user || !isAdminEmail(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary env vars not configured" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({} as unknown));
  const folder =
    typeof (body as any)?.folder === "string" && (body as any).folder.trim()
      ? String((body as any).folder).trim()
      : "portfolio";

  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary expects the signature of the sorted params string.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature,
  });
}
