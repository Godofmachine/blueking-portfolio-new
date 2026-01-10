This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Admin Dashboard (Projects)

This repo includes a website-based admin dashboard so you can manage portfolio projects (Development / Graphic Design / Motion Graphics) without hardcoding.

**What you get**
- Home page shows **Featured** projects.
- A `/projects` page shows **all published** projects.
- `/admin` lets the super admin add/edit/delete projects, upload multiple images (Cloudinary), and set featured status.

### 1) Configure environment variables

Create a `.env.local` using `.env.example`.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; used by `/api/admin/*`)
- `ADMIN_EMAILS` (comma-separated allowlist)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 2) Create the Supabase tables

Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.

### 3) Enable auth providers

In Supabase Auth settings:
- Enable Google and/or GitHub
- Enable Email (magic links)
- Add redirect URL(s):
	- `http://localhost:3000/auth/callback`
	- `https://YOUR_DOMAIN/auth/callback`

### 4) Use the admin

- Visit `/login` and sign in.
- If your email is in `ADMIN_EMAILS`, you can access `/admin/projects`.

Notes:
- The public site reads **published** projects only.
- If you enable Supabase RLS, you must add read policies (see comments in `supabase/schema.sql`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
