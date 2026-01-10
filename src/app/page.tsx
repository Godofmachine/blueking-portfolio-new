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

export default async function Home() {
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
