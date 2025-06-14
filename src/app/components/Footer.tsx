
import React from 'react';
import { Github, Linkedin, Twitter, Coffee, X, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-10 px-4 md:px-8 lg:px-16 bg-[#111] text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row text-center md:text-left  justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-display font-bold">Adeniran Samuel</div>
            <div className="text-gray-400 text-sm">Designer & Developer</div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a>
            <a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a>
            <a href="#projects" className="text-gray-400 hover:text-white transition-colors">Projects</a>
            <a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="h-px bg-gray-800 my-8"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 text-sm">
            © {currentYear} Adeniran Samuel. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              {/* <a 
                href="https://github.com/godofmachine" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="GitHub"
              >
                <Instagram size={20} />
              </a> */}
              {/* <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a> */}
              <a 
                href="https://github.com/Godofmachine" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="Github"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://x.com/Blueking_I" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="Twitter"
              >
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50">
              <path fill="white" d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z"></path>
              </svg>              </a>
            </div>
            
            {/* Buy Me Coffee Button */}
            <a 
              href="https://buymeacoffee.com/blueking" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Coffee size={18} />
              Buy me coffee
            </a>
          </div>
          
          <div className="text-gray-400 text-sm lg:mt-0 mt-4">
            Made with 💚 in Nigeria
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
