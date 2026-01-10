"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@ui/switch";
import { Toggle } from "@ui/toggle";

import type { LandingSettings } from "@lib/site/types";

type ApiPayload = {
  settings: LandingSettings;
};

const SECTION_KEYS = ["header", "hero", "about", "contact", "footer"] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function coerceString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function coerceStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  const strings = value.filter((v) => typeof v === "string").map((v) => String(v));
  return strings.length ? strings : fallback;
}

function normalizeLandingSettings(raw: unknown): LandingSettings {
  const root = isRecord(raw) ? raw : {};

  const header = isRecord(root.header) ? root.header : {};
  const hero = isRecord(root.hero) ? root.hero : {};
  const about = isRecord(root.about) ? root.about : {};
  const contact = isRecord(root.contact) ? root.contact : {};
  const footer = isRecord(root.footer) ? root.footer : {};

  return {
    header: {
      logoUrl: coerceString(header.logoUrl),
      resumeUrl: coerceString(header.resumeUrl),
    },
    hero: {
      name: coerceString(hero.name),
      roles: coerceStringArray(hero.roles),
      tagline: coerceString(hero.tagline),
      ctaLabel: coerceString(hero.ctaLabel),
      ctaToastTitle: coerceString(hero.ctaToastTitle),
      ctaToastDescription: coerceString(hero.ctaToastDescription),
    },
    about: {
      profileImageUrl: coerceString(about.profileImageUrl),
      profileName: coerceString(about.profileName),
      location: coerceString(about.location),
      experienceLabel: coerceString(about.experienceLabel),
      projectsLabel: coerceString(about.projectsLabel),
      paragraphs: coerceStringArray(about.paragraphs),
      philosophyTitle: coerceString(about.philosophyTitle),
      philosophyText: coerceString(about.philosophyText),
      technicalTitle: coerceString(about.technicalTitle),
      technicalText: coerceString(about.technicalText),
      resumeUrl: coerceString(about.resumeUrl),
      resumeLabel: coerceString(about.resumeLabel),
    },
    contact: {
      web3formsAccessKey: coerceString(contact.web3formsAccessKey),
      email: coerceString(contact.email),
      phone: coerceString(contact.phone),
      location: coerceString(contact.location),
      workingHours: coerceString(contact.workingHours),
      xUrl: coerceString(contact.xUrl),
      githubUrl: coerceString(contact.githubUrl),
      socials: Array.isArray((contact as any).socials)
        ? ((contact as any).socials as any[])
            .map((s) => ({
              label: coerceString((s as any)?.label),
              url: coerceString((s as any)?.url),
              visible: typeof (s as any)?.visible === "boolean" ? Boolean((s as any).visible) : true,
            }))
            .filter((s) => s.label || s.url)
        : [],
    },
    footer: {
      displayName: coerceString(footer.displayName),
      subtitle: coerceString(footer.subtitle),
      githubUrl: coerceString(footer.githubUrl),
      xUrl: coerceString(footer.xUrl),
      socials: Array.isArray((footer as any).socials)
        ? ((footer as any).socials as any[])
            .map((s) => ({
              label: coerceString((s as any)?.label),
              url: coerceString((s as any)?.url),
              visible: typeof (s as any)?.visible === "boolean" ? Boolean((s as any).visible) : true,
            }))
            .filter((s) => s.label || s.url)
        : [],
      buyMeCoffeeUrl: coerceString(footer.buyMeCoffeeUrl),
      buyMeCoffeeVisible:
        typeof (footer as any)?.buyMeCoffeeVisible === "boolean"
          ? Boolean((footer as any).buyMeCoffeeVisible)
          : true,
      madeWithText: coerceString(footer.madeWithText),
    },
  };
}

