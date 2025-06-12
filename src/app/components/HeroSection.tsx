'use client'

import React from 'react';
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const { toast } = useToast();
  
  const handleHello = () => {
    toast({
      title: "👋 Hello there!",
      description: "Thanks for stopping by my portfolio!",
    });
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
      
      {/* Hero content */}
      <div className="relative z-10 text-center max-w-5xl px-4  animate-[fadeIn_0.5s_ease-in_forwards]" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-4xl md:text-7xl font-bold mb-6">
          <span className="block">Hi, I'm </span>
          <span className="bg-gradient-to-r from-gray-950 to-gray-800 bg-clip-text text-transparent text-5xl md:text-8xl">Blueking</span>
        </h1>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-3 mb-8">
          <div className="relative px-6 py-3 text-xl md:text-2xl border-r-0 md:border-r-2 border-purple-500/30">
            Graphic Designer
            <div className="hidden md:block absolute h-4 w-4 bg-gray-800 rounded-full -right-[9px] top-1/2 transform -translate-y-1/2"></div>
          </div>
          <div className="px-6 py-3 text-xl md:text-2xl">
            Frontend Developer
          </div>
        </div>
        
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-10">
          I craft visually stunning designs and bring them to life with clean, efficient code. The perfect blend of creativity and technical expertise.
        </p>
        
        <button 
          onClick={handleHello}
          className="group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white transition-all duration-300 ease-in-out bg-gray-900 rounded-lg hover:bg-zinc-900 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2"
        >
          <span className="relative">Say Hello</span>
          <span className="absolute right-4 transition-transform duration-300 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">👋</span>
        </button>
      </div>
      
      {/* Creative code element */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 font-mono text-xs text-gray-500 opacity-50 select-none">
        &lt; crafting_digital_experiences <span className="animate-pulse">/</span> &gt;
      </div>
    </section>
  );
};

export default HeroSection;
