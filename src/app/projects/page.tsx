import Header from "../components/Header";
import ProjectsSection from "../components/ProjectsSection";
import Footer from "../components/Footer";
import Link from "next/link";

import { Button } from "@ui/button";

import { fetchProjectsByCategory } from "@lib/projects/public";

export default async function ProjectsPage() {
  const projectsByCategory = await fetchProjectsByCategory({
    featuredOnly: false,
  });

  return (
    <main className="w-full min-h-screen overflow-x-hidden">
      <Header />
      <div className="px-2 lg:px-0">
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">Back</Link>
          </Button>
        </div>
        <ProjectsSection mode="all" projects={projectsByCategory} />
      </div>
      <Footer />
    </main>
  );
}
