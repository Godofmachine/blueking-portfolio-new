'useState'
import React from 'react';
import { Badge } from "./ui/badge";

const ExperienceSection = () => {
  const experiences = [
    {
      period: "2021 - Present",
      title: "Senior Graphic Designer & Frontend Developer",
      company: "CreativeMinds Agency",
      description: "Lead designer and frontend implementer for high-profile brand campaigns. Developed design systems that bridged creative and technical requirements.",
      tags: ["Brand Strategy", "UI Design", "React Development", "Animation"]
    },
    {
      period: "2018 - 2021",
      title: "Visual Designer & Web Developer",
      company: "TechFusion Studio",
      description: "Created visual identity systems and built responsive websites for tech startups. Specialized in translating complex data into accessible visual narratives.",
      tags: ["Visual Design", "Frontend Development", "Interaction Design"]
    },
    {
      period: "2016 - 2018",
      title: "Junior Graphic Designer",
      company: "PrintPlus Media",
      description: "Designed print materials and began transition to digital products. Self-taught frontend development to bring designs to life on the web.",
      tags: ["Print Design", "Digital Illustration", "HTML/CSS"]
    }
  ];

  return (
    <section className="pb-20 px-4 md:px-8 lg:px-16 relative">
      {/* Background decorative elements */}
      {/* <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div> */}
      
      <div className="max-w-5xl mx-auto">
        {/* <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 relative">
          Experience
          <span className="absolute -bottom-3 left-0 w-20 h-1 bg-gradient-to-r from-zinc-600 to-zinc-400"></span>
        </h2> */}
        
        {/* <div className="mt-10 space-y-2">
          {experiences.map((experience, index) => (
            <div key={index} className="timeline-item">
              <span className="inline-block mb-2 text-sm font-semibold text-zinc-400">
                {experience.period}
              </span>
              <h3 className="text-xl font-display font-bold">{experience.title}</h3>
              <p className="text-gray-600 mb-2">{experience.company}</p>
              <p className="text-gray-700 mb-4">{experience.description}</p>
              <div className="flex flex-wrap gap-2">
                {experience.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="outline" className="bg-gray-50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div> */}
        
        <div className="mt-0 md:-mt-8 lg:-mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-zinc-900/60 p-6 rounded-lg shadow-sm border border-transparent dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 font-display">Education</h3>
            <div className="mb-4">
              <div className="font-medium">Senior Secondary School Certificate (SSCE)</div>
              <div className="text-gray-600 dark:text-zinc-300">Oritamefa Baptist Model School</div>
              <div className="text-sm text-gray-500 dark:text-zinc-400">2014 - 2020</div>
            </div>
            <div>
              <div className="font-medium">Bachelor of Laws (LL.B)</div>
              <div className="text-gray-600 dark:text-zinc-300">University of Ibadan</div>
              <div className="text-sm text-gray-500 dark:text-zinc-400">2021-2026</div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-zinc-900/60 p-6 rounded-lg shadow-sm border border-transparent dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 font-display">Languages</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <div>English</div>
                  <div className="text-gray-500 dark:text-zinc-400">Native</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded-full">
                  <div className="bg-zinc-600 h-full rounded-full w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <div>Yoruba</div>
                  <div className="text-gray-500 dark:text-zinc-400">Native</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded-full">
                  <div className="bg-zinc-500 h-full rounded-full w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <div>French</div>
                  <div className="text-gray-500 dark:text-zinc-400">Basic</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded-full">
                  <div className="bg-gray-500 h-full rounded-full w-2/5"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <div>Latin</div>
                  <div className="text-gray-500 dark:text-zinc-400">Beginner</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded-full">
                  <div className="bg-gray-500 h-full rounded-full w-1/5"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <div>American Sign Language</div>
                  <div className="text-gray-500 dark:text-zinc-400">Intermediate</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded-full">
                  <div className="bg-gray-500 h-full rounded-full w-3/5"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-zinc-900/60 p-6 rounded-lg shadow-sm border border-transparent dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 font-display">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {["Theatre", "Football", "Law", "Tech", "Arts", "Religion", "Poetry", "Swimming"].map((interest, index) => (
                <span key={index} className="bg-white dark:bg-zinc-950 px-3 py-1 rounded-full text-sm border border-gray-200 dark:border-zinc-800">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
