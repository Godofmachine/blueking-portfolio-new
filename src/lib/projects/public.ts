import { createSupabasePublicClient } from "@lib/supabase/public";
import type { Project, ProjectsByCategory, ProjectCategory } from "./types";
import { staticProjectsByCategory } from "./static";

function empty(): ProjectsByCategory {
  return { development: [], design: [], motion: [] };
}

function groupByCategory(projects: Project[]): ProjectsByCategory {
  const grouped: ProjectsByCategory = empty();
  for (const project of projects) {
    grouped[project.category].push(project);
  }
  return grouped;
}

export async function fetchProjectsByCategory(options: {
  featuredOnly: boolean;
  featuredLimitPerCategory?: number;
}): Promise<ProjectsByCategory> {
  const { featuredOnly, featuredLimitPerCategory } = options;

  const hasEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasEnv) {
    return featuredOnly
      ? {
          development: staticProjectsByCategory.development.slice(
            0,
            featuredLimitPerCategory ?? 4
          ),
          design: staticProjectsByCategory.design.slice(
            0,
            featuredLimitPerCategory ?? 4
          ),
          motion: staticProjectsByCategory.motion.slice(
            0,
            featuredLimitPerCategory ?? 4
          ),
        }
      : staticProjectsByCategory;
  }

  try {
    const supabase = createSupabasePublicClient();

    let query = supabase
      .from("projects")
      .select(
        "id,title,slug,description,category,status,is_featured,featured_rank,tools,tags,cover_image_url,cover_image_public_id,video_url,updated_at"
      )
      .eq("status", "published");

    if (featuredOnly) {
      // Important: featured_rank must be the PRIMARY sort key.
      // Otherwise updated_at ordering can override the rank.
      query = query
        .eq("is_featured", true)
        .order("featured_rank", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false });
    } else {
      query = query.order("updated_at", { ascending: false });
    }

    const { data: projectRows, error: projectError } = await query;
    if (projectError) throw projectError;

    const ids = (projectRows ?? []).map((p: any) => p.id);

    const [mediaRes, linksRes] = await Promise.all([
      ids.length
        ? supabase
            .from("project_media")
            .select("project_id,url,public_id,alt_text,sort_order")
            .in("project_id", ids)
            .order("sort_order", { ascending: true })
        : Promise.resolve({ data: [], error: null } as any),
      ids.length
        ? supabase
            .from("project_links")
            .select("project_id,kind,url")
            .in("project_id", ids)
        : Promise.resolve({ data: [], error: null } as any),
    ]);

    if (mediaRes.error) throw mediaRes.error;
    if (linksRes.error) throw linksRes.error;

    const mediaByProject = new Map<string, any[]>();
    for (const row of mediaRes.data ?? []) {
      const list = mediaByProject.get(row.project_id) ?? [];
      list.push(row);
      mediaByProject.set(row.project_id, list);
    }

    const linksByProject = new Map<string, any[]>();
    for (const row of linksRes.data ?? []) {
      const list = linksByProject.get(row.project_id) ?? [];
      list.push(row);
      linksByProject.set(row.project_id, list);
    }

    const projects: Project[] = (projectRows ?? []).map((row: any) => {
      const images = (mediaByProject.get(row.id) ?? []).map((m: any) => ({
        url: m.url,
        publicId: m.public_id,
        altText: m.alt_text,
        sortOrder: m.sort_order,
      }));

      const links = (linksByProject.get(row.id) ?? []).map((l: any) => ({
        kind: l.kind,
        url: l.url,
      }));

      const project: Project = {
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
        images,
        links,
      };

      return project;
    });

    const grouped = groupByCategory(projects);

    if (featuredOnly && featuredLimitPerCategory) {
      (Object.keys(grouped) as ProjectCategory[]).forEach((cat) => {
        grouped[cat] = grouped[cat].slice(0, featuredLimitPerCategory);
      });
    }

    return grouped;
  } catch (err) {
    // If Supabase env vars exist, do NOT silently fall back to hardcoded projects.
    // Let the route show a loader/error instead of masking backend availability issues.
    throw err;
  }
}
