import React from 'react';
import { Separator } from "../components/ui/separator";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 md:px-8 lg:px-16 relative overflow-hidden">
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
              <div className="absolute -bottom-4 -right-4 w-24 h-24 blob bg-yellow-400 opacity-75 animate-bounce"></div>
            </div>
            
            <h3 className="text-xl font-bold font-display mb-1">Adeniran Samuel</h3>
            <p className="text-gray-600 mb-4">Based in Ibadan, NGA</p>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Experience</div>
                <div className="text-lg font-semibold">4+ Years</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Projects</div>
                <div className="text-lg font-semibold">120+</div>
              </div>
            </div>
          </div>
          
          {/* Right side with content */}
          <div className="md:col-span-3">
            <p className="text-lg mb-6">
              I blend visual design with technical implementation to create meaningful digital experiences. With a background in traditional graphic design and a passion for frontend development, I inhabit the sweet spot between aesthetics and functionality.
            </p>
            
            <p className="text-lg mb-6">
              My journey began in print design, evolved through brand identity, and flourished in the digital realm. Today, I enjoy the challenge of not just designing interfaces but also implementing them with clean, efficient code.
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
