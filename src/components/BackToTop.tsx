'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export const BackToTop = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center group hover:scale-110 transition-transform duration-200"
          style={{
            background: `conic-gradient(#6B7280 ${scrollProgress}%, transparent ${scrollProgress}%)`,
          }}
        >
          <div className="w-10 h-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
            <ChevronUp className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}; 