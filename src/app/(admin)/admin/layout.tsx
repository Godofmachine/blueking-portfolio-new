import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";

import { createSupabaseServerClient } from "@lib/supabase/server";
import { isAdminEmail } from "@lib/auth/admin";
import { Button } from "@ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import AdminSidebar from "./AdminSidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  let userData = await supabase.auth.getUser();
  if (userData.error) {
    await new Promise((r) => setTimeout(r, 300));
    userData = await supabase.auth.getUser();
  }

  if (userData.error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-zinc-200/70 dark:border-zinc-800 bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link
              className="font-semibold tracking-tight text-foreground hover:opacity-90"
              href="/admin/projects"
            >
              Admin Dashboard
            </Link>

            <nav className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/">View site</Link>
              </Button>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-6">
            <h1 className="text-xl font-semibold">Connection issue</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Supabase Auth is temporarily unreachable. Please refresh and try again.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Button asChild className="rounded-full">
                <Link href="/admin/projects">Retry</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/login?next=/admin">Re-login</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const user = userData.data.user;
  const email = user?.email ?? null;

  if (!user) redirect("/login?next=/admin");
  if (!isAdminEmail(email)) redirect("/");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 dark:border-zinc-800 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link
            className="font-semibold tracking-tight text-foreground hover:opacity-90"
            href="/admin/projects"
          >
            Admin Dashboard
          </Link>

          <nav className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/">View site</Link>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <AdminSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}
