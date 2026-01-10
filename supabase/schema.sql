-- Portfolio projects schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  category text not null check (category in ('development','design','motion')),
  status text not null check (status in ('draft','published')),
  is_featured boolean not null default false,
  featured_rank int null,
  tools text[] not null default '{}',
  tags text[] not null default '{}',
  cover_image_url text null,
  cover_image_public_id text null,
  video_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null,
  public_id text null,
  alt_text text null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_media_project_order_idx
  on public.project_media(project_id, sort_order);

create table if not exists public.project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('live','github','behance')),
  url text not null
);

create index if not exists project_links_project_idx
  on public.project_links(project_id);

-- Site settings (single-row JSON store for landing page/admin settings)
create table if not exists public.site_settings (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Optional (recommended) RLS policies for public read of published projects.
-- If you enable RLS, you must add policies like these or the public site won't be able to read.
--
-- alter table public.projects enable row level security;
-- create policy "public can read published projects"
--   on public.projects
--   for select
--   using (status = 'published');
--
-- alter table public.project_media enable row level security;
-- create policy "public can read media for published projects"
--   on public.project_media
--   for select
--   using (
--     exists (
--       select 1 from public.projects p
--       where p.id = project_media.project_id and p.status = 'published'
--     )
--   );
--
-- alter table public.project_links enable row level security;
-- create policy "public can read links for published projects"
--   on public.project_links
--   for select
--   using (
--     exists (
--       select 1 from public.projects p
--       where p.id = project_links.project_id and p.status = 'published'
--     )
--   );
