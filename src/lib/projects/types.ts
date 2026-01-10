export type ProjectCategory = "development" | "design" | "motion";
export type ProjectStatus = "draft" | "published";

export type ProjectLinkKind = "live" | "github" | "behance";

export type ProjectLink = {
  kind: ProjectLinkKind;
  url: string;
};

export type ProjectImage = {
  url: string;
  publicId?: string | null;
  altText?: string | null;
  sortOrder: number;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  isFeatured: boolean;
  featuredRank?: number | null;
  tools: string[];
  tags: string[];
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  videoUrl?: string | null;
  updatedAt?: string | null;
  images: ProjectImage[];
  links: ProjectLink[];
};

export type ProjectsByCategory = Record<ProjectCategory, Project[]>;
