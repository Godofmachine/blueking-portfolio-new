"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const SkillsSection = () => {
  const [activeTab, setActiveTab] = useState("design");
  
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail === 'design' || event.detail === 'development') {
        setActiveTab(event.detail);
      }
    };

    document.addEventListener('changeTab', handleTabChange as EventListener);
    return () => {
      document.removeEventListener('changeTab', handleTabChange as EventListener);
    };
  }, []);

  const designSkills = [
    { name: "Brand Identity", level: 95, color: "bg-zinc-700" },
    { name: "Typography", level: 90, color: "bg-gray-600" },
    { name: "Illustration", level: 75, color: "bg-zinc-800" },
    { name: "UI Design", level: 60, color: "bg-gray-700" },
    { name: "Motion Graphics", level: 70, color: "bg-zinc-600" }
  ];
  
  const devSkills = [
    { name: "HTML & CSS", level: 95, color: "bg-gray-600" },
    { name: "JavaScript", level: 88, color: "bg-zinc-700" },
    { name: "React", level: 90, color: "bg-gray-700" },
    { name: "TypeScript", level: 78, color: "bg-zinc-800" },
    { name: "Frontend Frameworks", level: 80, color: "bg-gray-600" }
  ];
  
  const tools = [
    { name: "Figma", category: "design" },
    { name: "Photoshop", category: "design" },
    { name: "After Effects", category: "design" },
    { name: "Capcut", category: "design" },
    { name: "Premier Pro", category: "design" },
    { name: "Canva", category: "design" },
    { name: "Photopea", category: "design" },
    { name: "Pinterest", category: "design" },
    { name: "Cursor", category: "dev" },
    { name: "VS Code", category: "dev" },
    { name: "Git", category: "dev" },
    { name: "Copilot", category: "dev" },
    { name: "V0", category: "dev" },
    { name: "Tailwind CSS", category: "dev" },
    { name: "Framer Motion", category: "dev" },
    { name: "Illustrator", category: "design" }
  ];
  
  const filteredTools = tools.filter(tool => {
    if (activeTab === "design") return tool.category === "design" || tool.category === "both";
    if (activeTab === "development") return tool.category === "dev" || tool.category === "both";
    return true;
  });

  return (
    <section id="skills-section" className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50 relative">
            {/* Background decorative elements */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
      
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
          Skills & Expertise
        </h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
          </TabsList>
          
          <TabsContent value="design" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-6 font-display">Design Skills</h3>
                {designSkills.map((skill, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-gray-500">{skill.level}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${skill.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-6 font-display">Tools & Software</h3>
                <div className="flex flex-wrap gap-2">
                  {filteredTools.map((tool, index) => (
                    <div 
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm text-white ${
                        tool.category === "design" ? "bg-zinc-700" : 
                        tool.category === "dev" ? "bg-gray-600" : 
                        "bg-gradient-to-r from-zinc-700 to-gray-600"
                      }`}
                    >
                      {tool.name}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold mb-3">Design Process</h4>
                  <ol className="list-decimal ml-5 space-y-2 text-gray-700">
                    <li>Research & Discovery</li>
                    <li>Concept Development</li>
                    <li>Visual Exploration</li>
                    <li>Refinement & Iteration</li>
                    <li>Finalization & Delivery</li>
                  </ol>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="development" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-6 font-display">Development Skills</h3>
                {devSkills.map((skill, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-gray-500">{skill.level}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${skill.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-6 font-display">Tools & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {filteredTools.map((tool, index) => (
                    <div 
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm text-white ${
                        tool.category === "design" ? "bg-zinc-700" : 
                        tool.category === "dev" ? "bg-gray-600" : 
                        "bg-gradient-to-r from-zinc-700 to-gray-600"
                      }`}
                    >
                      {tool.name}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold mb-3">Development Approach</h4>
                  <ol className="list-decimal ml-5 space-y-2 text-gray-700">
                    <li>Component Architecture Planning</li>
                    <li>Responsive Design Implementation</li>
                    <li>Performance Optimization</li>
                    <li>Testing & Debugging</li>
                    <li>Continuous Improvement</li>
                  </ol>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default SkillsSection;
