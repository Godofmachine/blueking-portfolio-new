export const STATIC_RESUME_URL = "/SAMUEL-ADENIRAN-(BLUEKING)-CV%20or%20RESUME.pdf";

export function resolveResumeUrl(url: unknown, fallback: string = STATIC_RESUME_URL): string {
  if (typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Cloudinary PDF delivery is currently unreliable in this project.
  // If a Cloudinary URL is provided, fall back to the static resume in /public.
  if (/cloudinary\.com/i.test(trimmed)) return fallback;

  return trimmed;
}
