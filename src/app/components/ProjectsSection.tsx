'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Code,
  ExternalLink,
  Github,
  ImageIcon,
  Maximize2,
  Minimize2,
  Palette,
  Play,
  Video,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@ui/dialog';

import BookingModal from './BookingModal';
import type { Project, ProjectCategory, ProjectsByCategory } from '@lib/projects/types';

type MediaItem =
  | { kind: 'image'; url: string; alt?: string }
  | { kind: 'video'; url: string; alt?: string };

function sortImages(images: Project['images']): Project['images'] {
  return [...(images ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function buildProjectMedia(project: Project, opts?: { includeVideo?: boolean }): MediaItem[] {
  const media: MediaItem[] = [];

  if (opts?.includeVideo && project.videoUrl) {
    media.push({ kind: 'video', url: project.videoUrl, alt: project.title });
  }

  const ordered = sortImages(project.images);

  if (project.coverImageUrl) {
    const alreadyIncluded = ordered.some((img) => img.url === project.coverImageUrl);
    if (!alreadyIncluded) {
      media.push({ kind: 'image', url: project.coverImageUrl, alt: project.title });
    }
  }

  for (const img of ordered) {
    media.push({ kind: 'image', url: img.url, alt: img.altText ?? project.title });
  }

  // If there are still no images but we have a cover (and it duplicated), ensure we show at least one.
  if (media.length === 0 && project.coverImageUrl) {
    media.push({ kind: 'image', url: project.coverImageUrl, alt: project.title });
  }

  return media;
}

function categoryLabel(category: ProjectCategory): string {
  switch (category) {
    case 'development':
      return 'Web Development';
    case 'design':
      return 'Graphic Design';
    case 'motion':
      return 'Motion Graphics';
    default:
      return category;
  }
}

type ProjectsSectionProps = {
  mode?: 'featured' | 'all';
  projects: ProjectsByCategory;
};

type ProjectsTab = 'all' | ProjectCategory;

const ProjectsSection = ({ mode = 'featured', projects }: ProjectsSectionProps) => {
  const [activeTab, setActiveTab] = useState<ProjectsTab>('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingServiceType, setBookingServiceType] = useState<
    'development' | 'design' | 'motion'
  >('development');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 12;

  const allProjects = [
    ...projects.development,
    ...projects.design,
    ...projects.motion,
  ];

  const allTags = useMemo(() => {
    const next = new Set<string>();
    for (const p of allProjects) {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      for (const t of tags) {
        const cleaned = String(t).trim();
        if (cleaned) next.add(cleaned);
      }
    }
    return Array.from(next).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [allProjects]);

  const tagSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [] as string[];
    const selected = selectedTag?.toLowerCase() ?? '';
    const matches = allTags.filter((t) => {
      const tl = t.toLowerCase();
      if (selected && tl === selected) return false;
      return tl.includes(q);
    });
    return matches.slice(0, 8);
  }, [allTags, searchQuery, selectedTag]);

  const filteredProjectsByCategory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const tag = selectedTag?.trim().toLowerCase() ?? '';

    const matches = (p: Project) => {
      if (tag) {
        const tags = Array.isArray(p.tags) ? p.tags : [];
        const hasTag = tags.some((t) => String(t).trim().toLowerCase() === tag);
        if (!hasTag) return false;
      }

      if (!q) return true;

      const tools = Array.isArray(p.tools) ? p.tools : [];
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const haystack = [p.title, p.slug, p.description, ...tools, ...tags]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    };

    return {
      development: projects.development.filter(matches),
      design: projects.design.filter(matches),
      motion: projects.motion.filter(matches),
    } satisfies ProjectsByCategory;
  }, [projects, searchQuery, selectedTag]);

  const filteredAllProjects = useMemo(() => {
    return [
      ...filteredProjectsByCategory.development,
      ...filteredProjectsByCategory.design,
      ...filteredProjectsByCategory.motion,
    ];
  }, [filteredProjectsByCategory]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, selectedTag]);

  const paginationMeta = useMemo(() => {
    const list =
      activeTab === 'all'
        ? filteredAllProjects
        : filteredProjectsByCategory[activeTab as ProjectCategory];

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const items = list.slice(start, end);

    return { total, totalPages, page: safePage, items };
  }, [activeTab, filteredAllProjects, filteredProjectsByCategory, page]);

  useEffect(() => {
    if (page !== paginationMeta.page) setPage(paginationMeta.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationMeta.page]);

  const handleBookingClick = (serviceType: 'development' | 'design' | 'motion') => {
    setBookingServiceType(serviceType);
    setShowBookingModal(true);
  };

  const title = mode === 'featured' ? 'Featured Projects' : 'Projects';
  const subtitle =
    mode === 'featured'
      ? 'A curated selection of my work across development, design, and motion graphics.'
      : 'Explore all my projects across development, design, and motion graphics.';

  return (
    <section id="projects" className="py-20 px-4 md:px-8 lg:px-16 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">{title}</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {mode === 'all' ? (
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="w-full max-w-xl">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Search projects</div>
                <div className="relative">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, tools…"
                    className="h-11 w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 px-4 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
                  />

                  {tagSuggestions.length > 0 ? (
                    <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg z-20">
                      {tagSuggestions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className="w-full px-4 py-2 text-left text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                          onClick={() => {
                            setSelectedTag(t);
                            setSearchQuery('');
                          }}
                        >
                          Filter by tag: <span className="font-medium">{t}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {paginationMeta.total} result(s)
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTag ? (
                      <Badge variant="outline" className="rounded-full">
                        Tag: {selectedTag}
                        <button
                          type="button"
                          className="ml-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                          aria-label="Clear tag filter"
                          onClick={() => setSelectedTag(null)}
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null}

                    {searchQuery.trim() ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={(v) => setActiveTab(v as ProjectsTab)}
          >
            <TabsList className="mx-auto w-full flex justify-center mb-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm p-2 sm:px-2 md:p-3 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm gap-1 sm:gap-2">
              <TabsTrigger
                value="all"
                className="rounded-full p-2 lg:px-6 py-2 text-xs sm:text-sm md:text-sm font-medium transition-all duration-200 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 data-[state=active]:hover:bg-zinc-900"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="development"
                className="rounded-full p-2 lg:px-6 py-2 text-xs sm:text-sm md:text-sm font-medium transition-all duration-200 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 data-[state=active]:hover:bg-zinc-900"
              >
                <Code size={14} className="mr-1 sm:mr-2" /> Web Development
              </TabsTrigger>
              <TabsTrigger
                value="design"
                className="rounded-full p-2 sm:px-2 lg:px-6 py-2 text-xs sm:text-sm md:text-sm font-medium transition-all duration-200 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 data-[state=active]:hover:bg-zinc-900"
              >
                <Palette size={14} className="mr-1 sm:mr-2" /> Graphic Design
              </TabsTrigger>
              <TabsTrigger
                value="motion"
                className="rounded-full p-2 lg:px-6 py-2 text-xs sm:text-sm md:text-sm font-medium transition-all duration-200 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 data-[state=active]:hover:bg-zinc-900"
              >
                <Video size={14} className="mr-1 sm:mr-2" /> Motion Graphics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {paginationMeta.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-8 text-center text-zinc-600 dark:text-zinc-300">
                    No projects yet.
                  </div>
                ) : (
                  paginationMeta.items.map((project, index) =>
                    project.category === 'motion' ? (
                      <MotionProjectCard key={project.id} project={project} index={index} />
                    ) : (
                      <ProjectCard key={project.id} project={project} index={index} />
                    )
                  )
                )}
              </div>

              {mode === 'all' && paginationMeta.totalPages > 1 ? (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={paginationMeta.page <= 1}
                  >
                    Prev
                  </Button>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    Page {paginationMeta.page} of {paginationMeta.totalPages}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                    disabled={paginationMeta.page >= paginationMeta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              ) : null}

              {mode === 'featured' && (
                <div className="mt-12 flex flex-wrap justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-200 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-950 transition-colors duration-300 rounded-full"
                  >
                    <Link href="/projects">View more</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="development" className="mt-0">
              {mode === 'all' ? (
                <>
                  <ProjectsGrid
                    projects={
                      activeTab === 'development'
                        ? (paginationMeta.items as Project[])
                        : filteredProjectsByCategory.development
                    }
                    card="default"
                  />
                  {activeTab === 'development' && paginationMeta.totalPages > 1 ? (
                    <div className="mt-10 flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={paginationMeta.page <= 1}
                      >
                        Prev
                      </Button>
                      <div className="text-sm text-zinc-700 dark:text-zinc-300">
                        Page {paginationMeta.page} of {paginationMeta.totalPages}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                        disabled={paginationMeta.page >= paginationMeta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : (
                <ProjectsGrid projects={projects.development} card="default" />
              )}
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white transition-colors duration-300 rounded-full"
                >
                  <a
                    href="https://github.com/godofmachine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github size={18} /> More on GitHub
                  </a>
                </Button>
                <Button
                  onClick={() => handleBookingClick('development')}
                  size="lg"
                  variant="outline"
                  className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-200 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-950 transition-colors duration-300 rounded-full"
                >
                  <Calendar size={18} className="mr-2" /> Book a Website
                </Button>
                {mode === 'featured' && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-200 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-950 transition-colors duration-300 rounded-full"
                  >
                    <Link href="/projects">View more</Link>
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="design" className="mt-0">
              {mode === 'all' ? (
                <>
                  <ProjectsGrid
                    projects={
                      activeTab === 'design'
                        ? (paginationMeta.items as Project[])
                        : filteredProjectsByCategory.design
                    }
                    card="default"
                  />
                  {activeTab === 'design' && paginationMeta.totalPages > 1 ? (
                    <div className="mt-10 flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={paginationMeta.page <= 1}
                      >
                        Prev
                      </Button>
                      <div className="text-sm text-zinc-700 dark:text-zinc-300">
                        Page {paginationMeta.page} of {paginationMeta.totalPages}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                        disabled={paginationMeta.page >= paginationMeta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : (
                <ProjectsGrid projects={projects.design} card="default" />
              )}
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => handleBookingClick('design')}
                  size="lg"
                  variant="outline"
                  className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-200 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-950 transition-colors duration-300 rounded-full"
                >
                  <Calendar size={18} className="mr-2" /> Book Graphic Design
                </Button>
                {mode === 'featured' && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-200 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-950 transition-colors duration-300 rounded-full"
                  >
                    <Link href="/projects">View more</Link>
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="motion" className="mt-0">
              {mode === 'all' ? (
                <>
                  <ProjectsGrid
                    projects={
                      activeTab === 'motion'
                        ? (paginationMeta.items as Project[])
                        : filteredProjectsByCategory.motion
                    }
                    card="motion"
                  />
                  {activeTab === 'motion' && paginationMeta.totalPages > 1 ? (
                    <div className="mt-10 flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={paginationMeta.page <= 1}
                      >
                        Prev
                      </Button>
                      <div className="text-sm text-zinc-700 dark:text-zinc-300">
                        Page {paginationMeta.page} of {paginationMeta.totalPages}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                        disabled={paginationMeta.page >= paginationMeta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : (
                <ProjectsGrid projects={projects.motion} card="motion" />
              )}
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => handleBookingClick('motion')}
                  size="lg"
                  variant="outline"
                  className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-200 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-950 transition-colors duration-300 rounded-full"
                >
                  <Calendar size={18} className="mr-2" /> Book Motion Graphics
                </Button>
                {mode === 'featured' && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-200 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-950 transition-colors duration-300 rounded-full"
                  >
                    <Link href="/projects">View more</Link>
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          serviceType={bookingServiceType}
        />
      </div>
    </section>
  );
};

function ProjectsGrid({
  projects,
  card,
}: {
  projects: Project[];
  card: 'default' | 'motion';
}) {
  if (!projects || projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-8 text-center text-zinc-600 dark:text-zinc-300">
        No projects yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {projects.map((project, index) =>
        card === 'motion' ? (
          <MotionProjectCard key={project.id} project={project} index={index} />
        ) : (
          <ProjectCard key={project.id} project={project} index={index} />
        )
      )}
    </div>
  );
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const cover = project.coverImageUrl || project.images[0]?.url;
  const tools = project.tools ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-zinc-900/60 border border-transparent dark:border-zinc-800"
    >
      {cover ? (
        <GalleryDialog project={project}>
          <div className="aspect-square overflow-hidden cursor-pointer relative">
            <img
              src={cover}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            />

            <div className="absolute left-3 top-3">
              <Badge
                variant="outline"
                className="rounded-full bg-white/90 dark:bg-zinc-950/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
              >
                {categoryLabel(project.category)}
              </Badge>
            </div>
          </div>
        </GalleryDialog>
      ) : (
        <div className="aspect-square overflow-hidden bg-zinc-100 flex items-center justify-center text-zinc-500 relative">
          <ImageIcon />

          <div className="absolute left-3 top-3">
            <Badge
              variant="outline"
              className="rounded-full bg-white/90 dark:bg-zinc-950/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
            >
              {categoryLabel(project.category)}
            </Badge>
          </div>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">{project.title}</h3>

        {tools.length > 0 && (
          <div className="mt-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Tools
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {tools.slice(0, 10).map((tool, i) => (
                <Badge
                  key={`tool-${tool}-${i}`}
                  variant="outline"
                  className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                >
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {project.links
            .filter((l) => l.kind === 'live')
            .map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1 text-sm"
              >
                <ExternalLink size={14} /> Live Site
              </a>
            ))}
          {project.links
            .filter((l) => l.kind === 'github')
            .map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1 text-sm"
              >
                <Github size={14} /> GitHub
              </a>
            ))}
          {project.links
            .filter((l) => l.kind === 'behance')
            .map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1 text-sm"
              >
                <ExternalLink size={14} /> Behance
              </a>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

const MotionProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const cover = project.coverImageUrl || project.images[0]?.url;
  const tools = project.tools ?? [];
  const media = useMemo(() => buildProjectMedia(project, { includeVideo: true }), [project]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const swipeStartRef = React.useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setExpanded(false);
    }
  }, [open, project.id]);

  const canNavigate = media.length > 1;
  const goPrev = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
  };
  const goNext = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev + 1) % media.length);
  };

  const onSwipeStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    swipeStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const onSwipeEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || !canNavigate) return;
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 40) return;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const dialogContentClass = expanded
    ? 'left-0 right-0 bottom-0 top-[var(--app-header-height,0px)] translate-x-0 translate-y-0 w-[100dvw] max-w-[100dvw] h-[calc(100dvh-var(--app-header-height,0px))] max-h-[calc(100dvh-var(--app-header-height,0px))] p-0 overflow-hidden'
    : 'left-0 right-0 translate-x-0 sm:left-[50%] sm:right-auto sm:translate-x-[-50%] w-[100dvw] max-w-[100dvw] sm:max-w-7xl sm:w-full p-0 max-h-[92vh] overflow-y-auto overflow-x-hidden';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="aspect-square overflow-hidden cursor-pointer relative">
            {cover ? (
              <img
                src={cover}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <ImageIcon />
              </div>
            )}

            <div className="absolute left-3 top-3">
              <Badge
                variant="outline"
                className="rounded-full bg-white/90 dark:bg-zinc-950/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
              >
                {categoryLabel(project.category)}
              </Badge>
            </div>

            {project.videoUrl && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 dark:bg-zinc-900/80 rounded-full p-4">
                  <Play size={24} className="text-zinc-900 dark:text-white" />
                </div>
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className={dialogContentClass}>
          <DialogTitle className="sr-only">{project.title}</DialogTitle>

          {expanded ? (
            <div className="relative h-full w-full bg-zinc-50 dark:bg-zinc-950/40">
              <div className="absolute inset-0" aria-hidden="true" />
              <div
                className="h-full w-full"
                  onTouchStart={onSwipeStart}
                  onTouchEnd={onSwipeEnd}
                >
                  {media.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                      No media for this project.
                    </div>
                  ) : media[activeIndex]?.kind === 'video' ? (
                    <video
                      src={media[activeIndex].url}
                      controls
                      autoPlay
                      className="w-full h-full max-w-full max-h-full object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={media[activeIndex]?.url}
                      alt={media[activeIndex]?.alt ?? project.title}
                      className="w-full h-full max-w-full max-h-full object-contain"
                    />
                  )}
              </div>

              {canNavigate ? (
                <>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                      onClick={goPrev}
                      aria-label="Previous media"
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </Button>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                      onClick={goNext}
                      aria-label="Next media"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : null}

              <div className="absolute left-3 top-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full bg-white/90 dark:bg-zinc-950/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                >
                  {categoryLabel(project.category)}
                </Badge>
              </div>

              <div className="absolute bottom-3 right-3 sm:top-3 sm:bottom-auto">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                  onClick={() => setExpanded(false)}
                >
                  <Minimize2 className="h-4 w-4" /> Collapse
                </Button>
              </div>

              {media.length > 1 ? (
                <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto pb-1">
                  {media.map((m, i) => (
                    <button
                      key={`${m.kind}-${m.url}-${i}`}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={
                        'relative h-16 w-24 flex-none overflow-hidden rounded-md border bg-white dark:bg-zinc-950/40 transition ' +
                        (i === activeIndex
                          ? 'border-zinc-900 dark:border-zinc-100'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600')
                      }
                      aria-label={m.kind === 'video' ? 'Show video' : `Show image ${i + 1}`}
                    >
                      {m.kind === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900">
                          <Play className="h-5 w-5" />
                        </div>
                      ) : (
                        <img
                          src={m.url}
                          alt={m.alt ?? project.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="lg:col-span-3 p-4 md:p-6">
                <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40">
                  <div
                    className="h-[45vh] sm:h-[52vh] md:h-[58vh]"
                    onTouchStart={onSwipeStart}
                    onTouchEnd={onSwipeEnd}
                  >
                    {media.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                        No media for this project.
                      </div>
                    ) : media[activeIndex]?.kind === 'video' ? (
                      <video
                        src={media[activeIndex].url}
                        controls
                        autoPlay
                        className="w-full h-full max-w-full max-h-full object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={media[activeIndex]?.url}
                        alt={media[activeIndex]?.alt ?? project.title}
                        className="w-full h-full max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>

                  {canNavigate ? (
                    <>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                          onClick={goPrev}
                          aria-label="Previous media"
                        >
                          <ChevronLeft className="h-4 w-4" /> Prev
                        </Button>
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                          onClick={goNext}
                          aria-label="Next media"
                        >
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : null}

                  <div className="absolute left-3 top-3">
                    <Badge
                      variant="outline"
                      className="rounded-full bg-white/90 dark:bg-zinc-950/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                    >
                      {categoryLabel(project.category)}
                    </Badge>
                  </div>

                  <div className="absolute right-3 top-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                      onClick={() => setExpanded(true)}
                    >
                      <Maximize2 className="h-4 w-4" /> Expand
                    </Button>
                  </div>
                </div>

                {media.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {media.map((m, i) => (
                      <button
                        key={`${m.kind}-${m.url}-${i}`}
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        className={
                          'relative h-16 w-24 flex-none overflow-hidden rounded-md border bg-white dark:bg-zinc-950/40 transition ' +
                          (i === activeIndex
                            ? 'border-zinc-900 dark:border-zinc-100'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600')
                        }
                        aria-label={m.kind === 'video' ? 'Show video' : `Show image ${i + 1}`}
                      >
                        {m.kind === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900">
                            <Play className="h-5 w-5" />
                          </div>
                        ) : (
                          <img
                            src={m.url}
                            alt={m.alt ?? project.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 p-4 md:p-6 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{project.title}</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1">
                  {tools.slice(0, 16).map((skill, i) => (
                    <Badge
                      key={`${skill}-${i}`}
                      variant="outline"
                      className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                {project.links?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.links
                      .filter((l) => l.kind === 'live')
                      .map((l) => (
                        <Button key={l.url} asChild size="sm" className="rounded-full">
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink size={14} /> Live Site
                          </a>
                        </Button>
                      ))}
                    {project.links
                      .filter((l) => l.kind === 'github')
                      .map((l) => (
                        <Button
                          key={l.url}
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Github size={14} /> GitHub
                          </a>
                        </Button>
                      ))}
                    {project.links
                      .filter((l) => l.kind === 'behance')
                      .map((l) => (
                        <Button
                          key={l.url}
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink size={14} /> Behance
                          </a>
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">{project.title}</h3>

        {tools.length > 0 && (
          <div className="mt-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Tools
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {tools.slice(0, 10).map((tool, i) => (
                <Badge
                  key={`tool-${tool}-${i}`}
                  variant="outline"
                  className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                >
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {project.images.length > 0 && (
          <GalleryDialog project={project}>
            <Button variant="outline" size="sm" className="rounded-full">
              View images
            </Button>
          </GalleryDialog>
        )}
      </div>
    </motion.div>
  );
};

function GalleryDialog({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  const imageMedia = useMemo(
    () => buildProjectMedia(project).filter((m): m is Extract<MediaItem, { kind: 'image' }> => m.kind === 'image'),
    [project]
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const swipeStartRef = React.useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setExpanded(false);
    }
  }, [open, project.id]);

  const canNavigate = imageMedia.length > 1;
  const goPrev = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev - 1 + imageMedia.length) % imageMedia.length);
  };
  const goNext = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev + 1) % imageMedia.length);
  };

  const onSwipeStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    swipeStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const onSwipeEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || !canNavigate) return;
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 40) return;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const dialogContentClass = expanded
    ? 'left-0 right-0 bottom-0 top-[var(--app-header-height,0px)] translate-x-0 translate-y-0 w-[100dvw] max-w-[100dvw] h-[calc(100dvh-var(--app-header-height,0px))] max-h-[calc(100dvh-var(--app-header-height,0px))] p-0 overflow-hidden'
    : 'left-0 right-0 translate-x-0 sm:left-[50%] sm:right-auto sm:translate-x-[-50%] w-[100dvw] max-w-[100dvw] sm:max-w-7xl sm:w-full p-0 max-h-[92vh] overflow-y-auto overflow-x-hidden';

  const tools = project.tools ?? [];
  const tags = project.tags ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={dialogContentClass}>
        <DialogTitle className="sr-only">{project.title}</DialogTitle>

        {expanded ? (
          <div className="relative h-full w-full bg-zinc-50 dark:bg-zinc-950/40">
            <div
              className="h-full w-full"
                onTouchStart={onSwipeStart}
                onTouchEnd={onSwipeEnd}
              >
                {imageMedia.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                    No images for this project.
                  </div>
                ) : (
                  <img
                    src={imageMedia[activeIndex]?.url}
                    alt={imageMedia[activeIndex]?.alt ?? project.title}
                    className="w-full h-full max-w-full max-h-full object-contain"
                  />
                )}
            </div>

            {canNavigate ? (
              <>
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                    onClick={goPrev}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                    onClick={goNext}
                    aria-label="Next image"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : null}

            <div className="absolute left-3 top-3">
              <Badge
                variant="outline"
                className="rounded-full bg-white/90 dark:bg-zinc-950/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
              >
                {categoryLabel(project.category)}
              </Badge>
            </div>

            <div className="absolute bottom-3 right-3 sm:top-3 sm:bottom-auto">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                onClick={() => setExpanded(false)}
              >
                <Minimize2 className="h-4 w-4" /> Collapse
              </Button>
            </div>

            {imageMedia.length > 1 ? (
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto pb-1">
                {imageMedia.map((img, i) => (
                  <button
                    key={`${img.url}-${i}`}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={
                      'relative h-16 w-24 flex-none overflow-hidden rounded-md border bg-white dark:bg-zinc-950/40 transition ' +
                      (i === activeIndex
                        ? 'border-zinc-900 dark:border-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600')
                    }
                    aria-label={`Show image ${i + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt ?? project.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3 p-4 md:p-6">
              <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40">
                <div
                  className="h-[45vh] sm:h-[52vh] md:h-[58vh]"
                  onTouchStart={onSwipeStart}
                  onTouchEnd={onSwipeEnd}
                >
                  {imageMedia.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                      No images for this project.
                    </div>
                  ) : (
                    <img
                      src={imageMedia[activeIndex]?.url}
                      alt={imageMedia[activeIndex]?.alt ?? project.title}
                      className="w-full h-full max-w-full max-h-full object-contain"
                    />
                  )}
                </div>

                {canNavigate ? (
                  <>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                        onClick={goPrev}
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" /> Prev
                      </Button>
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                        onClick={goNext}
                        aria-label="Next image"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : null}

                <div className="absolute left-3 top-3">
                  <Badge
                    variant="outline"
                    className="rounded-full bg-white/90 dark:bg-zinc-950/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                  >
                    {categoryLabel(project.category)}
                  </Badge>
                </div>

                <div className="absolute right-3 top-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-white/90 dark:bg-zinc-950/60"
                    onClick={() => setExpanded(true)}
                  >
                    <Maximize2 className="h-4 w-4" /> Expand
                  </Button>
                </div>
              </div>

              {imageMedia.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {imageMedia.map((img, i) => (
                    <button
                      key={`${img.url}-${i}`}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={
                        'relative h-16 w-24 flex-none overflow-hidden rounded-md border bg-white dark:bg-zinc-950/40 transition ' +
                        (i === activeIndex
                          ? 'border-zinc-900 dark:border-zinc-100'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600')
                      }
                      aria-label={`Show image ${i + 1}`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt ?? project.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 p-4 md:p-6 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{project.title}</h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-300 whitespace-pre-line">{project.description}</p>

              {(tools.length > 0 || tags.length > 0) && (
                <div className="mt-4 space-y-3">
                  {tools.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                        Tools
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {tools.slice(0, 24).map((t, i) => (
                          <Badge
                            key={`tool-${t}-${i}`}
                            variant="outline"
                            className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                        Tags
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {tags.slice(0, 24).map((t, i) => (
                          <Badge
                            key={`tag-${t}-${i}`}
                            variant="outline"
                            className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {project.links?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {project.links
                  .filter((l) => l.kind === 'live')
                  .map((l) => (
                    <Button key={l.url} asChild size="sm" className="rounded-full">
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <ExternalLink size={14} /> Live Site
                      </a>
                    </Button>
                  ))}
                {project.links
                  .filter((l) => l.kind === 'github')
                  .map((l) => (
                    <Button key={l.url} asChild size="sm" variant="outline" className="rounded-full">
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Github size={14} /> GitHub
                      </a>
                    </Button>
                  ))}
                {project.links
                  .filter((l) => l.kind === 'behance')
                  .map((l) => (
                    <Button key={l.url} asChild size="sm" variant="outline" className="rounded-full">
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <ExternalLink size={14} /> Behance
                      </a>
                    </Button>
                  ))}
              </div>
            )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProjectsSection;
