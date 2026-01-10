import type { ProjectsByCategory, Project } from "./types";

const dev: Project[] = [
  {
    id: "static-dev-1",
    title: "Blueking's Harmony",
    slug: "bluekings-harmony",
    description:
      "A color palette generator with HEX and RGB values, color picking, and image upload support. Built for designers to create beautiful palettes easily.",
    category: "development",
    status: "published",
    isFeatured: true,
    featuredRank: 1,
    tools: ["React"],
    tags: ["ui", "tools"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1749794913656-85ec4538473e?q=80&w=2153&auto=format&fit=crop",
    coverImagePublicId: null,
    videoUrl: null,
    images: [
      {
        url: "https://images.unsplash.com/photo-1749794913656-85ec4538473e?q=80&w=2153&auto=format&fit=crop",
        publicId: null,
        altText: null,
        sortOrder: 0,
      },
    ],
    links: [
      { kind: "live", url: "https://blueking-harmony.vercel.app/" },
      { kind: "github", url: "https://github.com/Godofmachine/blueking-harmony" },
    ],
  },
  {
    id: "static-dev-2",
    title: "Gista",
    slug: "gista",
    description:
      "A data‑driven campaign management platform empowering political, advocacy, and non‑profit teams to manage and optimize outreach using real-time insights.",
    category: "development",
    status: "published",
    isFeatured: true,
    featuredRank: 2,
    tools: ["Next.js"],
    tags: ["dashboard"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1749797119636-8539e84699ee?q=80&w=2113&auto=format&fit=crop",
    coverImagePublicId: null,
    videoUrl: null,
    images: [
      {
        url: "https://images.unsplash.com/photo-1749797119636-8539e84699ee?q=80&w=2113&auto=format&fit=crop",
        publicId: null,
        altText: null,
        sortOrder: 0,
      },
    ],
    links: [
      { kind: "live", url: "https://www.gista.africa/" },
      {
        kind: "github",
        url: "https://github.com/Godofmachine/Gista-Temporary-landing-page",
      },
    ],
  },
];

const design: Project[] = [
  {
    id: "static-design-1",
    title: "Brand Poster Set",
    slug: "brand-poster-set",
    description: "A selection of poster designs and brand visuals.",
    category: "design",
    status: "published",
    isFeatured: true,
    featuredRank: 1,
    tools: ["Photoshop", "Illustrator"],
    tags: ["branding"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1200&auto=format&fit=crop",
    coverImagePublicId: null,
    videoUrl: null,
    images: [
      {
        url: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1200&auto=format&fit=crop",
        publicId: null,
        altText: null,
        sortOrder: 0,
      },
    ],
    links: [],
  },
];

const motion: Project[] = [
  {
    id: "static-motion-1",
    title: "Cleve Interiors Logo Reveal",
    slug: "cleve-interiors-logo-reveal",
    description:
      "A smooth and elegant animated logo reveal designed for Cleve Interiors, blending modern motion graphics with minimalist design elements.",
    category: "motion",
    status: "published",
    isFeatured: true,
    featuredRank: 1,
    tools: ["After Effects"],
    tags: ["logo"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1749814138080-31b85b70479c?q=80&w=2080&auto=format&fit=crop",
    coverImagePublicId: null,
    videoUrl:
      "https://res.cloudinary.com/dsemtlthg/video/upload/f_auto:video,q_auto/v1/Portfolio/hkghsrbj5togpntxwdzc",
    images: [
      {
        url: "https://images.unsplash.com/photo-1749814138080-31b85b70479c?q=80&w=2080&auto=format&fit=crop",
        publicId: null,
        altText: null,
        sortOrder: 0,
      },
    ],
    links: [],
  },
  {
    id: "static-motion-2",
    title: "Cleve Interiors Logo Reveal II",
    slug: "cleve-interiors-logo-reveal-2",
    description:
      "A second stylistic logo animation for Cleve Interiors, combining subtle motion and refined typography.",
    category: "motion",
    status: "published",
    isFeatured: true,
    featuredRank: 2,
    tools: ["After Effects"],
    tags: ["logo"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1749814138080-31b85b70479c?q=80&w=2080&auto=format&fit=crop",
    coverImagePublicId: null,
    videoUrl:
      "https://res.cloudinary.com/dsemtlthg/video/upload/f_auto:video,q_auto/v1/Portfolio/ulhonafwwbn1geowf5ly",
    images: [
      {
        url: "https://images.unsplash.com/photo-1749814138080-31b85b70479c?q=80&w=2080&auto=format&fit=crop",
        publicId: null,
        altText: null,
        sortOrder: 0,
      },
    ],
    links: [],
  },
];

export const staticProjectsByCategory: ProjectsByCategory = {
  development: dev,
  design,
  motion,
};
