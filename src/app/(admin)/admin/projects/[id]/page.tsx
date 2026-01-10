"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import type { Project } from "@lib/projects/types";
import ProjectForm from "../ProjectForm";
import { useToast } from "@hooks/use-toast";
import { Button } from "@ui/button";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/projects/${projectId}`);
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Failed to load project");
        setProject(json.project);
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

    if (projectId) load();
  }, [projectId, toast]);

  if (isLoading) {
    return <div className="text-zinc-600 dark:text-zinc-400">Loading…</div>;
  }

  if (!project) {
    return <div className="text-zinc-600 dark:text-zinc-400">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Project</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Update details and media.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin/projects">Back</Link>
        </Button>
      </div>
      <ProjectForm mode="edit" projectId={projectId} initial={project} />
    </div>
  );
}
