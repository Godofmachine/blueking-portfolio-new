import React from 'react';
import { Separator } from "../components/ui/separator";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 md:px-8 lg:px-16 relative overflow-hidden">
      {/* Background decorative elements */}
      {/* <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div> */}
      
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 relative">
          About Me
          <span className="absolute -bottom-3 left-0 w-20 h-1 bg-gradient-to-r from-gray-800 to-zinc-500"></span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Left side with profile */}
          <div className="md:col-span-2 flex flex-col items-center md:items-start">
            <div className="relative mb-6">
              <div className="w-56 h-56 blob  bg-gradient-to-br from-gray-800 to-zinc-500 p-1">
                <div className="w-full h-full blob bg-white flex items-center justify-center overflow-hidden">
                  <img src="/Oba.jpg" className='object-contain' alt="AS" />
                  {/* <div className="font-mono text-4xl text-zinc-950 font-semibold">AS</div> */}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 blob bg-yellow-400 opacity-75 animate-bounce "></div>
            </div>
            
            <h3 className="text-xl font-bold font-display mb-1">Adeniran Samuel</h3>
            <p className="text-gray-600 mb-4">Based in Ibadan, NGA</p>
            
            <div className="grid grid-cols-2 items-center gap-4 w-full">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Experience</div>
                <div className="text-lg font-semibold">4+ Years</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Projects</div>
                <div className="text-lg font-semibold">120+</div>
              </div>
              <div className="flex col-span-2 w-full">
              <a
                href="/My Resume.pdf"
                download
                className="flex items-center justify-center text-center text-xl w-full px-6 py-6 rounded-lg bg-gradient-to-r from-gray-800 to-zinc-500 text-white font-medium hover:from-gray-700 hover:to-zinc-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Resume
              </a>
            </div>
            </div>
          </div>
          
          {/* Right side with content */}
          <div className="md:col-span-3 px-2 lg:px-0">
            <p className="text-md lg:text-lg mb-6">
              Hi, I’m Blueking — I’m a graphic designer and front-end developer with a love for clean visuals and clean code.My journey began in print design, grew through branding, and now thrives in the digital space—where I combine visual creativity with technical skill to craft engaging digital experiences.            </p>
            
            <p className="text-md lg:text-lg mb-6">
            Outside of design and code, I’m also studying law—drawn to the structure, logic, and impact it has on the real world. And when I’m not in front of a screen or buried in law texts, you’ll find me immersed in dramatic arts or football with full passion.            </p>
            <p className="text-md lg:text-lg mb-6">
            I build with intention—whether it’s an interface, a brand, or a future.
            </p>
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-display font-semibold text-lg mb-3">Design Philosophy</h4>
                <p className="text-gray-700">
                  I believe that great design solves problems while delighting users. My work balances bold creative choices with usability and purpose.
                </p>
              </div>
              
              <div>
                <h4 className="font-display font-semibold text-lg mb-3">Technical Approach</h4>
                <p className="text-gray-700">
                  Writing clean, maintainable code is as important as the visuals. I craft frontend experiences that are not just beautiful, but performant and accessible.
                </p>
              </div>
            </div>

           
          </div>
           
        </div>
        
      </div>
      
    </section>
  );
};

export default AboutSection;
