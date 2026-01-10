import { createSupabaseServiceClient } from "@lib/supabase/service";

import { staticProjectsByCategory } from "./static";
import type { Project, ProjectCategory } from "./types";

export type SeedStaticProjectsResult = {
  ok: boolean;
  categories: ProjectCategory[];
  considered: number;
  created: number;
  updated: number;
  skipped: number;
  createdSlugs: string[];
  updatedSlugs: string[];
};

function normalizeList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((v) => String(v).trim()).filter(Boolean);
}

function buildSeedList(categories: ProjectCategory[]): Project[] {
  const list: Project[] = [];
  for (const cat of categories) {
    const items = staticProjectsByCategory[cat] ?? [];
    for (const p of items) list.push(p);
  }
  return list;
}

export async function seedStaticProjectsToDb(options?: {
  categories?: ProjectCategory[];
  mode?: "insert" | "upsert";
}): Promise<SeedStaticProjectsResult> {
  const categories: ProjectCategory[] = options?.categories ?? ["development", "motion"];
  const mode = options?.mode ?? "insert";
  const seedList = buildSeedList(categories);

  const supabase = createSupabaseServiceClient();

  const slugs = seedList.map((p) => p.slug).filter(Boolean);
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("id,slug")
    .in("slug", slugs);

  if (existingError) throw existingError;

  const existingBySlug = new Map<string, string>();
  for (const row of existing ?? []) {
    if (row?.slug && row?.id) existingBySlug.set(String(row.slug), String(row.id));
  }

  const createdSlugs: string[] = [];
  const updatedSlugs: string[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const project of seedList) {
    const slug = String(project.slug ?? "").trim();
    if (!slug) continue;

    const existingId = existingBySlug.get(slug) ?? null;
    const shouldUpsert = mode === "upsert" && Boolean(existingId);

    const rowPayload = {
      title: String(project.title ?? "").trim(),
      slug,
      description: String(project.description ?? "").trim(),
      category: project.category,
      status: project.status,
      is_featured: Boolean(project.isFeatured),
      featured_rank: project.featuredRank ?? null,
      tools: normalizeList(project.tools),
      tags: normalizeList(project.tags),
      cover_image_url: project.coverImageUrl ? String(project.coverImageUrl) : null,
      cover_image_public_id: project.coverImagePublicId ? String(project.coverImagePublicId) : null,
      video_url: project.videoUrl ? String(project.videoUrl) : null,
    };

    let projectId: string;

    if (existingId && !shouldUpsert) {
      skipped += 1;
      continue;
    }

    if (shouldUpsert) {
      const { data: updatedRow, error } = await supabase
        .from("projects")
        .update(rowPayload)
        .eq("id", existingId)
        .select("id")
        .single();

      if (error) throw error;

      projectId = String(updatedRow.id);
      updated += 1;
      updatedSlugs.push(slug);
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("projects")
        .insert(rowPayload)
        .select("id")
        .single();

      if (insertError) throw insertError;

      projectId = String(inserted.id);
      created += 1;
      createdSlugs.push(slug);
    }

    // In upsert mode, keep related tables in sync as well.
    if (mode === "upsert") {
      const { error: mediaDeleteError } = await supabase
        .from("project_media")
        .delete()
        .eq("project_id", projectId);
      if (mediaDeleteError) throw mediaDeleteError;

      const { error: linksDeleteError } = await supabase
        .from("project_links")
        .delete()
        .eq("project_id", projectId);
      if (linksDeleteError) throw linksDeleteError;
    }

    const images = Array.isArray(project.images) ? project.images : [];
    if (images.length > 0) {
      const mediaRows = images
        .map((img, index) => ({
          project_id: projectId,
          url: String(img.url ?? ""),
          public_id: img.publicId ? String(img.publicId) : null,
          alt_text: img.altText ? String(img.altText) : null,
          sort_order: Number.isFinite(Number(img.sortOrder)) ? Number(img.sortOrder) : index,
        }))
        .filter((row) => Boolean(row.url));

      if (mediaRows.length > 0) {
        const { error } = await supabase.from("project_media").insert(mediaRows);
        if (error) throw error;
      }
    }

    const links = Array.isArray(project.links) ? project.links : [];
    if (links.length > 0) {
      const linkRows = links
        .map((l) => ({
          project_id: projectId,
          kind: String(l.kind ?? ""),
          url: String(l.url ?? ""),
        }))
        .filter((l) => l.kind && l.url);

      if (linkRows.length > 0) {
        const { error } = await supabase.from("project_links").insert(linkRows);
        if (error) throw error;
      }
    }

    existingBySlug.set(slug, projectId);
  }

  return {
    ok: true,
    categories,
    considered: seedList.length,
    created,
    updated,
    skipped,
    createdSlugs,
    updatedSlugs,
  };
}
