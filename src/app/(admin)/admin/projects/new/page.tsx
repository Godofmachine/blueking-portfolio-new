import ProjectForm from "../ProjectForm";
import Link from "next/link";

import { Button } from "@ui/button";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Project</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Create a new project entry.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin/projects">Back</Link>
        </Button>
      </div>
      <ProjectForm mode="create" />
    </div>
  );
}
