'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Palette, Code, Heart, ArrowLeft, ArrowRight, X, ImageIcon, Share2, Play, Video, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useToast } from "../hooks/use-toast";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "../components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerHeader, DrawerClose } from "../components/ui/drawer";
import BookingModal from './BookingModal';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    picflow?: boolean;
  }
}

interface Project {
  id: number;
  title: string;
  description: string;
  type: 'design' | 'development' | 'motion';
  image: string;
  aspectRatio?: number;
  videoUrl?: string;
  links: {
    live?: string;
    github?: string;
    behance?: string;
  };
  skills: string[];
}

const devProjects: Project[] = [
  {
    id: 1,
    title: "Weather Dashboard App",
    description: "Interactive weather application built with React and TailwindCSS, featuring location detection, 7-day forecasts, and interactive charts.",
    type: "development",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1965",
    links: {
      live: "#",
      github: "#"
    },
    skills: ["React", "TailwindCSS", "API Integration", "Responsive Design"]
  },
  {
    id: 2,
    title: "Photography Portfolio",
    description: "End-to-end development of a photography portfolio website with custom animations and a dynamic gallery system.",
    type: "development",
    image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?q=80&w=2036",
    links: {
      live: "#",
      github: "#"
    },
    skills: ["React", "Framer Motion", "CSS Grid", "TypeScript"]
  },
  {
    id: 3,
    title: "Task Management App",
    description: "Full-stack task management application with authentication, real-time updates, and drag-and-drop functionality.",
    type: "development",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072",
    links: {
      live: "#",
      github: "#"
    },
    skills: ["Next.js", "MongoDB", "Socket.io", "Tailwind"]
  },
  {
    id: 4,
    title: "E-commerce Platform",
    description: "Responsive e-commerce platform with product filtering, user authentication, and payment integration.",
    type: "development",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070",
    links: {
      live: "#",
      github: "#"
    },
    skills: ["React", "Redux", "Node.js", "Stripe API"]
  }
];

const motionProjects: Project[] = [
  {
    id: 5,
    title: "Brand Animation Showcase",
    description: "Dynamic brand animation featuring logo reveals, kinetic typography, and smooth transitions for corporate identity.",
    type: "motion",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=2039",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    links: {
      behance: "#"
    },
    skills: ["After Effects", "Cinema 4D", "Motion Graphics", "Brand Design"]
  },
  {
    id: 6,
    title: "Product Demo Video",
    description: "Engaging product demonstration with 3D elements, animated infographics, and compelling visual storytelling.",
    type: "motion",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    links: {
      behance: "#"
    },
    skills: ["After Effects", "Illustrator", "3D Animation", "Video Editing"]
  },
  {
    id: 7,
    title: "Social Media Campaign",
    description: "Series of animated social media content with vibrant colors, dynamic transitions, and engaging micro-interactions.",
    type: "motion",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2074",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    links: {
      behance: "#"
    },
    skills: ["After Effects", "Premiere Pro", "Social Media", "Animation"]
  },
  {
    id: 8,
    title: "Title Sequence Design",
    description: "Cinematic title sequence with custom typography, particle effects, and atmospheric mood setting.",
    type: "motion",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2062",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    links: {
      behance: "#"
    },
    skills: ["After Effects", "Typography", "VFX", "Sound Design"]
  }
];

