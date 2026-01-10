
import React from 'react';
import { Github, Linkedin, Twitter, Coffee, X, Instagram } from 'lucide-react';
import type { LandingSettings } from "@/lib/site/types";

type Props = {
  settings?: LandingSettings;
};

const Footer = ({ settings }: Props) => {
  const currentYear = new Date().getFullYear();
  const footer = settings?.footer;

  const visibleSocials = (footer?.socials && footer.socials.length ? footer.socials : [
    { label: "GitHub", url: footer?.githubUrl ?? "https://github.com/Godofmachine", visible: true },
    { label: "X", url: footer?.xUrl ?? "https://x.com/Blueking_I", visible: true },
  ])
    .filter((s) => s && s.visible && typeof s.url === "string" && s.url.trim());
  
  return (
    <footer className="py-10 px-4 md:px-8 lg:px-16 bg-[#111] text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row text-center md:text-left  justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-display font-bold">{footer?.displayName ?? "Adeniran Samuel"}</div>
            <div className="text-gray-400 text-sm">{footer?.subtitle ?? "Designer & Developer"}</div>
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
            © {currentYear} {footer?.displayName ?? "Adeniran Samuel"}. All rights reserved.
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
              {visibleSocials.map((s) => {
                const label = (s.label || "").toLowerCase();
                const isX = label.includes("x") || label.includes("twitter");
                const isGithub = label.includes("github");

                if (isGithub) {
                  return (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                      aria-label={s.label || "Social"}
                    >
                      <Github size={20} />
                    </a>
                  );
                }

                if (isX) {
                  return (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                      aria-label={s.label || "Social"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50">
                        <path fill="white" d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z"></path>
                      </svg>
                    </a>
                  );
                }

                return (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors px-2 py-1 hover:bg-gray-800 rounded-lg text-sm"
                  >
                    {s.label || "Link"}
                  </a>
                );
              })}
            </div>
            
            {/* Buy Me Coffee Button */}
            {(footer?.buyMeCoffeeVisible ?? true) && (footer?.buyMeCoffeeUrl ?? "").trim() && (
              <a 
                href={footer?.buyMeCoffeeUrl ?? "https://buymeacoffee.com/blueking"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Coffee size={18} />
                Buy me coffee
              </a>
            )}
          </div>
          
          <div className="text-gray-400 text-sm lg:mt-0 mt-4">
            {footer?.madeWithText ?? "Made with 💚 in Nigeria"}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
