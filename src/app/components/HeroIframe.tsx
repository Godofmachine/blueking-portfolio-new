'use client';

import { useEffect, useRef, useState } from 'react';

export default function HeroIframe() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'scrollToDesign') {
        const skillsSection = document.querySelector('#skills-section');
        if (skillsSection) {
          skillsSection.scrollIntoView({ behavior: 'smooth' });
          // Dispatch a custom event to change the tab
          const tabEvent = new CustomEvent('changeTab', { detail: 'design' });
          document.dispatchEvent(tabEvent);
        }
      } else if (event.data === 'scrollToDevelopment') {
        const skillsSection = document.querySelector('#skills-section');
        if (skillsSection) {
          skillsSection.scrollIntoView({ behavior: 'smooth' });
          // Dispatch a custom event to change the tab
          const tabEvent = new CustomEvent('changeTab', { detail: 'development' });
          document.dispatchEvent(tabEvent);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full h-[300px] sm:h-[370px] md:h-[400px] lg:h-[694px] xl:h-[694px] flex justify-center">
      <iframe
        ref={iframeRef}
        src="/static-app/index-simple.html"
        className="w-full h-full border-none"
        scrolling="no"
        title="Hero Iframe"
      />
    </div>
  );
}