const ProjectsSection = () => {
  const [activeTab, setActiveTab] = useState("development");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingServiceType, setBookingServiceType] = useState<'development' | 'design' | 'motion'>('development');
  const { toast } = useToast();

  // Load Picflow script when component mounts
  useEffect(() => {
    if (!window.picflow) {
      window.picflow = true;
      const script = document.createElement("script");
      script.src = "https://picflow.com/embed/main.js";
      script.type = 'module';
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleBookingClick = (serviceType: 'development' | 'design' | 'motion') => {
    setBookingServiceType(serviceType);
    setShowBookingModal(true);
  };

  return (
    <section id="projects" className="py-20 px-4 md:px-8 lg:px-16 bg-zinc-50">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900">Featured Projects</h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            A curated selection of my work across development, design, and motion graphics.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <Tabs defaultValue="development" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mx-auto flex justify-center mb-8 bg-white/80 backdrop-blur-sm p-1 rounded-full border border-zinc-200">
              <TabsTrigger value="development" className="rounded-full px-6 py-2 text-sm">
                <Code size={16} className="mr-1" /> Development
              </TabsTrigger>
              <TabsTrigger value="design" className="rounded-full px-6 py-2 text-sm">
                <Palette size={16} className="mr-1" /> Graphic Design
              </TabsTrigger>
              <TabsTrigger value="motion" className="rounded-full px-6 py-2 text-sm">
                <Video size={16} className="mr-1" /> Motion Graphics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="development" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {devProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
              <div className="mt-12 flex justify-center gap-4">
                <Button 
                  asChild
                  size="lg" 
                  className="bg-zinc-900 hover:bg-zinc-800 text-white transition-colors duration-300 rounded-full"
                >
                  <a href="https://github.com/godofmachine" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Github size={18} /> More on GitHub
                  </a>
                </Button>
                <Button 
                  onClick={() => handleBookingClick('development')}
                  size="lg" 
                  variant="outline"
                  className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors duration-300 rounded-full"
                >
                  <Calendar size={18} className="mr-2" /> Book a Website
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="design" className="mt-0">
              <div className="w-full">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: '<picflow-gallery id="gal_EwjXPV83q3pwE7IH" tenant="tnt_eOQXtPAY9eXBv3wc" lightbox="#000000E6" no-background="true"></picflow-gallery>'
                  }}
                />
              </div>
              
              <div className="mt-12 flex justify-center gap-4">
                <Button 
                  asChild
                  size="lg"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white transition-colors duration-300 rounded-full"
                >
                  <a href="https://blueking.picflow.com/m375ochixm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <ImageIcon size={18} className="mr-2" /> View Full Gallery
                  </a>
                </Button>
                <Button 
                  onClick={() => handleBookingClick('design')}
                  size="lg" 
                  variant="outline"
                  className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors duration-300 rounded-full"
                >
                  <Calendar size={18} className="mr-2" /> Book Graphic Design
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="motion" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {motionProjects.map((project, index) => (
                  <MotionProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
              <div className="mt-12 flex justify-center gap-4">
                <Button 
                  asChild
                  size="lg"
                  className="bg-zinc-900 hover:bg-zinc-800 transition-colors duration-300 text-white rounded-full"
                >
                  <a href="https://behance.net/yourusername" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Video size={18} /> View Full Motion Gallery
                  </a>
                </Button>
                <Button 
                  onClick={() => handleBookingClick('motion')}
                  size="lg" 
                  variant="outline"
                  className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors duration-300 rounded-full"
                >
                  <Calendar size={18} className="mr-2" /> Book Motion Graphics
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Booking Modal */}
        <BookingModal 
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          serviceType={bookingServiceType}
        />
      </div>
    </section>
  );
};

const ProjectCard = ({ project, index }: { project: Project, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
    >
      <div className="h-56 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-zinc-900">{project.title}</h3>
        <p className="text-zinc-600 mb-4">{project.description}</p>
        
        <div className="mb-4 flex flex-wrap gap-1">
          {project.skills.map((skill, i) => (
            <Badge 
              key={i} 
              variant="outline"
              className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 border-zinc-200"
            >
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          {project.links.live && (
            <a 
              href={project.links.live} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 text-sm"
            >
              <ExternalLink size={14} /> Live Site
            </a>
          )}
          {project.links.github && (
            <a 
              href={project.links.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 text-sm"
            >
              <Github size={14} /> GitHub
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MotionProjectCard = ({ project, index }: { project: Project, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
    >
      <Dialog>
        <DialogTrigger asChild>
          <div className="h-56 overflow-hidden cursor-pointer relative">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 rounded-full p-4">
                <Play size={24} className="text-zinc-900" />
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogTitle className="sr-only">Video Preview</DialogTitle>
          <div className="aspect-video">
            <video 
              src={project.videoUrl} 
              controls 
              autoPlay 
              className="w-full h-full rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-zinc-900">{project.title}</h3>
        <p className="text-zinc-600 mb-4">{project.description}</p>
        
        <div className="mb-4 flex flex-wrap gap-1">
          {project.skills.map((skill, i) => (
            <Badge 
              key={i} 
              variant="outline"
              className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 border-zinc-200"
            >
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          {project.links.behance && (
            <a 
              href={project.links.behance} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 text-sm"
            >
              <ExternalLink size={14} /> Behance
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectsSection;
