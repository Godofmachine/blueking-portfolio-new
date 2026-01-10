import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@lib/supabase/server";
import { createSupabaseServiceClient } from "@lib/supabase/service";
import { isAdminEmail } from "@lib/auth/admin";
import type {
  Project,
  ProjectCategory,
  ProjectStatus,
} from "@lib/projects/types";

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

function asCategory(value: string | null): ProjectCategory | null {
  if (value === "development" || value === "design" || value === "motion") return value;
  return null;
}

function asStatus(value: string | null): ProjectStatus | null {
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

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const category = asCategory(url.searchParams.get("category"));
  const status = asStatus(url.searchParams.get("status"));

  try {
    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("projects")
      .select(
        "id,title,slug,description,category,status,is_featured,featured_rank,tools,tags,cover_image_url,cover_image_public_id,video_url,updated_at"
      )
      .order("updated_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    const projects: Project[] = (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      category: row.category,
      status: row.status,
      isFeatured: Boolean(row.is_featured),
      featuredRank: row.featured_rank,
      tools: Array.isArray(row.tools) ? row.tools : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
      coverImageUrl: row.cover_image_url,
      coverImagePublicId: row.cover_image_public_id,
      videoUrl: row.video_url,
      updatedAt: row.updated_at,
      images: [],
      links: [],
    }));

    return NextResponse.json({ projects });
  } catch (err) {
    return NextResponse.json(
      {
        error: errorToMessage(err) || "Failed to fetch projects",
        ...(process.env.NODE_ENV !== "production" ? { debug: err } : null),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json()) as any;

    const title = String(body.title ?? "").trim();
    const slug = String(body.slug ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = asCategory(String(body.category ?? null));
    const status = asStatus(String(body.status ?? null));

    if (!title || !slug || !description || !category || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isFeatured = Boolean(body.isFeatured);
    const featuredRank =
      body.featuredRank === null || body.featuredRank === undefined || body.featuredRank === ""
        ? null
        : Number(body.featuredRank);

    const tools = Array.isArray(body.tools)
      ? body.tools.map((v: any) => String(v).trim()).filter(Boolean)
      : [];
    const tags = Array.isArray(body.tags)
      ? body.tags.map((v: any) => String(v).trim()).filter(Boolean)
      : [];

    const coverImageUrl = body.coverImageUrl ? String(body.coverImageUrl) : null;
    const coverImagePublicId = body.coverImagePublicId
      ? String(body.coverImagePublicId)
      : null;

    const videoUrl = body.videoUrl ? String(body.videoUrl) : null;

    const links = Array.isArray(body.links) ? body.links : [];
    const images = Array.isArray(body.images) ? body.images : [];

    const supabase = createSupabaseServiceClient();

    const { data: created, error: createError } = await supabase
      .from("projects")
      .insert({
        title,
        slug,
        description,
        category,
        status,
        is_featured: isFeatured,
        featured_rank: Number.isFinite(featuredRank) ? featuredRank : null,
        tools,
        tags,
        cover_image_url: coverImageUrl,
        cover_image_public_id: coverImagePublicId,
        video_url: videoUrl,
      })
      .select("id")
      .single();

    if (createError) throw createError;

    const projectId = created.id as string;

    if (images.length > 0) {
      const mediaRows = images.map((img: any, index: number) => ({
        project_id: projectId,
        url: String(img.url ?? ""),
        public_id: img.publicId ? String(img.publicId) : null,
        alt_text: img.altText ? String(img.altText) : null,
        sort_order:
          Number.isFinite(Number(img.sortOrder)) ? Number(img.sortOrder) : index,
      }));

      const { error } = await supabase.from("project_media").insert(mediaRows);
      if (error) throw error;
    }

    if (links.length > 0) {
      const linkRows = links
        .map((l: any) => ({
          project_id: projectId,
          kind: String(l.kind ?? ""),
          url: String(l.url ?? ""),
        }))
        .filter((l: any) => l.kind && l.url);

      if (linkRows.length > 0) {
        const { error } = await supabase.from("project_links").insert(linkRows);
        if (error) throw error;
      }
    }

    return NextResponse.json({ id: projectId }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: errorToMessage(err) || "Failed to create project",
        ...(process.env.NODE_ENV !== "production" ? { debug: err } : null),
      },
      { status: 500 }
    );
  }
}
