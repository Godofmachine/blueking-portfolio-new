"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Project, ProjectCategory, ProjectStatus } from "@lib/projects/types";
import { csvToObjects, pickField, splitList } from "@lib/projects/csv";
import { Button, buttonVariants } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";
import { Badge } from "@ui/badge";
import { Progress } from "@ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { useToast } from "@hooks/use-toast";

type ProjectFormProps = {
  mode: "create" | "edit";
  projectId?: string;
  initial?: Project;
};

type UploadImage = {
  url: string;
  publicId?: string | null;
  altText?: string | null;
  sortOrder: number;
};

type UploadStatus = "queued" | "uploading" | "done" | "error";
type UploadItem = {
  id: string;
  name: string;
  progress: number; // 0-100
  status: UploadStatus;
  error?: string;
};

type ProjectDraftV1 = {
  version: 1;
  savedAt: string;
  mode: "create" | "edit";
  projectId: string | null;
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  isFeatured: boolean;
  featuredRank: string;
  toolsText: string;
  tagsText: string;
  liveUrl: string;
  githubUrl: string;
  behanceUrl: string;
  videoUrl: string;
  images: UploadImage[];
  coverIndex: number;
};

function draftStorageKey(mode: "create" | "edit", projectId?: string) {
  return `portfolio:admin:projectDraft:v1:${mode}:${projectId ?? "new"}`;
}

function safeParseDraft(value: string | null): ProjectDraftV1 | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as ProjectDraftV1;
    if (!parsed || parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function splitCommaList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeToken(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function uniqueTokens(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = normalizeToken(v);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v.trim().replace(/\s+/g, " "));
  }
  return out;
}

function appendTokenToCommaText(current: string, token: string): string {
  const nextToken = token.trim().replace(/\s+/g, " ");
  if (!nextToken) return current;

  const items = splitCommaList(current);
  const existing = new Set(items.map(normalizeToken));
  if (existing.has(normalizeToken(nextToken))) return current;
  return [...items, nextToken].join(", ");
}

