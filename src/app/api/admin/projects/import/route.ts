import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@lib/supabase/server";
import { createSupabaseServiceClient } from "@lib/supabase/service";
import { isAdminEmail } from "@lib/auth/admin";
import type { ProjectCategory } from "@lib/projects/types";
import {
  csvToObjects,
  pickField,
  slugifyForCsv,
  splitList,
} from "@lib/projects/csv";

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

function asCategory(value: string): ProjectCategory | null {
  if (value === "development" || value === "design" || value === "motion") return value;
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

  return { ok: true as const, userEmail: email! };
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json()) as any;
    const csv = String(body?.csv ?? "");

    if (!csv.trim()) {
      return NextResponse.json({ error: "CSV is required" }, { status: 400 });
    }

    const { rows } = csvToObjects(csv);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No rows found. Make sure your CSV has a header row + at least one data row." },
        { status: 400 }
      );
    }

    if (rows.length > 200) {
      return NextResponse.json(
        { error: "Too many rows. Please import 200 projects or fewer at a time." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();

    const createdIds: string[] = [];
    const failures: Array<{ row: number; error: string; title?: string }> = [];

    // Row numbers are 2-based for user readability (header is row 1).
    for (let idx = 0; idx < rows.length; idx += 1) {
      const r = rows[idx];
      const rowNumber = idx + 2;

      const title = pickField(r, ["title", "name"]);
      const description = pickField(r, ["description", "desc", "summary"]);
      const categoryRaw = pickField(r, ["category", "type"]);

      const category = asCategory(categoryRaw);
      if (!title || !description || !category) {
        failures.push({
          row: rowNumber,
          title: title || undefined,
          error: "Missing required fields: title, description, category (development/design/motion)",
        });
        continue;
      }

      const slug = pickField(r, ["slug"]) || slugifyForCsv(title);

      const tools = splitList(pickField(r, ["tools", "tool", "stack", "tech"])) ;
      const tags = splitList(pickField(r, ["tags", "tag"])) ;

      const liveUrl = pickField(r, ["live_url", "live", "url", "website"]); 
      const githubUrl = pickField(r, ["github_url", "github"]); 
      const behanceUrl = pickField(r, ["behance_url", "behance"]); 
      const videoUrl = pickField(r, ["video_url", "video"]); 

      try {
        const { data: created, error: createError } = await supabase
          .from("projects")
          .insert({
            title,
            slug,
            description,
            category,
            status: "draft", // imported projects stay draft until images are added
            is_featured: false,
            featured_rank: null,
            tools,
            tags,
            cover_image_url: null,
            cover_image_public_id: null,
            video_url: category === "motion" && videoUrl ? videoUrl : null,
          })
          .select("id")
          .single();

        if (createError) throw createError;

        const projectId = created.id as string;
        createdIds.push(projectId);

        const linkRows = [
          liveUrl ? { project_id: projectId, kind: "live", url: liveUrl } : null,
          githubUrl ? { project_id: projectId, kind: "github", url: githubUrl } : null,
          behanceUrl ? { project_id: projectId, kind: "behance", url: behanceUrl } : null,
        ].filter(Boolean) as Array<{ project_id: string; kind: string; url: string }>;

        if (linkRows.length > 0) {
          const { error: linkError } = await supabase.from("project_links").insert(linkRows);
          if (linkError) throw linkError;
        }
      } catch (err) {
        failures.push({
          row: rowNumber,
          title,
          error: errorToMessage(err) || "Failed to create project",
        });
      }
    }

    return NextResponse.json({
      created: createdIds.length,
      failed: failures.length,
      ids: createdIds,
      failures,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: errorToMessage(err) || "Failed to import CSV",
        ...(process.env.NODE_ENV !== "production" ? { debug: err } : null),
      },
      { status: 500 }
    );
  }
}
