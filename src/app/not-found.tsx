import Link from "next/link";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { Button } from "@ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Header />

      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-8 text-center">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Error 404</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
            Page not found
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            The page you’re looking for doesn’t exist or has been moved.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/projects">View projects</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
