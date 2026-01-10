"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CheckedState } from "@radix-ui/react-checkbox";

import type { Project, ProjectCategory } from "@lib/projects/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Button, buttonVariants } from "@ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Badge } from "@ui/badge";
import { Checkbox } from "@ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { useToast } from "@hooks/use-toast";
import { LayoutGrid, List as ListIcon, Pencil, Plus, Trash2 } from "lucide-react";

type AdminCategoryTab = "all" | ProjectCategory;

type ConfirmState = {
  title: string;
  description?: string;
  actionLabel: string;
  variant?: "default" | "destructive";
  showDeleteOptions?: boolean;
  onConfirm: () => Promise<boolean>;
};

type ViewMode = "list" | "grid";
type SortMode = "updated_desc" | "updated_asc" | "title_asc" | "title_desc" | "featured_rank";

const VIEW_STORAGE_KEY = "portfolio:admin:projects:viewMode";
const SORT_STORAGE_KEY = "portfolio:admin:projects:sortMode";

export default function AdminProjectsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<AdminCategoryTab>("all");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortMode, setSortMode] = useState<SortMode>("updated_desc");
  const [rowBusyIds, setRowBusyIds] = useState<Set<string>>(() => new Set());

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [deleteChoice, setDeleteChoice] = useState<"project" | "project_media">("project");

  useEffect(() => {
    const cat = searchParams.get("category");
    const st = searchParams.get("status");
    const created = searchParams.get("created");

    if (cat === "all" || cat === "development" || cat === "design" || cat === "motion") {
      setCategory(cat as AdminCategoryTab);
    }
    if (st === "all" || st === "draft" || st === "published") {
      setStatus(st);
    }

    if (created === "1") {
      toast({ title: "Created", description: "Project added to your dashboard." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (raw === "list" || raw === "grid") setViewMode(raw);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(SORT_STORAGE_KEY);
      if (
        raw === "updated_desc" ||
        raw === "updated_asc" ||
        raw === "title_asc" ||
        raw === "title_desc" ||
        raw === "featured_rank"
      ) {
        setSortMode(raw);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SORT_STORAGE_KEY, sortMode);
    } catch {
      // ignore
    }
  }, [sortMode]);

  const visibleProjects = useMemo(() => {
    const parseTime = (value?: string | null) => {
      if (!value) return 0;
      const t = Date.parse(value);
      return Number.isFinite(t) ? t : 0;
    };

    const next = [...projects];
    next.sort((a, b) => {
      switch (sortMode) {
        case "updated_asc":
          return parseTime(a.updatedAt) - parseTime(b.updatedAt);
        case "updated_desc":
          return parseTime(b.updatedAt) - parseTime(a.updatedAt);
        case "title_asc":
          return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
        case "title_desc":
          return b.title.localeCompare(a.title, undefined, { sensitivity: "base" });
        case "featured_rank": {
          const aFeatured = a.isFeatured ? 1 : 0;
          const bFeatured = b.isFeatured ? 1 : 0;
          if (aFeatured !== bFeatured) return bFeatured - aFeatured;

          const aRank = a.featuredRank ?? Number.POSITIVE_INFINITY;
          const bRank = b.featuredRank ?? Number.POSITIVE_INFINITY;
          if (aRank !== bRank) return aRank - bRank;

          return parseTime(b.updatedAt) - parseTime(a.updatedAt);
        }
        default:
          return 0;
      }
    });
    const q = search.trim().toLowerCase();
    if (!q) return next;

    return next.filter((p) => {
      const tools = Array.isArray(p.tools) ? p.tools : [];
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const haystack = [p.title, p.slug, ...tools, ...tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, sortMode, search]);

  useEffect(() => {
    setPage(1);
  }, [category, status, search, sortMode, viewMode]);

  const paginationMeta = useMemo(() => {
    const total = visibleProjects.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const items = visibleProjects.slice(start, end);
    return { total, totalPages, page: safePage, items };
  }, [visibleProjects, page]);

  useEffect(() => {
    if (page !== paginationMeta.page) setPage(paginationMeta.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationMeta.page]);

  async function updateOne(id: string, update: { status?: "draft" | "published"; isFeatured?: boolean }) {
    if (rowBusyIds.has(id)) return;
    try {
      setRowBusyIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      const nowIso = new Date().toISOString();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: update.status ?? p.status,
                isFeatured: typeof update.isFeatured === "boolean" ? update.isFeatured : p.isFeatured,
                updatedAt: nowIso,
              }
            : p
        )
      );

      const res = await fetch("/api/admin/projects/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id], ...update }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Update failed");
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      await load();
    } finally {
      setRowBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function load() {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (status !== "all") params.set("status", status);

      const res = await fetch(`/api/admin/projects?${params.toString()}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Failed to load projects");

      setProjects(json.projects ?? []);
      // Clear selections that no longer exist in the current list.
      setSelectedIds((prev) => {
        if (prev.size === 0) return prev;
        const allowed = new Set<string>((json.projects ?? []).map((p: any) => String(p.id)));
        const next = new Set<string>();
        for (const id of prev) {
          if (allowed.has(id)) next.add(id);
        }
        return next;
      });
    } catch (err) {
      toast({
        title: "Load failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function importCsvFile(file: File) {
    try {
      setIsLoading(true);

      const csv = await file.text();
      const res = await fetch("/api/admin/projects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Import failed");

      const created = Number(json?.created ?? 0);
      const failed = Number(json?.failed ?? 0);

      toast({
        title: failed > 0 ? "Import finished (with errors)" : "Imported",
        description:
          failed > 0
            ? `${created} created as drafts, ${failed} failed.`
            : `${created} project(s) created as drafts.`,
        variant: created > 0 ? "default" : "destructive",
      });

      setSelectedIds(new Set());
      await load();
    } catch (err) {
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  async function seedStaticNow() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/projects/seed-static", {
        method: "POST",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Seed failed");

      toast({
        title: "Seed complete",
        description: `${Number(json?.created ?? 0)} created, ${Number(json?.skipped ?? 0)} already existed.`,
      });

      await load();
    } catch (err) {
      toast({
        title: "Seed failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function downloadCsvTemplate() {
    const template =
      "title,description,category,tools,tags,live_url,github_url,behance_url,video_url,slug\n" +
      '"My Project","Short description","development","React; Next.js","portfolio; ui","https://example.com","https://github.com/user/repo","","","my-project"\n';

    try {
      const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "projects-template.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: copy into clipboard if download fails.
      void navigator.clipboard?.writeText(template);
      toast({ title: "Copied", description: "CSV template copied to clipboard." });
    }
  }

  const allVisibleIds = paginationMeta.items.map((p) => p.id);
  const visibleSelectedCount = useMemo(() => {
    if (allVisibleIds.length === 0 || selectedIds.size === 0) return 0;
    let count = 0;
    for (const id of allVisibleIds) {
      if (selectedIds.has(id)) count += 1;
    }
    return count;
  }, [allVisibleIds, selectedIds]);

  const allSelected = allVisibleIds.length > 0 && visibleSelectedCount === allVisibleIds.length;
  const someSelected = visibleSelectedCount > 0 && visibleSelectedCount < allVisibleIds.length;

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(() => {
      if (!checked) return new Set();
      return new Set(allVisibleIds);
    });
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function requestConfirm(next: ConfirmState) {
    if (next.showDeleteOptions) setDeleteChoice("project");
    setConfirmState(next);
    setConfirmOpen(true);
  }

  async function runConfirm() {
    if (!confirmState) return;
    try {
      setConfirmBusy(true);
      const ok = await confirmState.onConfirm();
      if (ok) {
        setConfirmOpen(false);
        setConfirmState(null);
      }
    } finally {
      setConfirmBusy(false);
    }
  }

  async function deleteOne(id: string) {
    requestConfirm({
      title: "Delete project?",
      description: "This cannot be undone.",
      actionLabel: "Delete",
      variant: "destructive",
      showDeleteOptions: true,
      onConfirm: async () => {
        try {
          const deleteMedia = deleteChoice === "project_media";
          const url = deleteMedia ? `/api/admin/projects/${id}?deleteMedia=1` : `/api/admin/projects/${id}`;
          const res = await fetch(url, { method: "DELETE" });
          const json = await res.json().catch(() => null);
          if (!res.ok) throw new Error(json?.error ?? "Delete failed");
          toast({
            title: "Deleted",
            description: deleteMedia ? "Project and media removed." : "Project removed.",
          });
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          await load();
          return true;
        } catch (err) {
          toast({
            title: "Delete failed",
            description: err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          });
          return false;
        }
      },
    });
  }

  async function deleteSelected() {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    requestConfirm({
      title: `Delete ${ids.length} selected project(s)?`,
      description: "This cannot be undone.",
      actionLabel: "Delete",
      variant: "destructive",
      showDeleteOptions: true,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          const deleteMedia = deleteChoice === "project_media";
          const suffix = deleteMedia ? "?deleteMedia=1" : "";
          const results = await Promise.allSettled(
            ids.map((id) => fetch(`/api/admin/projects/${id}${suffix}`, { method: "DELETE" }))
          );

          let failed = 0;
          for (const r of results) {
            if (r.status !== "fulfilled" || !r.value.ok) failed += 1;
          }

          if (failed > 0) {
            toast({
              title: "Bulk delete finished",
              description: `${ids.length - failed} deleted, ${failed} failed.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Deleted",
              description: deleteMedia
                ? `${ids.length} project(s) and media removed.`
                : `${ids.length} project(s) removed.`,
            });
          }

          setSelectedIds(new Set());
          await load();
          return true;
        } catch (err) {
          toast({
            title: "Bulk delete failed",
            description: err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          });
          return false;
        } finally {
          setIsLoading(false);
        }
      },
    });
  }

  async function bulkUpdate(update: { status?: "draft" | "published"; isFeatured?: boolean }) {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    const labelParts: string[] = [];
    if (update.status) labelParts.push(`status=${update.status}`);
    if (typeof update.isFeatured === "boolean")
      labelParts.push(`featured=${update.isFeatured ? "yes" : "no"}`);

    requestConfirm({
      title: "Apply bulk action?",
      description: `Apply ${labelParts.join(", ")} to ${ids.length} selected project(s)?`,
      actionLabel: "Apply",
      onConfirm: async () => {
        try {
          setIsLoading(true);
          const res = await fetch("/api/admin/projects/bulk", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, ...update }),
          });
          const json = await res.json().catch(() => null);
          if (!res.ok) throw new Error(json?.error ?? "Bulk update failed");

          toast({ title: "Updated", description: "Bulk action applied." });
          setSelectedIds(new Set());
          await load();
          return true;
        } catch (err) {
          toast({
            title: "Bulk update failed",
            description: err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          });
          return false;
        } finally {
          setIsLoading(false);
        }
      },
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage Web Development, Graphic Design, and Motion projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (!file) return;
              void importCsvFile(file);
            }}
          />

          <Button
            type="button"
            variant="outline"
            className="rounded-full border-zinc-300 dark:border-zinc-700 font-semibold"
            onClick={() => importInputRef.current?.click()}
            disabled={isLoading}
          >
            Import CSV
          </Button>

          <Button
            type="button"
            variant="outline"
            className="rounded-full border-zinc-300 dark:border-zinc-700 font-semibold"
            onClick={downloadCsvTemplate}
          >
            Download CSV template
          </Button>

          <Button
            type="button"
            variant="outline"
            className="rounded-full border-zinc-300 dark:border-zinc-700 font-semibold"
            onClick={seedStaticNow}
            disabled={isLoading}
          >
            Seed static projects
          </Button>

          <Button asChild variant="outline" className="rounded-full border-zinc-300 dark:border-zinc-700 font-semibold">
            <Link href="/admin/projects/new">
              <Plus /> New project
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 px-4 py-3">
        <div className="text-sm text-zinc-700 dark:text-zinc-300">Status:</div>
        <select
          className="h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <div className="text-sm text-zinc-700 dark:text-zinc-300">Sort:</div>
        <select
          className="h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
        >
          <option value="updated_desc">Recently updated</option>
          <option value="updated_asc">Least recently updated</option>
          <option value="title_asc">Title (A → Z)</option>
          <option value="title_desc">Title (Z → A)</option>
          <option value="featured_rank">Featured rank</option>
        </select>

        <div className="text-sm text-zinc-700 dark:text-zinc-300">Search:</div>
        <input
          className="h-10 w-[220px] rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title, slug, tool…"
        />
        {search.trim() ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setSearch("")}
            disabled={isLoading}
          >
            Clear
          </Button>
        ) : null}
        <div className="text-sm text-zinc-600 dark:text-zinc-400">{visibleProjects.length} result(s)</div>

        {paginationMeta.totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={isLoading || paginationMeta.page <= 1}
            >
              Prev
            </Button>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Page {paginationMeta.page} of {paginationMeta.totalPages}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
              disabled={isLoading || paginationMeta.page >= paginationMeta.totalPages}
            >
              Next
            </Button>
          </div>
        ) : null}

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              {selectedIds.size} selected
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => bulkUpdate({ status: "published" })}
              disabled={isLoading}
            >
              Publish
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => bulkUpdate({ status: "draft" })}
              disabled={isLoading}
            >
              Draft
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => bulkUpdate({ isFeatured: true })}
              disabled={isLoading}
            >
              Feature
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => bulkUpdate({ isFeatured: false })}
              disabled={isLoading}
            >
              Unfeature
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-red-300 text-red-700 hover:text-red-800 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
              onClick={deleteSelected}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" /> Delete selected
            </Button>
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "outline" : "ghost"}
            size="sm"
            className="rounded-full"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
          >
            <ListIcon className="h-4 w-4" /> List
          </Button>
          <Button
            variant={viewMode === "grid" ? "outline" : "ghost"}
            size="sm"
            className="rounded-full"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid className="h-4 w-4" /> Grid
          </Button>
        </div>
        <Button variant="outline" className="rounded-full" onClick={load} disabled={isLoading}>
          {isLoading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <Tabs value={category} onValueChange={(v: string) => setCategory(v as AdminCategoryTab)}>
        <TabsList className="w-full justify-start bg-white/80 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800 rounded-full">
          <TabsTrigger value="all" className="rounded-full">
            All
          </TabsTrigger>
          <TabsTrigger value="development" className="rounded-full">
            Web Development
          </TabsTrigger>
          <TabsTrigger value="design" className="rounded-full">
            Graphic Design
          </TabsTrigger>
          <TabsTrigger value="motion" className="rounded-full">
            Motion Graphics
          </TabsTrigger>
        </TabsList>

        {(["all", "development", "design", "motion"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {viewMode === "list" ? (
              <div className="overflow-hidden rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/60 dark:bg-zinc-950/30 hover:bg-zinc-50/60 dark:hover:bg-zinc-950/30">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allSelected ? true : someSelected ? "indeterminate" : false}
                          onCheckedChange={(v: CheckedState) => toggleSelectAll(Boolean(v))}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="w-16 text-zinc-600 dark:text-zinc-400">Preview</TableHead>
                      <TableHead className="text-zinc-600 dark:text-zinc-400">Title</TableHead>
                      <TableHead className="text-zinc-600 dark:text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-600 dark:text-zinc-400">Featured</TableHead>
                      <TableHead className="text-right text-zinc-600 dark:text-zinc-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginationMeta.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-zinc-600 dark:text-zinc-400">
                          {isLoading ? "Loading…" : search.trim() ? "No matches." : "No projects."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginationMeta.items.map((p) => (
                        <TableRow
                          key={p.id}
                          className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(p.id)}
                              onCheckedChange={(v) => toggleRow(p.id, Boolean(v))}
                              aria-label={`Select ${p.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="h-10 w-10 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                              {p.coverImageUrl ? (
                                <img
                                  src={p.coverImageUrl}
                                  alt={p.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{p.title}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-500">/{p.slug}</div>
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              className="disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() =>
                                updateOne(p.id, {
                                  status: p.status === "published" ? "draft" : "published",
                                })
                              }
                              disabled={isLoading || rowBusyIds.has(p.id)}
                              aria-label={`Set ${p.title} to ${p.status === "published" ? "draft" : "published"}`}
                            >
                              <Badge
                                variant="outline"
                                className="rounded-full border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                              >
                                {rowBusyIds.has(p.id) ? "Updating…" : p.status}
                              </Badge>
                            </button>
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              className="disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => updateOne(p.id, { isFeatured: !p.isFeatured })}
                              disabled={isLoading || rowBusyIds.has(p.id)}
                              aria-label={`${p.isFeatured ? "Unfeature" : "Feature"} ${p.title}`}
                            >
                              {p.isFeatured ? (
                                <Badge className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                                >
                                  No
                                </Badge>
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button asChild size="sm" className="rounded-full">
                                <Link href={`/admin/projects/${p.id}`}>
                                  <Pencil /> Edit
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full border-red-300 text-red-700 hover:text-red-800 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                                onClick={() => deleteOne(p.id)}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={allSelected}
                      // @ts-expect-error Radix checkbox uses 'indeterminate' in some setups
                      indeterminate={someSelected}
                      onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                      aria-label="Select all"
                    />
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {visibleProjects.length} project(s)
                    </div>
                  </div>
                </div>

                {paginationMeta.items.length === 0 ? (
                  <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-sm text-zinc-600 dark:text-zinc-400">
                    {isLoading ? "Loading…" : search.trim() ? "No matches." : "No projects."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginationMeta.items.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <Checkbox
                              checked={selectedIds.has(p.id)}
                              onCheckedChange={(v) => toggleRow(p.id, Boolean(v))}
                              aria-label={`Select ${p.title}`}
                            />
                            <div className="flex-1" />
                            <button
                              type="button"
                              className="disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() =>
                                updateOne(p.id, {
                                  status: p.status === "published" ? "draft" : "published",
                                })
                              }
                              disabled={isLoading || rowBusyIds.has(p.id)}
                              aria-label={`Set ${p.title} to ${p.status === "published" ? "draft" : "published"}`}
                            >
                              <Badge
                                variant="outline"
                                className="rounded-full border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                              >
                                {rowBusyIds.has(p.id) ? "Updating…" : p.status}
                              </Badge>
                            </button>
                            {p.isFeatured ? (
                              <button
                                type="button"
                                className="disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={() => updateOne(p.id, { isFeatured: false })}
                                disabled={isLoading || rowBusyIds.has(p.id)}
                                aria-label={`Unfeature ${p.title}`}
                              >
                                <Badge className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                  Featured
                                </Badge>
                              </button>
                            ) : null}
                          </div>

                          <div className="mt-3">
                            <div className="font-medium text-foreground truncate">{p.title}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-500 truncate">/{p.slug}</div>
                          </div>
                        </div>

                        <div className="h-40 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/70 dark:border-zinc-800">
                          {p.coverImageUrl ? (
                            <img
                              src={p.coverImageUrl}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="p-4 border-t border-zinc-200/70 dark:border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Button asChild size="sm" className="rounded-full">
                              <Link href={`/admin/projects/${p.id}`}>
                                <Pencil /> Edit
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full border-red-300 text-red-700 hover:text-red-800 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                              onClick={() => deleteOne(p.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (confirmBusy) return;
          setConfirmOpen(open);
          if (!open) setConfirmState(null);
        }}
      >
        <AlertDialogContent
          onEscapeKeyDown={(e) => {
            if (confirmBusy) e.preventDefault();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmState?.title ?? "Are you sure?"}</AlertDialogTitle>
            {confirmState?.description ? (
              <AlertDialogDescription>{confirmState.description}</AlertDialogDescription>
            ) : null}

            {confirmState?.showDeleteOptions ? (
              <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-3">
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Delete options</div>
                <RadioGroup
                  className="mt-2"
                  value={deleteChoice}
                  onValueChange={(v) => setDeleteChoice(v as any)}
                >
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="project" id="delete-project-only" />
                    <label htmlFor="delete-project-only" className="text-sm text-zinc-700 dark:text-zinc-300">
                      Delete project only (keep Cloudinary media)
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="project_media" id="delete-project-media" />
                    <label htmlFor="delete-project-media" className="text-sm text-zinc-700 dark:text-zinc-300">
                      Delete project + media (also delete images from Cloudinary)
                    </label>
                  </div>
                </RadioGroup>
              </div>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void runConfirm();
              }}
              disabled={confirmBusy}
              className={
                confirmState?.variant === "destructive"
                  ? buttonVariants({ variant: "destructive" })
                  : undefined
              }
            >
              {confirmBusy ? "Working…" : confirmState?.actionLabel ?? "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
