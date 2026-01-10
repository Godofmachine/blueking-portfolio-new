export default function LoadingProjectsPage() {
  return (
    <main className="w-full min-h-screen overflow-x-hidden">
      <div className="px-2 lg:px-0">
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="h-10 w-24 rounded-full bg-zinc-200/60 dark:bg-zinc-800/50 animate-pulse" />
        </div>

        <section className="py-20 px-4 md:px-8 lg:px-16 bg-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center">
              <div className="h-10 w-64 mx-auto rounded-md bg-zinc-200/60 dark:bg-zinc-800/50 animate-pulse" />
              <div className="mt-4 h-5 w-[420px] max-w-full mx-auto rounded-md bg-zinc-200/60 dark:bg-zinc-800/50 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-zinc-200/60 dark:bg-zinc-800/50 animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
