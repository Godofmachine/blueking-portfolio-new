'use client';

import { useEffect, useRef, useState } from 'react';

export default function HeroIframe() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  

  return (
    <div className="w-full xl:h-[694px] flex justify-center">
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
