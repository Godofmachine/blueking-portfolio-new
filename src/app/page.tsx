import HeroIframe from './components/HeroIframe'
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import ExperienceSection from './components/ExperienceSection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
export default function Home() {
  return (
    
    <main className='w-full min-h-screen overflow-x-hidden'>
      <Header />
      <HeroIframe />

    <div className=" px-2 lg:px-0">
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
    
    </div> 
    
    <ProjectsSection />
    <ContactSection />
    <Footer />
      
    </main>
  );
}