function joinLines(lines: string[]): string {
  return lines.join("\n");
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function SettingsClient() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<SectionKey>("header");

  const [landing, setLanding] = React.useState<LandingSettings>(() =>
    normalizeLandingSettings({})
  );

  const [uploadingField, setUploadingField] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);

  function getResourceType(file: File): "image" | "video" | "raw" {
    if (file.type && file.type.startsWith("image/")) return "image";
    if (file.type && file.type.startsWith("video/")) return "video";
    return "raw";
  }

  async function uploadToCloudinary(file: File, folder: string) {
    const signatureRes = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });

    if (!signatureRes.ok) {
      const text = await signatureRes.text().catch(() => "");
      throw new Error(text || "Could not prepare upload");
    }

    const { cloudName, apiKey, timestamp, signature } = (await signatureRes.json()) as any;

    const resourceType = getResourceType(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);

    return new Promise<{ url: string; publicId: string | null }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
      );

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const percent = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)));
        setUploadProgress(percent);
      };

      xhr.onload = () => {
        try {
          const ok = xhr.status >= 200 && xhr.status < 300;
          const json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
          if (!ok) {
            const message = json?.error?.message || json?.error || xhr.statusText || "Upload failed";
            reject(new Error(String(message)));
            return;
          }

          resolve({
            url: String(json?.secure_url ?? ""),
            publicId: json?.public_id ? String(json.public_id) : null,
          });
        } catch (e) {
          reject(e);
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.ontimeout = () => reject(new Error("Upload timed out"));
      xhr.send(formData);
    });
  }

  async function handleUpload(field: "header.logoUrl" | "header.resumeUrl" | "about.profileImageUrl" | "about.resumeUrl", file: File) {
    try {
      setUploadingField(field);
      setUploadProgress(0);

      const { url } = await uploadToCloudinary(file, "portfolio/site");

      setLanding((prev) => {
        if (field === "header.logoUrl") {
          return { ...prev, header: { ...prev.header, logoUrl: url } };
        }
        if (field === "header.resumeUrl") {
          return { ...prev, header: { ...prev.header, resumeUrl: url } };
        }
        if (field === "about.profileImageUrl") {
          return { ...prev, about: { ...prev.about, profileImageUrl: url } };
        }
        return { ...prev, about: { ...prev.about, resumeUrl: url } };
      });

      toast({ title: "Upload complete" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setUploadingField(null);
      setUploadProgress(0);
    }
  }

  function updateSocial(
    section: "contact" | "footer",
    index: number,
    patch: Partial<{ label: string; url: string; visible: boolean }>
  ) {
    setLanding((prev) => {
      const list = section === "contact" ? prev.contact.socials : prev.footer.socials;
      const nextList = list.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
      if (section === "contact") return { ...prev, contact: { ...prev.contact, socials: nextList } };
      return { ...prev, footer: { ...prev.footer, socials: nextList } };
    });
  }

  function addSocial(section: "contact" | "footer") {
    setLanding((prev) => {
      const nextItem = { label: "", url: "", visible: true };
      if (section === "contact") {
        return { ...prev, contact: { ...prev.contact, socials: [...prev.contact.socials, nextItem] } };
      }
      return { ...prev, footer: { ...prev.footer, socials: [...prev.footer.socials, nextItem] } };
    });
  }

  function removeSocial(section: "contact" | "footer", index: number) {
    setLanding((prev) => {
      if (section === "contact") {
        return {
          ...prev,
          contact: {
            ...prev.contact,
            socials: prev.contact.socials.filter((_, idx) => idx !== index),
          },
        };
      }
      return {
        ...prev,
        footer: {
          ...prev.footer,
          socials: prev.footer.socials.filter((_, idx) => idx !== index),
        },
      };
    });
  }

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/site-settings", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to load settings (${res.status})`);
        }

        const json = (await res.json()) as Partial<ApiPayload>;
        if (!cancelled) {
          setLanding(normalizeLandingSettings(json.settings));
        }
      } catch (err) {
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Could not load settings",
            description: err instanceof Error ? err.message : "Unknown error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: landing }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Save failed (${res.status})`);
      }

      toast({ title: "Settings saved" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not save settings",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Edit landing page content and links.
          </p>
        </div>

        <Button onClick={onSave} disabled={loading || saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Landing</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SectionKey)}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="header">Header</TabsTrigger>
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
            </TabsList>

            <TabsContent value="header" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="header-logoUrl">Logo URL</Label>
                  <Input
                    id="header-logoUrl"
                    value={landing.header.logoUrl}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        header: { ...prev.header, logoUrl: e.target.value },
                      }))
                    }
                    placeholder="/logo-bw.png"
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={loading || uploadingField === "header.logoUrl"}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (!file) return;
                        void handleUpload("header.logoUrl", file);
                        e.currentTarget.value = "";
                      }}
                    />
                    <div className="text-xs text-muted-foreground w-12 text-right">
                      {uploadingField === "header.logoUrl" ? `${uploadProgress}%` : ""}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="header-resumeUrl">Resume URL</Label>
                  <Input
                    id="header-resumeUrl"
                    value={landing.header.resumeUrl}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        header: { ...prev.header, resumeUrl: e.target.value },
                      }))
                    }
                    placeholder="https://..."
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="application/pdf"
                      disabled={loading || uploadingField === "header.resumeUrl"}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (!file) return;
                        void handleUpload("header.resumeUrl", file);
                        e.currentTarget.value = "";
                      }}
                    />
                    <div className="text-xs text-muted-foreground w-12 text-right">
                      {uploadingField === "header.resumeUrl" ? `${uploadProgress}%` : ""}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hero" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hero-name">Name</Label>
                  <Input
                    id="hero-name"
                    value={landing.hero.name}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, name: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-tagline">Tagline</Label>
                  <Input
                    id="hero-tagline"
                    value={landing.hero.tagline}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, tagline: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="hero-roles">Roles (one per line)</Label>
                <Textarea
                  id="hero-roles"
                  value={joinLines(landing.hero.roles)}
                  onChange={(e) =>
                    setLanding((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, roles: splitLines(e.target.value) },
                    }))
                  }
                  rows={5}
                  disabled={loading}
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hero-ctaLabel">CTA label</Label>
                  <Input
                    id="hero-ctaLabel"
                    value={landing.hero.ctaLabel}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, ctaLabel: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-ctaToastTitle">CTA toast title</Label>
                  <Input
                    id="hero-ctaToastTitle"
                    value={landing.hero.ctaToastTitle}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, ctaToastTitle: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hero-ctaToastDescription">CTA toast description</Label>
                  <Input
                    id="hero-ctaToastDescription"
                    value={landing.hero.ctaToastDescription}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, ctaToastDescription: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="about-profileName">Profile name</Label>
                  <Input
                    id="about-profileName"
                    value={landing.about.profileName}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, profileName: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-location">Location</Label>
                  <Input
                    id="about-location"
                    value={landing.about.location}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, location: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-profileImageUrl">Profile image URL</Label>
                  <Input
                    id="about-profileImageUrl"
                    value={landing.about.profileImageUrl}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, profileImageUrl: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={loading || uploadingField === "about.profileImageUrl"}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (!file) return;
                        void handleUpload("about.profileImageUrl", file);
                        e.currentTarget.value = "";
                      }}
                    />
                    <div className="text-xs text-muted-foreground w-12 text-right">
                      {uploadingField === "about.profileImageUrl" ? `${uploadProgress}%` : ""}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-resumeUrl">Resume URL</Label>
                  <Input
                    id="about-resumeUrl"
                    value={landing.about.resumeUrl}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, resumeUrl: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="application/pdf"
                      disabled={loading || uploadingField === "about.resumeUrl"}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (!file) return;
                        void handleUpload("about.resumeUrl", file);
                        e.currentTarget.value = "";
                      }}
                    />
                    <div className="text-xs text-muted-foreground w-12 text-right">
                      {uploadingField === "about.resumeUrl" ? `${uploadProgress}%` : ""}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-resumeLabel">Resume button label</Label>
                  <Input
                    id="about-resumeLabel"
                    value={landing.about.resumeLabel}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, resumeLabel: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="about-experienceLabel">Experience</Label>
                  <Input
                    id="about-experienceLabel"
                    value={landing.about.experienceLabel}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, experienceLabel: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-projectsLabel">Projects</Label>
                  <Input
                    id="about-projectsLabel"
                    value={landing.about.projectsLabel}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, projectsLabel: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="about-paragraphs">Paragraphs (one per line)</Label>
                <Textarea
                  id="about-paragraphs"
                  value={joinLines(landing.about.paragraphs)}
                  onChange={(e) =>
                    setLanding((prev) => ({
                      ...prev,
                      about: { ...prev.about, paragraphs: splitLines(e.target.value) },
                    }))
                  }
                  rows={6}
                  disabled={loading}
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="about-philosophyTitle">Philosophy title</Label>
                  <Input
                    id="about-philosophyTitle"
                    value={landing.about.philosophyTitle}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, philosophyTitle: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-technicalTitle">Technical title</Label>
                  <Input
                    id="about-technicalTitle"
                    value={landing.about.technicalTitle}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, technicalTitle: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="about-philosophyText">Philosophy text</Label>
                  <Textarea
                    id="about-philosophyText"
                    value={landing.about.philosophyText}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, philosophyText: e.target.value },
                      }))
                    }
                    rows={4}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="about-technicalText">Technical text</Label>
                  <Textarea
                    id="about-technicalText"
                    value={landing.about.technicalText}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        about: { ...prev.about, technicalText: e.target.value },
                      }))
                    }
                    rows={4}
                    disabled={loading}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    value={landing.contact.email}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={landing.contact.phone}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-location">Location</Label>
                  <Input
                    id="contact-location"
                    value={landing.contact.location}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, location: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-workingHours">Working hours</Label>
                  <Input
                    id="contact-workingHours"
                    value={landing.contact.workingHours}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, workingHours: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-web3formsAccessKey">Web3Forms access key</Label>
                  <Input
                    id="contact-web3formsAccessKey"
                    value={landing.contact.web3formsAccessKey}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, web3formsAccessKey: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-xUrl">X/Twitter URL</Label>
                  <Input
                    id="contact-xUrl"
                    value={landing.contact.xUrl}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, xUrl: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-githubUrl">GitHub URL</Label>
                  <Input
                    id="contact-githubUrl"
                    value={landing.contact.githubUrl}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, githubUrl: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">Social links</div>
                    <div className="text-xs text-muted-foreground">
                      Add links and toggle visibility.
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => addSocial("contact")}>
                    Add social
                  </Button>
                </div>

                <div className="space-y-3">
                  {landing.contact.socials.map((s, idx) => (
                    <div key={idx} className="grid gap-2 md:grid-cols-12 items-end">
                      <div className="md:col-span-3 space-y-1">
                        <Label>Label</Label>
                        <Input
                          value={s.label}
                          onChange={(e) => updateSocial("contact", idx, { label: e.target.value })}
                          disabled={loading}
                          placeholder="GitHub"
                        />
                      </div>
                      <div className="md:col-span-7 space-y-1">
                        <Label>URL</Label>
                        <Input
                          value={s.url}
                          onChange={(e) => updateSocial("contact", idx, { url: e.target.value })}
                          disabled={loading}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center gap-2">
                        <Toggle
                          pressed={s.visible}
                          onPressedChange={(pressed) =>
                            updateSocial("contact", idx, { visible: Boolean(pressed) })
                          }
                          disabled={loading}
                          variant="outline"
                          size="sm"
                          className="rounded-full w-full"
                          aria-label={`Social link visibility: ${s.visible ? "On" : "Off"}`}
                        >
                          {s.visible ? "On" : "Off"}
                        </Toggle>
                      </div>
                      <div className="md:col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeSocial("contact", idx)}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="footer" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="footer-displayName">Display name</Label>
                  <Input
                    id="footer-displayName"
                    value={landing.footer.displayName}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, displayName: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-subtitle">Subtitle</Label>
                  <Input
                    id="footer-subtitle"
                    value={landing.footer.subtitle}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, subtitle: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="footer-githubUrl">GitHub URL</Label>
                  <Input
                    id="footer-githubUrl"
                    value={landing.footer.githubUrl}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, githubUrl: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-xUrl">X/Twitter URL</Label>
                  <Input
                    id="footer-xUrl"
                    value={landing.footer.xUrl}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, xUrl: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-buyMeCoffeeUrl">BuyMeCoffee URL</Label>
                  <Input
                    id="footer-buyMeCoffeeUrl"
                    value={landing.footer.buyMeCoffeeUrl}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, buyMeCoffeeUrl: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="text-sm font-medium">Show BuyMeCoffee button</div>
                    <div className="text-xs text-muted-foreground">Toggle visibility in the footer.</div>
                  </div>
                  <Switch
                    checked={landing.footer.buyMeCoffeeVisible}
                    onCheckedChange={(v) =>
                      setLanding((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, buyMeCoffeeVisible: Boolean(v) },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-madeWithText">Made-with text</Label>
                  <Input
                    id="footer-madeWithText"
                    value={landing.footer.madeWithText}
                    onChange={(e) =>
                      setLanding((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, madeWithText: e.target.value },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">Social links</div>
                    <div className="text-xs text-muted-foreground">
                      Add links and toggle visibility.
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => addSocial("footer")}>
                    Add social
                  </Button>
                </div>

                <div className="space-y-3">
                  {landing.footer.socials.map((s, idx) => (
                    <div key={idx} className="grid gap-2 md:grid-cols-12 items-end">
                      <div className="md:col-span-3 space-y-1">
                        <Label>Label</Label>
                        <Input
                          value={s.label}
                          onChange={(e) => updateSocial("footer", idx, { label: e.target.value })}
                          disabled={loading}
                          placeholder="GitHub"
                        />
                      </div>
                      <div className="md:col-span-7 space-y-1">
                        <Label>URL</Label>
                        <Input
                          value={s.url}
                          onChange={(e) => updateSocial("footer", idx, { url: e.target.value })}
                          disabled={loading}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center gap-2">
                        <Toggle
                          pressed={s.visible}
                          onPressedChange={(pressed) =>
                            updateSocial("footer", idx, { visible: Boolean(pressed) })
                          }
                          disabled={loading}
                          variant="outline"
                          size="sm"
                          className="rounded-full w-full"
                          aria-label={`Social link visibility: ${s.visible ? "On" : "Off"}`}
                        >
                          {s.visible ? "On" : "Off"}
                        </Toggle>
                      </div>
                      <div className="md:col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeSocial("footer", idx)}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="justify-end">
          <Button onClick={onSave} disabled={loading || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