function normalizeOneLine(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeMultiline(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

type ProjectFormSnapshot = {
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  isFeatured: boolean;
  featuredRank: string;
  tools: string[];
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  behanceUrl: string;
  videoUrl: string;
  images: Array<{
    url: string;
    publicId: string | null;
    altText: string | null;
  }>;
  coverIndex: number;
};

function snapshotToString(snapshot: ProjectFormSnapshot): string {
  return JSON.stringify(snapshot);
}

function buildProjectFormSnapshot(values: {
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  isFeatured: boolean;
  featuredRank: string;
  toolsText: string;
  tagsText: string;
  liveUrl: string;
  githubUrl: string;
  behanceUrl: string;
  videoUrl: string;
  images: UploadImage[];
  coverIndex: number;
}): ProjectFormSnapshot {
  const images = (Array.isArray(values.images) ? values.images : []).map((img) => ({
    url: normalizeOneLine(String(img?.url ?? "")),
    publicId: img?.publicId ? String(img.publicId) : null,
    altText: img?.altText ? normalizeMultiline(String(img.altText)) : null,
  }));

  const maxIndex = Math.max(0, images.length - 1);
  const coverIndex = Number.isFinite(Number(values.coverIndex))
    ? Math.max(0, Math.min(maxIndex, Number(values.coverIndex)))
    : 0;

  return {
    title: normalizeOneLine(values.title),
    slug: normalizeOneLine(values.slug),
    description: normalizeMultiline(values.description),
    category: values.category,
    status: values.status,
    isFeatured: Boolean(values.isFeatured),
    featuredRank: normalizeOneLine(values.featuredRank),
    tools: splitCommaList(values.toolsText).map(normalizeOneLine),
    tags: splitCommaList(values.tagsText).map(normalizeOneLine),
    liveUrl: normalizeOneLine(values.liveUrl),
    githubUrl: normalizeOneLine(values.githubUrl),
    behanceUrl: normalizeOneLine(values.behanceUrl),
    videoUrl: normalizeMultiline(values.videoUrl),
    images,
    coverIndex,
  };
}

const PORTFOLIO_TOOL_SUGGESTIONS: Record<ProjectCategory, string[]> = {
  development: [
    "HTML & CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next Js",
    "Node Js",
    "Tailwind CSS",
    "Git",
    "VS Code",
    "Framer Motion",
    "Copilot",
  ],
  design: [
    "Figma",
    "Photoshop",
    "Illustrator",
    "Canva",
    "Photopea",
    "Pinterest",
  ],
  motion: ["After Effects", "Premier Pro", "Capcut", "Canva"],
};

const PORTFOLIO_TAG_SUGGESTIONS: Record<ProjectCategory, string[]> = {
  development: [
    "website",
    "landing page",
    "dashboard",
    "web app",
    "responsive",
    "UI",
    "UX",
    "portfolio",
    "e-commerce",
    "performance",
  ],
  design: [
    "branding",
    "logo",
    "poster",
    "flyer",
    "social media",
    "typography",
    "illustration",
    "print",
    "UI",
  ],
  motion: ["animation", "motion graphics", "video", "reel", "promo", "social media"],
};

export default function ProjectForm({ mode, projectId, initial }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const storageKey = useMemo(() => draftStorageKey(mode, projectId), [mode, projectId]);

  const [title, setTitle] = useState(initial?.title ?? "");
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteChoice, setDeleteChoice] = useState<"project" | "project_media">("project");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<ProjectCategory>(
    initial?.category ?? "development"
  );
  const [status, setStatus] = useState<ProjectStatus>(
    initial?.status ?? "published"
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(initial?.isFeatured));
  const [featuredRank, setFeaturedRank] = useState<string>(
    initial?.featuredRank !== null && initial?.featuredRank !== undefined
      ? String(initial.featuredRank)
      : ""
  );

  const [toolsText, setToolsText] = useState(
    initial?.tools?.length ? initial.tools.join(", ") : ""
  );
  const [tagsText, setTagsText] = useState(
    initial?.tags?.length ? initial.tags.join(", ") : ""
  );

  const [liveUrl, setLiveUrl] = useState(
    initial?.links?.find((l) => l.kind === "live")?.url ?? ""
  );
  const [githubUrl, setGithubUrl] = useState(
    initial?.links?.find((l) => l.kind === "github")?.url ?? ""
  );
  const [behanceUrl, setBehanceUrl] = useState(
    initial?.links?.find((l) => l.kind === "behance")?.url ?? ""
  );

  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");

  const [images, setImages] = useState<UploadImage[]>(() =>
    (initial?.images ?? []).map((img) => ({
      url: img.url,
      publicId: img.publicId ?? null,
      altText: img.altText ?? null,
      sortOrder: img.sortOrder,
    }))
  );

  const [coverIndex, setCoverIndex] = useState<number>(() => {
    const coverPublicId = initial?.coverImagePublicId;
    if (!coverPublicId) return 0;
    const idx = (initial?.images ?? []).findIndex(
      (img) => img.publicId === coverPublicId
    );
    return idx >= 0 ? idx : 0;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [csvText, setCsvText] = useState("");

  const isUploading = uploadingCount > 0;

  const [isDragOverImages, setIsDragOverImages] = useState(false);
  const dragCounterRef = useRef(0);

  const tools = useMemo(() => splitCommaList(toolsText), [toolsText]);
  const tags = useMemo(() => splitCommaList(tagsText), [tagsText]);

  const [historyToolsAll, setHistoryToolsAll] = useState<string[]>([]);
  const [historyTagsAll, setHistoryTagsAll] = useState<string[]>([]);
  const [historyToolsByCategory, setHistoryToolsByCategory] = useState<
    Record<ProjectCategory, string[]>
  >({ development: [], design: [], motion: [] });
  const [historyTagsByCategory, setHistoryTagsByCategory] = useState<
    Record<ProjectCategory, string[]>
  >({ development: [], design: [], motion: [] });

  // Load tool/tag suggestions from previously uploaded projects.
  useEffect(() => {
    let cancelled = false;

    async function loadSuggestions() {
      try {
        const res = await fetch("/api/admin/projects");
        const json = await res.json().catch(() => null);
        if (!res.ok) return;

        const projects: Project[] = Array.isArray(json?.projects) ? json.projects : [];

        const toolCountsAll = new Map<string, { label: string; count: number }>();
        const tagCountsAll = new Map<string, { label: string; count: number }>();

        const toolCountsByCat: Record<ProjectCategory, Map<string, { label: string; count: number }>> = {
          development: new Map(),
          design: new Map(),
          motion: new Map(),
        };
        const tagCountsByCat: Record<ProjectCategory, Map<string, { label: string; count: number }>> = {
          development: new Map(),
          design: new Map(),
          motion: new Map(),
        };

        for (const p of projects) {
          const cat = p.category;
          for (const t of Array.isArray(p.tools) ? p.tools : []) {
            const key = normalizeToken(String(t));
            if (!key) continue;
            const label = String(t).trim().replace(/\s+/g, " ");

            const all = toolCountsAll.get(key) ?? { label, count: 0 };
            all.count += 1;
            toolCountsAll.set(key, all);

            const byCat = toolCountsByCat[cat].get(key) ?? { label, count: 0 };
            byCat.count += 1;
            toolCountsByCat[cat].set(key, byCat);
          }

          for (const tg of Array.isArray(p.tags) ? p.tags : []) {
            const key = normalizeToken(String(tg));
            if (!key) continue;
            const label = String(tg).trim().replace(/\s+/g, " ");

            const all = tagCountsAll.get(key) ?? { label, count: 0 };
            all.count += 1;
            tagCountsAll.set(key, all);

            const byCat = tagCountsByCat[cat].get(key) ?? { label, count: 0 };
            byCat.count += 1;
            tagCountsByCat[cat].set(key, byCat);
          }
        }

        const sortByCount = (m: Map<string, { label: string; count: number }>) =>
          Array.from(m.values())
            .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
            .map((x) => x.label);

        const nextToolsAll = sortByCount(toolCountsAll);
        const nextTagsAll = sortByCount(tagCountsAll);

        const nextToolsByCategory: Record<ProjectCategory, string[]> = {
          development: sortByCount(toolCountsByCat.development),
          design: sortByCount(toolCountsByCat.design),
          motion: sortByCount(toolCountsByCat.motion),
        };
        const nextTagsByCategory: Record<ProjectCategory, string[]> = {
          development: sortByCount(tagCountsByCat.development),
          design: sortByCount(tagCountsByCat.design),
          motion: sortByCount(tagCountsByCat.motion),
        };

        if (cancelled) return;
        setHistoryToolsAll(nextToolsAll);
        setHistoryTagsAll(nextTagsAll);
        setHistoryToolsByCategory(nextToolsByCategory);
        setHistoryTagsByCategory(nextTagsByCategory);
      } catch {
        // Suggestions are optional; ignore failures.
      }
    }

    void loadSuggestions();
    return () => {
      cancelled = true;
    };
  }, []);

  const toolSuggestions = useMemo(() => {
    const selected = new Set(tools.map(normalizeToken));
    const combined = uniqueTokens([
      ...PORTFOLIO_TOOL_SUGGESTIONS[category],
      ...historyToolsByCategory[category],
      ...historyToolsAll,
    ]);
    return combined.filter((t) => !selected.has(normalizeToken(t))).slice(0, 18);
  }, [category, historyToolsAll, historyToolsByCategory, tools]);

  const tagSuggestions = useMemo(() => {
    const selected = new Set(tags.map(normalizeToken));
    const combined = uniqueTokens([
      ...PORTFOLIO_TAG_SUGGESTIONS[category],
      ...historyTagsByCategory[category],
      ...historyTagsAll,
    ]);
    return combined.filter((t) => !selected.has(normalizeToken(t))).slice(0, 24);
  }, [category, historyTagsAll, historyTagsByCategory, tags]);

  function addToolSuggestion(value: string) {
    setToolsText((prev) => appendTokenToCommaText(prev, value));
  }

  function addTagSuggestion(value: string) {
    setTagsText((prev) => appendTokenToCommaText(prev, value));
  }

  const currentSnapshotString = useMemo(() => {
    return snapshotToString(
      buildProjectFormSnapshot({
        title,
        slug,
        description,
        category,
        status,
        isFeatured,
        featuredRank,
        toolsText,
        tagsText,
        liveUrl,
        githubUrl,
        behanceUrl,
        videoUrl,
        images,
        coverIndex,
      })
    );
  }, [
    title,
    slug,
    description,
    category,
    status,
    isFeatured,
    featuredRank,
    toolsText,
    tagsText,
    liveUrl,
    githubUrl,
    behanceUrl,
    videoUrl,
    images,
    coverIndex,
  ]);

  const baselineSnapshotFromProps = useMemo(() => {
    const initialTitle = initial?.title ?? "";
    const initialSlug = initial?.slug ?? "";
    const initialDescription = initial?.description ?? "";
    const initialCategory: ProjectCategory = initial?.category ?? "development";
    const initialStatus: ProjectStatus = initial?.status ?? "published";
    const initialIsFeatured = Boolean(initial?.isFeatured);
    const initialFeaturedRank =
      initial?.featuredRank !== null && initial?.featuredRank !== undefined
        ? String(initial.featuredRank)
        : "";
    const initialToolsText = initial?.tools?.length ? initial.tools.join(", ") : "";
    const initialTagsText = initial?.tags?.length ? initial.tags.join(", ") : "";
    const initialLiveUrl = initial?.links?.find((l) => l.kind === "live")?.url ?? "";
    const initialGithubUrl = initial?.links?.find((l) => l.kind === "github")?.url ?? "";
    const initialBehanceUrl = initial?.links?.find((l) => l.kind === "behance")?.url ?? "";
    const initialVideoUrl = initial?.videoUrl ?? "";

    const initialImages: UploadImage[] = (initial?.images ?? []).map((img) => ({
      url: img.url,
      publicId: img.publicId ?? null,
      altText: img.altText ?? null,
      sortOrder: img.sortOrder,
    }));

    const coverPublicId = initial?.coverImagePublicId;
    const coverIndex = coverPublicId
      ? (initial?.images ?? []).findIndex((img) => img.publicId === coverPublicId)
      : 0;

    return snapshotToString(
      buildProjectFormSnapshot({
        title: initialTitle,
        slug: initialSlug,
        description: initialDescription,
        category: initialCategory,
        status: initialStatus,
        isFeatured: initialIsFeatured,
        featuredRank: initialFeaturedRank,
        toolsText: initialToolsText,
        tagsText: initialTagsText,
        liveUrl: initialLiveUrl,
        githubUrl: initialGithubUrl,
        behanceUrl: initialBehanceUrl,
        videoUrl: initialVideoUrl,
        images: initialImages,
        coverIndex: coverIndex >= 0 ? coverIndex : 0,
      })
    );
  }, [initial]);

  const [baselineSnapshotString, setBaselineSnapshotString] = useState<string>(
    baselineSnapshotFromProps
  );

  useEffect(() => {
    setBaselineSnapshotString(baselineSnapshotFromProps);
  }, [baselineSnapshotFromProps, mode, projectId]);

  const isDirty = useMemo(() => {
    return baselineSnapshotString !== currentSnapshotString;
  }, [baselineSnapshotString, currentSnapshotString]);

  // Restore draft from localStorage on mount (useful for refreshes mid-form).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const draft = safeParseDraft(window.localStorage.getItem(storageKey));
    if (!draft) return;
    if (draft.mode !== mode) return;
    if ((draft.projectId ?? null) !== (projectId ?? null)) return;

    setTitle(draft.title ?? "");
    setSlug(draft.slug ?? "");
    setDescription(draft.description ?? "");
    setCategory(draft.category ?? "development");
    setStatus(draft.status ?? "published");
    setIsFeatured(Boolean(draft.isFeatured));
    setFeaturedRank(draft.featuredRank ?? "");
    setToolsText(draft.toolsText ?? "");
    setTagsText(draft.tagsText ?? "");
    setLiveUrl(draft.liveUrl ?? "");
    setGithubUrl(draft.githubUrl ?? "");
    setBehanceUrl(draft.behanceUrl ?? "");
    setVideoUrl(draft.videoUrl ?? "");

    if (Array.isArray(draft.images)) {
      setImages(
        draft.images.map((img, idx) => ({
          url: String(img.url ?? ""),
          publicId: img.publicId ?? null,
          altText: img.altText ?? null,
          sortOrder: Number.isFinite(Number(img.sortOrder)) ? Number(img.sortOrder) : idx,
        }))
      );
    }

    if (Number.isFinite(Number(draft.coverIndex))) {
      setCoverIndex(Math.max(0, Number(draft.coverIndex)));
    }
  }, [mode, projectId, storageKey]);

  // Persist draft to localStorage (debounced).
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handle = window.setTimeout(() => {
      const draft: ProjectDraftV1 = {
        version: 1,
        savedAt: new Date().toISOString(),
        mode,
        projectId: projectId ?? null,
        title,
        slug,
        description,
        category,
        status,
        isFeatured,
        featuredRank,
        toolsText,
        tagsText,
        liveUrl,
        githubUrl,
        behanceUrl,
        videoUrl,
        images,
        coverIndex,
      };

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        // Ignore quota/private mode errors.
      }
    }, 400);

    return () => window.clearTimeout(handle);
  }, [
    storageKey,
    mode,
    projectId,
    title,
    slug,
    description,
    category,
    status,
    isFeatured,
    featuredRank,
    toolsText,
    tagsText,
    liveUrl,
    githubUrl,
    behanceUrl,
    videoUrl,
    images,
    coverIndex,
  ]);

  function clearDraft() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  function applyCsvToForm(text: string) {
    const { rows } = csvToObjects(text);
    if (rows.length === 0) {
      toast({
        title: "CSV not recognized",
        description: "Paste a CSV with a header row and one data row.",
        variant: "destructive",
      });
      return;
    }

    const row = rows[0];

    const nextTitle = pickField(row, ["title", "name"]);
    const nextDescription = pickField(row, ["description", "desc", "summary"]);
    const nextCategory = pickField(row, ["category", "type"]);

    if (!nextTitle || !nextDescription || !nextCategory) {
      toast({
        title: "Missing required fields",
        description: "CSV needs: title, description, category (development/design/motion).",
        variant: "destructive",
      });
      return;
    }

    if (nextCategory !== "development" && nextCategory !== "design" && nextCategory !== "motion") {
      toast({
        title: "Invalid category",
        description: "Category must be development, design, or motion.",
        variant: "destructive",
      });
      return;
    }

    const nextSlug = pickField(row, ["slug"]) || slugify(nextTitle);
    const tools = splitList(pickField(row, ["tools", "tool", "stack", "tech"]));
    const tags = splitList(pickField(row, ["tags", "tag"]));
    const nextLiveUrl = pickField(row, ["live_url", "live", "url", "website"]);
    const nextGithubUrl = pickField(row, ["github_url", "github"]);
    const nextBehanceUrl = pickField(row, ["behance_url", "behance"]);
    const nextVideoUrl = pickField(row, ["video_url", "video"]);

    setTitle(nextTitle);
    setDescription(nextDescription);
    setCategory(nextCategory as ProjectCategory);
    setSlug(nextSlug);

    setToolsText(tools.join(", "));
    setTagsText(tags.join(", "));
    setLiveUrl(nextLiveUrl);
    setGithubUrl(nextGithubUrl);
    setBehanceUrl(nextBehanceUrl);
    setVideoUrl(nextVideoUrl);

    // CSV imports should start as drafts until images are added.
    setStatus("draft");
    setIsFeatured(false);
    setFeaturedRank("");
    setImages([]);
    setCoverIndex(0);

    toast({
      title: "CSV applied",
      description: "Filled the form and set status to draft. Add images before publishing.",
    });
  }

  useEffect(() => {
    // Keep sortOrder aligned with list order.
    setImages((prev) => prev.map((img, idx) => ({ ...img, sortOrder: idx })));
  }, [images.length]);

  const overallUploadProgress = useMemo(() => {
    if (!uploadItems.length) return 0;
    const total = uploadItems.reduce((acc, item) => acc + (Number.isFinite(item.progress) ? item.progress : 0), 0);
    return Math.max(0, Math.min(100, Math.round(total / uploadItems.length)));
  }, [uploadItems]);

  async function readErrorMessage(res: Response) {
    const text = await res.text().catch(() => "");
    try {
      const json = text ? JSON.parse(text) : null;
      return String(json?.error ?? json?.message ?? text ?? "Request failed").trim();
    } catch {
      return (text || "Request failed").trim();
    }
  }

  function extractImageFiles(input: FileList | File[] | null): File[] {
    if (!input) return [];
    const list = Array.isArray(input) ? input : Array.from(input);
    return list.filter((f) => f && typeof f.type === "string" && f.type.startsWith("image/"));
  }

  function isTextInputElement(el: Element | null): boolean {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return true;
    return (el as any).isContentEditable === true;
  }

  function updateUploadItem(id: string, patch: Partial<UploadItem>) {
    setUploadItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function uploadFiles(files: FileList | File[] | null) {
    const fileArray = extractImageFiles(files);
    if (fileArray.length === 0) return;

    try {
      setUploadingCount((c) => c + 1);

      const batchId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const items = fileArray.map((f, idx) => ({
        id: `${batchId}:${idx}:${f.name}`,
        name: f.name,
        progress: 0,
        status: "queued" as const,
      }));

      setUploadItems((prev) => [...prev, ...items]);

      const signatureRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "portfolio/projects" }),
      });

      if (!signatureRes.ok) {
        const msg = await readErrorMessage(signatureRes);
        throw new Error(msg || "Could not prepare upload");
      }

      const { cloudName, apiKey, folder, timestamp, signature } =
        (await signatureRes.json()) as any;

      function uploadOne(file: File, itemId: string) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        updateUploadItem(itemId, { status: "uploading", progress: 1 });

        return new Promise<UploadImage>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
          );

          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const percent = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)));
            updateUploadItem(itemId, { progress: percent, status: "uploading" });
          };

          xhr.onload = () => {
            try {
              const ok = xhr.status >= 200 && xhr.status < 300;
              const json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
              if (!ok) {
                const message =
                  json?.error?.message ||
                  json?.error ||
                  xhr.statusText ||
                  "Upload failed";
                updateUploadItem(itemId, {
                  status: "error",
                  error: String(message),
                });
                reject(new Error(String(message)));
                return;
              }

              const uploaded: UploadImage = {
                url: String(json?.secure_url ?? ""),
                publicId: json?.public_id ? String(json.public_id) : null,
                altText: null,
                sortOrder: 0,
              };

              updateUploadItem(itemId, { status: "done", progress: 100 });

              resolve(uploaded);
            } catch (e) {
              updateUploadItem(itemId, { status: "error", error: "Invalid upload response" });
              reject(e);
            }
          };

          xhr.onerror = () => {
            updateUploadItem(itemId, { status: "error", error: "Network error" });
            reject(new Error("Network error"));
          };

          xhr.ontimeout = () => {
            updateUploadItem(itemId, { status: "error", error: "Upload timed out" });
            reject(new Error("Upload timed out"));
          };

          xhr.send(formData);
        });
      }

      const results = await Promise.allSettled(
        fileArray.map((file, idx) => uploadOne(file, items[idx].id))
      );
      const uploads: UploadImage[] = [];
      let failedCount = 0;
      let firstError: string | null = null;

      for (const result of results) {
        if (result.status === "fulfilled") {
          uploads.push(result.value);
        } else {
          failedCount += 1;
          if (!firstError) {
            firstError = result.reason instanceof Error ? result.reason.message : String(result.reason);
          }
        }
      }

      setImages((prev) => {
        const next = [...prev, ...uploads];
        return next.map((img, idx) => ({ ...img, sortOrder: idx }));
      });

      if (uploads.length > 0 || failedCount > 0) {
        toast({
          title: failedCount > 0 ? "Upload finished" : "Uploaded",
          description:
            failedCount > 0
              ? `${uploads.length} succeeded, ${failedCount} failed.${firstError ? ` First error: ${firstError}` : ""}`
              : `${uploads.length} image(s) added.`,
          variant: uploads.length > 0 ? "default" : "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingCount((c) => Math.max(0, c - 1));
    }
  }

  useEffect(() => {
    function onWindowPaste(e: ClipboardEvent) {
      if (typeof window === "undefined") return;

      const active = document.activeElement;
      if (isTextInputElement(active)) return;

      const items = Array.from(e.clipboardData?.items ?? []);
      const files: File[] = [];
      for (const item of items) {
        if (!item?.type?.startsWith("image/")) continue;
        const file = item.getAsFile();
        if (file) files.push(file);
      }

      const imageFiles = extractImageFiles(files);
      if (imageFiles.length === 0) return;

      e.preventDefault();
      void uploadFiles(imageFiles);
    }

    window.addEventListener("paste", onWindowPaste);
    return () => window.removeEventListener("paste", onWindowPaste);
  }, []);

  function hasFiles(dataTransfer: DataTransfer | null): boolean {
    if (!dataTransfer) return false;
    if (Array.isArray((dataTransfer as any).types) && (dataTransfer as any).types.includes("Files")) return true;
    const types = dataTransfer.types;
    return !!types && Array.from(types).includes("Files");
  }

  function handleDragEnter(e: React.DragEvent) {
    if (!hasFiles(e.dataTransfer)) return;
    dragCounterRef.current += 1;
    setIsDragOverImages(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!hasFiles(e.dataTransfer)) return;
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setIsDragOverImages(false);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!hasFiles(e.dataTransfer)) return;
    e.preventDefault();
    setIsDragOverImages(true);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOverImages(false);
    const nextFiles = extractImageFiles(e.dataTransfer?.files ?? null);
    if (nextFiles.length === 0) return;
    void uploadFiles(nextFiles);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const target = e.target as HTMLElement | null;
    const isTextInputTarget =
      !!target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        (target as any).isContentEditable === true);

    if (isTextInputTarget) return;

    const items = Array.from(e.clipboardData?.items ?? []);
    const files: File[] = [];
    for (const item of items) {
      if (!item?.type?.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (file) files.push(file);
    }

    const imageFiles = extractImageFiles(files);
    if (imageFiles.length === 0) return;

    e.preventDefault();
    void uploadFiles(imageFiles);
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next.map((img, idx) => ({ ...img, sortOrder: idx }));
    });

    setCoverIndex((prev) => {
      if (prev === index) return index + direction;
      if (prev === index + direction) return index;
      return prev;
    });
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((img, idx) => ({ ...img, sortOrder: idx }));
    });
    setCoverIndex((prev) => {
      if (index === prev) return 0;
      if (index < prev) return prev - 1;
      return prev;
    });
  }

  async function save() {
    try {
      setIsSaving(true);
      setSaveError(null);

      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      if (!trimmedTitle || !trimmedDescription) {
        setSaveError("Title and description are required.");
        toast({
          title: "Missing required fields",
          description: "Title and description are required.",
          variant: "destructive",
        });
        return;
      }

      const cover = images[coverIndex];

      const payload = {
        title: trimmedTitle,
        slug: slug.trim() || slugify(trimmedTitle),
        description: trimmedDescription,
        category,
        status,
        isFeatured,
        featuredRank: featuredRank.trim() ? Number(featuredRank) : null,
        tools,
        tags,
        coverImageUrl: cover?.url ?? null,
        coverImagePublicId: cover?.publicId ?? null,
        videoUrl: category === "motion" && videoUrl.trim() ? videoUrl.trim() : null,
        images,
        links: [
          liveUrl.trim() ? { kind: "live", url: liveUrl.trim() } : null,
          githubUrl.trim() ? { kind: "github", url: githubUrl.trim() } : null,
          behanceUrl.trim() ? { kind: "behance", url: behanceUrl.trim() } : null,
        ].filter(Boolean),
      };

      const endpoint =
        mode === "create"
          ? "/api/admin/projects"
          : `/api/admin/projects/${projectId}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        throw new Error(msg || `Save failed (${res.status})`);
      }

      const json = await res.json().catch(() => ({} as any));

      toast({
        title: "Saved",
        description: mode === "create" ? "Project created." : "Project updated.",
      });

      setBaselineSnapshotString(currentSnapshotString);

      clearDraft();

      if (mode === "create") {
        const params = new URLSearchParams();
        params.set("category", "all");
        params.set("status", "all");
        params.set("created", "1");
        router.push(`/admin/projects?${params.toString()}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      // Useful when users say "it doesn't add".
      console.error("Project save failed", err);

      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "Request timed out. Check your internet/Supabase and try again."
          : err instanceof Error
            ? err.message
            : "Please try again.";

      setSaveError(message);
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProject(deleteMedia: boolean) {
    if (mode !== "edit" || !projectId) return;

    try {
      setIsDeleting(true);
      const url = deleteMedia
        ? `/api/admin/projects/${projectId}?deleteMedia=1`
        : `/api/admin/projects/${projectId}`;
      const res = await fetch(url, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Delete failed");

      toast({
        title: "Deleted",
        description: deleteMedia ? "Project and media removed." : "Project removed.",
      });

      clearDraft();
      router.push("/admin/projects");
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function requestDeleteConfirm() {
    if (mode !== "edit" || !projectId) return;
    setDeleteChoice("project");
    setConfirmDeleteOpen(true);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold text-foreground">CSV (single project)</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Paste a header + one row to fill this form. Imported projects start as drafts until images are added.
            </div>
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            className="block text-sm text-zinc-700 dark:text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:file:bg-white dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
            onChange={async (e) => {
              const file = e.target.files?.[0] ?? null;
              if (!file) return;
              const text = await file.text();
              setCsvText(text);
              applyCsvToForm(text);
              e.currentTarget.value = "";
            }}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <Textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={
              "title,description,category,tools,tags,live_url,github_url,behance_url,video_url,slug\n" +
              '"My Project","Short description","development","React; Next.js","portfolio; ui","https://example.com","https://github.com/...","","","my-project"'
            }
            className="min-h-[120px]"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => applyCsvToForm(csvText)}
            >
              Apply CSV to form
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={slugify(title) || "my-project"}
          />
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Used in URLs and should be unique.
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            className="w-full h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProjectCategory)}
          >
            <option value="development">Development</option>
            <option value="design">Graphic Design</option>
            <option value="motion">Motion Graphics</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            className="w-full h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Featured</Label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Show on home
            </label>
            <Input
              value={featuredRank}
              onChange={(e) => setFeaturedRank(e.target.value)}
              placeholder="Rank"
              className="w-24"
              inputMode="numeric"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="tools">Tools used (comma separated)</Label>
          <Input
            id="tools"
            value={toolsText}
            onChange={(e) => setToolsText(e.target.value)}
            placeholder="Photoshop, Illustrator, Next.js"
          />
          <div className="flex flex-wrap gap-2 pt-2">
            {tools.slice(0, 8).map((t) => (
              <Badge key={t} variant="outline" className="rounded-full">
                {t}
              </Badge>
            ))}
          </div>

          {toolSuggestions.length > 0 && (
            <div className="pt-2">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Suggestions</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {toolSuggestions.map((t) => (
                  <Button
                    key={`tool-suggest-${t}`}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => addToolSuggestion(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="branding, logo, ui"
          />

          <div className="flex flex-wrap gap-2 pt-2">
            {tags.slice(0, 8).map((t) => (
              <Badge key={t} variant="outline" className="rounded-full">
                {t}
              </Badge>
            ))}
          </div>

          {tagSuggestions.length > 0 && (
            <div className="pt-2">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Suggestions</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {tagSuggestions.map((t) => (
                  <Button
                    key={`tag-suggest-${t}`}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => addTagSuggestion(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input id="liveUrl" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input id="githubUrl" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="behanceUrl">Behance URL</Label>
          <Input id="behanceUrl" value={behanceUrl} onChange={(e) => setBehanceUrl(e.target.value)} />
        </div>
      </div>

      {category === "motion" && (
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Motion video URL (optional)</Label>
          <Input
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/.../video/upload/..."
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Images</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Upload multiple images and pick a cover.
            </p>
          </div>
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => uploadFiles(e.target.files)}
              className="block text-sm text-zinc-700 dark:text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:file:bg-white dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
            />
          </div>
        </div>

        {images.length === 0 && (
          <div
            role="button"
            tabIndex={0}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onPaste={handlePaste}
            className={
              "rounded-xl border border-dashed bg-white dark:bg-zinc-900 p-6 text-sm text-zinc-600 dark:text-zinc-400 outline-none transition-colors " +
              (isDragOverImages
                ? "border-zinc-500 dark:border-zinc-400 bg-zinc-50 dark:bg-zinc-900/60"
                : "border-zinc-300 dark:border-zinc-700")
            }
          >
            Drag &amp; drop images here, or click and paste (Ctrl+V).
          </div>
        )}

        {uploadItems.length > 0 && (
          <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-foreground">
                Uploading images
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {overallUploadProgress}%
              </div>
            </div>
            <div className="mt-2">
              <Progress value={overallUploadProgress} className="h-2" />
            </div>
            <div className="mt-3 space-y-2">
              {uploadItems.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-zinc-700 dark:text-zinc-300">
                      {item.name}
                    </div>
                    <div className="shrink-0 text-zinc-600 dark:text-zinc-400">
                      {item.status === "error" ? "Failed" : `${item.progress}%`}
                    </div>
                  </div>
                  {item.status === "error" && item.error && (
                    <div className="mt-1 text-red-600 dark:text-red-400">
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length > 0 ? (
          <div className="space-y-3">
            <div
              role="button"
              tabIndex={0}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onPaste={handlePaste}
              className={
                "rounded-xl border border-dashed bg-white dark:bg-zinc-900 p-4 text-sm text-zinc-600 dark:text-zinc-400 outline-none transition-colors " +
                (isDragOverImages
                  ? "border-zinc-500 dark:border-zinc-400 bg-zinc-50 dark:bg-zinc-900/60"
                  : "border-zinc-300 dark:border-zinc-700")
              }
            >
              Drag &amp; drop more images here, or click and paste (Ctrl+V).
            </div>

            {images.map((img, idx) => (
              <div
                key={`${img.publicId ?? img.url}-${idx}`}
                className="flex items-start gap-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3"
              >
                <img
                  src={img.url}
                  alt={img.altText ?? ""}
                  className="h-20 w-28 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                      <input
                        type="radio"
                        name="cover"
                        checked={coverIndex === idx}
                        onChange={() => setCoverIndex(idx)}
                      />
                      Cover
                    </label>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">Order: {idx + 1}</div>
                  </div>
                  <Input
                    value={img.altText ?? ""}
                    onChange={(e) =>
                      setImages((prev) =>
                        prev.map((p, i) =>
                          i === idx ? { ...p, altText: e.target.value } : p
                        )
                      )
                    }
                    placeholder="Alt text (optional)"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(idx, -1)}
                    disabled={idx === 0}
                  >
                    Up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(idx, 1)}
                    disabled={idx === images.length - 1}
                  >
                    Down
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(idx)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={save}
          disabled={isSaving || isUploading || !isDirty}
          variant="outline"
          className="rounded-full border-zinc-300 dark:border-zinc-700 font-semibold"
        >
          {isSaving ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
        </Button>

        {mode === "edit" && (
          <Button
            type="button"
            variant="outline"
            onClick={requestDeleteConfirm}
            disabled={isDeleting}
            className="rounded-full border-red-300 text-red-700 hover:text-red-800 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            {isDeleting ? "Deleting…" : "Delete project"}
          </Button>
        )}
      </div>

      <AlertDialog
        open={confirmDeleteOpen}
        onOpenChange={(open: boolean) => {
          if (isDeleting) return;
          setConfirmDeleteOpen(open);
        }}
      >
        <AlertDialogContent
          onEscapeKeyDown={(e: KeyboardEvent) => {
            if (isDeleting) e.preventDefault();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>

            <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-3">
              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Delete options</div>
              <RadioGroup
                className="mt-2"
                value={deleteChoice}
                onValueChange={(v: string) => setDeleteChoice(v as "project" | "project_media")}
              >
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="project" id="delete-project-only-form" />
                  <label htmlFor="delete-project-only-form" className="text-sm text-zinc-700 dark:text-zinc-300">
                    Delete project only (keep Cloudinary media)
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="project_media" id="delete-project-media-form" />
                  <label htmlFor="delete-project-media-form" className="text-sm text-zinc-700 dark:text-zinc-300">
                    Delete project + media (also delete images from Cloudinary)
                  </label>
                </div>
              </RadioGroup>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void deleteProject(deleteChoice === "project_media");
              }}
              disabled={isDeleting}
              className={buttonVariants({ variant: "destructive" })}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {saveError && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Couldn’t save</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
