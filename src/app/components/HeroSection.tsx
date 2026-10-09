'use client'

import React from 'react';
import { useToast } from "@/hooks/use-toast";
import type { LandingSettings } from "@/lib/site/types";

type Props = {
  settings?: LandingSettings;
};

const HeroSection = ({ settings }: Props) => {
  const { toast } = useToast();

  const hero = settings?.hero;
  
  const handleHello = () => {
    toast({
      title: hero?.ctaToastTitle ?? "👋 Hello there!",
      description: hero?.ctaToastDescription ?? "Thanks for stopping by my portfolio!",
    });
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6">
      {/* Background decorative elements */}
      <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-40 sm:w-64 h-40 sm:h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-60 sm:w-80 h-60 sm:h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      {/* Hero content */}
      <div className="relative z-10 text-center max-w-5xl px-2 sm:px-4 animate-[fadeIn_0.5s_ease-in_forwards]" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold mb-4 sm:mb-6">
          <span className="block">Hi, I'm </span>
          <span className="bg-gradient-to-r from-gray-950 to-gray-800 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent text-4xl sm:text-5xl md:text-8xl">{hero?.name ?? "Blueking"}</span>
        </h1>
        
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="px-4 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-lg md:text-xl rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium shadow-sm">
            {hero?.roles?.[0] ?? "Graphic Designer"}
          </div>
          <span className="text-zinc-400 hidden sm:inline">•</span>
          <div className="px-4 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-lg md:text-xl rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium shadow-sm">
            {hero?.roles?.[1] ?? "Frontend Developer"}
          </div>
        </div>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-zinc-300 max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
          {hero?.tagline ?? "I craft visually stunning designs and bring them to life with clean, efficient code. The perfect blend of creativity and technical expertise."}
        </p>
        
        <button 
          onClick={handleHello}
          className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 font-medium text-white transition-all duration-300 ease-in-out hover:bg-gray-900 rounded-lg bg-zinc-900 active:scale-95 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 shadow-md"
        >
          <span className="relative">{hero?.ctaLabel ?? "Say Hello"}</span>
          <span className="absolute right-4 transition-transform duration-300 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">👋</span>
        </button>
      </div>
      
      {/* Creative code element */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 font-mono text-[10px] sm:text-xs text-gray-500 opacity-50 select-none">
        &lt; crafting_digital_experiences <span className="animate-pulse">/</span> &gt;
      </div>
    </section>
  );
};

export default HeroSection;
