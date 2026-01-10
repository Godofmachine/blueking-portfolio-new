import { createSupabaseServiceClient } from "@/lib/supabase/service";

import type { LandingSettings } from "./types";

const SETTINGS_KEY = "landing";

export const DEFAULT_LANDING_SETTINGS: LandingSettings = {
  header: {
    logoUrl: "/logo-bw.png",
    resumeUrl: "/My Resume.pdf",
  },
  hero: {
    name: "Blueking",
    roles: ["Graphic Designer", "Frontend Developer"],
    tagline:
      "I craft visually stunning designs and bring them to life with clean, efficient code. The perfect blend of creativity and technical expertise.",
    ctaLabel: "Say Hello",
    ctaToastTitle: "👋 Hello there!",
    ctaToastDescription: "Thanks for stopping by my portfolio!",
  },
  about: {
    profileImageUrl: "/Oba.jpg",
    profileName: "Adeniran Samuel",
    location: "Based in Ibadan, NGA",
    experienceLabel: "4+ Years",
    projectsLabel: "120+",
    paragraphs: [
      "Hi, I’m Blueking — I’m a graphic designer and front-end developer with a love for clean visuals and clean code.My journey began in print design, grew through branding, and now thrives in the digital space—where I combine visual creativity with technical skill to craft engaging digital experiences.",
      "Outside of design and code, I’m also studying law—drawn to the structure, logic, and impact it has on the real world. And when I’m not in front of a screen or buried in law texts, you’ll find me immersed in dramatic arts or football with full passion.",
      "I build with intention—whether it’s an interface, a brand, or a future.",
    ],
    philosophyTitle: "Design Philosophy",
    philosophyText:
      "I believe that great design solves problems while delighting users. My work balances bold creative choices with usability and purpose.",
    technicalTitle: "Technical Approach",
    technicalText:
      "Writing clean, maintainable code is as important as the visuals. I craft frontend experiences that are not just beautiful, but performant and accessible.",
    resumeUrl: "/My Resume.pdf",
    resumeLabel: "Download Resume",
  },
  contact: {
    web3formsAccessKey: "ad1363bd-b83b-4595-b733-c0ceb046086b",
    email: "samueladeniran016@gmail.com",
    phone: "+234 901 745 9581",
    location: "Ibadan, Nigeria",
    workingHours: "Mon - Fri: 9:00 AM - 6:00 PM",
    xUrl: "https://x.com/Blueking_I",
    githubUrl: "https://github.com/Godofmachine",
    socials: [
      { label: "X", url: "https://x.com/Blueking_I", visible: true },
      { label: "GitHub", url: "https://github.com/Godofmachine", visible: true },
    ],
  },
  footer: {
    displayName: "Adeniran Samuel",
    subtitle: "Designer & Developer",
    githubUrl: "https://github.com/Godofmachine",
    xUrl: "https://x.com/Blueking_I",
    socials: [
      { label: "GitHub", url: "https://github.com/Godofmachine", visible: true },
      { label: "X", url: "https://x.com/Blueking_I", visible: true },
    ],
    buyMeCoffeeUrl: "https://buymeacoffee.com/blueking",
    buyMeCoffeeVisible: true,
    madeWithText: "Made with 💚 in Nigeria",
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const filtered = value.filter((v) => typeof v === "string").map((v) => String(v).trim());
  return filtered.length > 0 ? filtered : fallback;
}

function asSocialLinks(
  value: unknown,
  fallback: Array<{ label: string; url: string; visible: boolean }>
) {
  if (!Array.isArray(value)) return fallback;
  const parsed = value
    .map((item) => {
      if (!isPlainObject(item)) return null;
      return {
        label: asString(item.label, "").trim(),
        url: asString(item.url, "").trim(),
        visible: typeof item.visible === "boolean" ? item.visible : true,
      };
    })
    .filter(Boolean) as Array<{ label: string; url: string; visible: boolean }>;

  return parsed.length ? parsed : fallback;
}

function inferSocialsFromLegacy(legacy: { xUrl?: string; githubUrl?: string }) {
  const result: Array<{ label: string; url: string; visible: boolean }> = [];
  const xUrl = (legacy.xUrl || "").trim();
  const githubUrl = (legacy.githubUrl || "").trim();
  if (xUrl) result.push({ label: "X", url: xUrl, visible: true });
  if (githubUrl) result.push({ label: "GitHub", url: githubUrl, visible: true });
  return result;
}

function mergeLandingSettings(partial: unknown): LandingSettings {
  const d = DEFAULT_LANDING_SETTINGS;
  if (!isPlainObject(partial)) return d;

  const header = isPlainObject(partial.header) ? partial.header : {};
  const hero = isPlainObject(partial.hero) ? partial.hero : {};
  const about = isPlainObject(partial.about) ? partial.about : {};
  const contact = isPlainObject(partial.contact) ? partial.contact : {};
  const footer = isPlainObject(partial.footer) ? partial.footer : {};

  return {
    header: {
      logoUrl: asString(header.logoUrl, d.header.logoUrl),
      resumeUrl: asString(header.resumeUrl, d.header.resumeUrl),
    },
    hero: {
      name: asString(hero.name, d.hero.name),
      roles: asStringArray(hero.roles, d.hero.roles),
      tagline: asString(hero.tagline, d.hero.tagline),
      ctaLabel: asString(hero.ctaLabel, d.hero.ctaLabel),
      ctaToastTitle: asString(hero.ctaToastTitle, d.hero.ctaToastTitle),
      ctaToastDescription: asString(hero.ctaToastDescription, d.hero.ctaToastDescription),
    },
    about: {
      profileImageUrl: asString(about.profileImageUrl, d.about.profileImageUrl),
      profileName: asString(about.profileName, d.about.profileName),
      location: asString(about.location, d.about.location),
      experienceLabel: asString(about.experienceLabel, d.about.experienceLabel),
      projectsLabel: asString(about.projectsLabel, d.about.projectsLabel),
      paragraphs: asStringArray(about.paragraphs, d.about.paragraphs),
      philosophyTitle: asString(about.philosophyTitle, d.about.philosophyTitle),
      philosophyText: asString(about.philosophyText, d.about.philosophyText),
      technicalTitle: asString(about.technicalTitle, d.about.technicalTitle),
      technicalText: asString(about.technicalText, d.about.technicalText),
      resumeUrl: asString(about.resumeUrl, d.about.resumeUrl),
      resumeLabel: asString(about.resumeLabel, d.about.resumeLabel),
    },
    contact: {
      web3formsAccessKey: asString(contact.web3formsAccessKey, d.contact.web3formsAccessKey),
      email: asString(contact.email, d.contact.email),
      phone: asString(contact.phone, d.contact.phone),
      location: asString(contact.location, d.contact.location),
      workingHours: asString(contact.workingHours, d.contact.workingHours),
      xUrl: asString(contact.xUrl, d.contact.xUrl),
      githubUrl: asString(contact.githubUrl, d.contact.githubUrl),
      socials: asSocialLinks(
        (contact as any).socials,
        (() => {
          const legacy = inferSocialsFromLegacy({
            xUrl: asString(contact.xUrl, d.contact.xUrl),
            githubUrl: asString(contact.githubUrl, d.contact.githubUrl),
          });
          return legacy.length ? legacy : d.contact.socials;
        })()
      ),
    },
    footer: {
      displayName: asString(footer.displayName, d.footer.displayName),
      subtitle: asString(footer.subtitle, d.footer.subtitle),
      githubUrl: asString(footer.githubUrl, d.footer.githubUrl),
      xUrl: asString(footer.xUrl, d.footer.xUrl),
      socials: asSocialLinks(
        (footer as any).socials,
        (() => {
          const legacy = inferSocialsFromLegacy({
            xUrl: asString(footer.xUrl, d.footer.xUrl),
            githubUrl: asString(footer.githubUrl, d.footer.githubUrl),
          });
          return legacy.length ? legacy : d.footer.socials;
        })()
      ),
      buyMeCoffeeUrl: asString(footer.buyMeCoffeeUrl, d.footer.buyMeCoffeeUrl),
      buyMeCoffeeVisible:
        typeof (footer as any).buyMeCoffeeVisible === "boolean"
          ? Boolean((footer as any).buyMeCoffeeVisible)
          : d.footer.buyMeCoffeeVisible,
      madeWithText: asString(footer.madeWithText, d.footer.madeWithText),
    },
  };
}

export async function getLandingSettings(): Promise<LandingSettings> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("data")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (error) return DEFAULT_LANDING_SETTINGS;
    return mergeLandingSettings(data?.data);
  } catch {
    return DEFAULT_LANDING_SETTINGS;
  }
}

export async function saveLandingSettings(next: unknown): Promise<LandingSettings> {
  const merged = mergeLandingSettings(next);
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        key: SETTINGS_KEY,
        data: merged,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

  if (error) throw error;
  return merged;
}
