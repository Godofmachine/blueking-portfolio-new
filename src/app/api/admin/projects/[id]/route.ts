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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await context.params;

  try {
    const supabase = createSupabaseServiceClient();

    const { data: projectRow, error: projectError } = await supabase
      .from("projects")
      .select(
        "id,title,slug,description,category,status,is_featured,featured_rank,tools,tags,cover_image_url,cover_image_public_id,video_url,updated_at"
      )
      .eq("id", id)
      .single();

    if (projectError) throw projectError;

    const { data: mediaRows, error: mediaError } = await supabase
      .from("project_media")
      .select("url,public_id,alt_text,sort_order")
      .eq("project_id", id)
      .order("sort_order", { ascending: true });

    if (mediaError) throw mediaError;

    const { data: linkRows, error: linkError } = await supabase
      .from("project_links")
      .select("kind,url")
      .eq("project_id", id);

    if (linkError) throw linkError;

    const project: Project = {
      id: projectRow.id,
      title: projectRow.title,
      slug: projectRow.slug,
      description: projectRow.description,
      category: projectRow.category,
      status: projectRow.status,
      isFeatured: Boolean(projectRow.is_featured),
      featuredRank: projectRow.featured_rank,
      tools: Array.isArray(projectRow.tools) ? projectRow.tools : [],
      tags: Array.isArray(projectRow.tags) ? projectRow.tags : [],
      coverImageUrl: projectRow.cover_image_url,
      coverImagePublicId: projectRow.cover_image_public_id,
      videoUrl: projectRow.video_url,
      updatedAt: projectRow.updated_at,
      images: (mediaRows ?? []).map((m: any) => ({
        url: m.url,
        publicId: m.public_id,
        altText: m.alt_text,
        sortOrder: m.sort_order,
      })),
      links: (linkRows ?? []).map((l: any) => ({
        kind: l.kind,
        url: l.url,
      })),
    };

    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json(
      {
        error: errorToMessage(err) || "Failed to load project",
        ...(process.env.NODE_ENV !== "production" ? { debug: err } : null),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await context.params;

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

    const { error: updateError } = await supabase
      .from("projects")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // Replace links
    await supabase.from("project_links").delete().eq("project_id", id);
    const linkRows = links
      .map((l: any) => ({
        project_id: id,
        kind: String(l.kind ?? ""),
        url: String(l.url ?? ""),
      }))
      .filter((l: any) => l.kind && l.url);

    if (linkRows.length > 0) {
      const { error } = await supabase.from("project_links").insert(linkRows);
      if (error) throw error;
    }

    // Replace images
    await supabase.from("project_media").delete().eq("project_id", id);
    const mediaRows = images.map((img: any, index: number) => ({
      project_id: id,
      url: String(img.url ?? ""),
      public_id: img.publicId ? String(img.publicId) : null,
      alt_text: img.altText ? String(img.altText) : null,
      sort_order: Number.isFinite(Number(img.sortOrder)) ? Number(img.sortOrder) : index,
    }));

    if (mediaRows.length > 0) {
      const { error } = await supabase.from("project_media").insert(mediaRows);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: errorToMessage(err) || "Failed to update project",
        ...(process.env.NODE_ENV !== "production" ? { debug: err } : null),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await context.params;

  const url = new URL(request.url);
  const deleteMedia = url.searchParams.get("deleteMedia") === "1";

  async function deleteCloudinaryMedia(publicIds: string[]) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary env vars not configured");
    }

    if (publicIds.length === 0) return;

    const body = new URLSearchParams();
    for (const pid of publicIds) body.append("public_ids[]", pid);

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        (json && typeof json.error?.message === "string" && json.error.message) ||
        (typeof json?.error === "string" && json.error) ||
        "Failed to delete Cloudinary assets";
      throw new Error(msg);
    }
  }

  try {
    const supabase = createSupabaseServiceClient();

    if (deleteMedia) {
      const { data: projectRow, error: projectErr } = await supabase
        .from("projects")
        .select("cover_image_public_id")
        .eq("id", id)
        .maybeSingle();
      if (projectErr) throw projectErr;

      const { data: mediaRows, error: mediaErr } = await supabase
        .from("project_media")
        .select("public_id")
        .eq("project_id", id);
      if (mediaErr) throw mediaErr;

      const ids = new Set<string>();
      const coverPid = projectRow?.cover_image_public_id ? String(projectRow.cover_image_public_id) : null;
      if (coverPid) ids.add(coverPid);
      for (const row of mediaRows ?? []) {
        const pid = row?.public_id ? String(row.public_id) : null;
        if (pid) ids.add(pid);
      }

      await deleteCloudinaryMedia(Array.from(ids));
    }

    await supabase.from("project_links").delete().eq("project_id", id);
    await supabase.from("project_media").delete().eq("project_id", id);

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: errorToMessage(err) || "Failed to delete project",
        ...(process.env.NODE_ENV !== "production" ? { debug: err } : null),
      },
      { status: 500 }
    );
  }
}
