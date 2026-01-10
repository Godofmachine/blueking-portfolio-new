import { redirect } from "next/navigation";

import HeroIframe from './components/HeroIframe'
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import ExperienceSection from './components/ExperienceSection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

import { fetchProjectsByCategory } from '@/lib/projects/public';
import { getLandingSettings } from '@/lib/site/settings';

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function Home({ searchParams }: PageProps) {
  const hasAuthParams =
    typeof searchParams?.code === "string" ||
    typeof searchParams?.error === "string";

  // If an auth provider lands on /?code=..., forward to our Supabase callback route.
  if (hasAuthParams) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (typeof value === "string") params.set(key, value);
      else if (Array.isArray(value) && typeof value[0] === "string") {
        params.set(key, value[0]);
      }
    }
    redirect(`/auth/callback?${params.toString()}`);
  }

  const landingSettings = await getLandingSettings();

  return (
    
    <main className='w-full min-h-screen overflow-x-hidden'>
      <Header settings={landingSettings} />
      <HeroIframe />

    <div className=" px-2 lg:px-0">
      <HeroSection settings={landingSettings} />
      <AboutSection settings={landingSettings} />
      <SkillsSection />
      <ExperienceSection />
    
    </div> 
    
    <ProjectsSection
      mode="featured"
      projects={await fetchProjectsByCategory({
        featuredOnly: true,
        featuredLimitPerCategory: 4,
      })}
    />
    <ContactSection settings={landingSettings} />
    <Footer settings={landingSettings} />
      
    </main>
  );
}
