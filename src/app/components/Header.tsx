"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const cartItemCount = 0; // Static cart count

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    // Update header height on window resize
    const handleResize = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          // Only show scroll header after original header is out of view
          if (currentScrollY < headerHeight) {
            setShowHeader(true);
            setIsScrolled(false);
          } else {
            setIsScrolled(true);
            if (currentScrollY < lastScrollY.current) {
              setShowHeader(true);
            } else if (currentScrollY > lastScrollY.current) {
              setShowHeader(false);
            }
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerHeight]);

  const renderCartButton = () => (
    <Link href="/store/cart" className="w-12 h-12 rounded-full border border-green-950/20 hidden sm:flex items-center justify-center relative mr-2 xl:mr-8">
      <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.25 11.75V17C13.25 17.2031 13.1758 17.3789 13.0273 17.5273C12.8789 17.6758 12.7031 17.75 12.5 17.75C12.2969 17.75 12.1211 17.6758 11.9727 17.5273C11.8242 17.3789 11.75 17.2031 11.75 17V11.75C11.75 11.5469 11.8242 11.3711 11.9727 11.2227C12.1211 11.0742 12.2969 11 12.5 11C12.7031 11 12.8789 11.0742 13.0273 11.2227C13.1758 11.3711 13.25 11.5469 13.25 11.75ZM22.9766 9.6875L21.6875 19.4375C21.6406 19.8125 21.4766 20.125 21.1953 20.375C20.9141 20.625 20.5859 20.75 20.2109 20.75H4.78906C4.41406 20.75 4.08594 20.625 3.80469 20.375C3.52344 20.125 3.35938 19.8203 3.3125 19.4609V19.4375L2.02344 9.6875C2.00781 9.67188 2 9.64453 2 9.60547C2 9.56641 2 9.53125 2 9.5C2 9.07812 2.14453 8.72266 2.43359 8.43359C2.72266 8.14453 3.07812 8 3.5 8H6.89844L11.9375 2.25781C12 2.17969 12.082 2.11719 12.1836 2.07031C12.2852 2.02344 12.3906 2 12.5 2C12.6094 2 12.7148 2.02344 12.8164 2.07031C12.918 2.11719 13 2.17969 13.0625 2.25781L18.1016 8H21.5C21.9062 8 22.2578 8.14844 22.5547 8.44531C22.8516 8.74219 23 9.09375 23 9.5C23 9.53125 23 9.56641 23 9.60547C23 9.64453 22.9922 9.67969 22.9766 9.71094V9.6875ZM8.91406 8H16.0859L12.5 3.89844L8.91406 8ZM21.5 9.5H3.5L4.78906 19.25H20.2109L21.5 9.5ZM16.6953 11.6797L16.1797 16.9297C16.1797 16.9453 16.1797 16.957 16.1797 16.9648C16.1797 16.9727 16.1797 16.9844 16.1797 17C16.1797 17.2031 16.2422 17.375 16.3672 17.5156C16.4922 17.6562 16.6484 17.7344 16.8359 17.75H16.8594C16.8594 17.75 16.8633 17.75 16.8711 17.75C16.8789 17.75 16.8828 17.75 16.8828 17.75C16.8984 17.75 16.9062 17.75 16.9297 17.75C17.1172 17.75 17.2812 17.6836 17.4219 17.5508C17.5625 17.418 17.6484 17.2578 17.6797 17.0703L18.1953 11.8203C18.1953 11.8047 18.1953 11.793 18.1953 11.7852C18.1953 11.7773 18.1953 11.7656 18.1953 11.75C18.1953 11.5469 18.1211 11.3711 17.9727 11.2227C17.8242 11.0742 17.6484 11 17.4453 11C17.2578 11 17.0938 11.0664 16.9531 11.1992C16.8125 11.332 16.7266 11.4922 16.6953 11.6797ZM8.30469 11.6797C8.27344 11.4922 8.1875 11.332 8.04688 11.1992C7.90625 11.0664 7.74219 11 7.55469 11C7.35156 11 7.17578 11.0742 7.02734 11.2227C6.87891 11.3711 6.80469 11.5469 6.80469 11.75C6.80469 11.7656 6.80469 11.7812 6.80469 11.7969C6.80469 11.8125 6.80469 11.8203 6.80469 11.8203L7.32031 17.0703C7.35156 17.2578 7.4375 17.418 7.57812 17.5508C7.71875 17.6836 7.88281 17.75 8.07031 17.75C8.08594 17.75 8.09766 17.75 8.10547 17.75C8.11328 17.75 8.11719 17.75 8.11719 17.75C8.11719 17.75 8.12109 17.75 8.12891 17.75C8.13672 17.75 8.14844 17.75 8.16406 17.75C8.35156 17.7344 8.50781 17.6562 8.63281 17.5156C8.75781 17.375 8.82031 17.2031 8.82031 17C8.82031 16.9844 8.82031 16.9727 8.82031 16.9648C8.82031 16.957 8.82031 16.9453 8.82031 16.9297L8.30469 11.6797Z" fill="#0D401C"/>
      </svg>
      {cartItemCount > 0 && (
        <div className="w-6 h-6 absolute -top-2 -right-2 bg-amber-400 rounded-full flex items-center justify-center">
          <span className="text-center text-neutral-800 text-sm font-bold">{cartItemCount}</span>
        </div>
      )}
    </Link>
  );

  const renderActionButtons = () => (
    <div className="flex items-center z-[300] mr-4 w-full xl:w-auto">
      {/* Download Resume Button */}
      <div className="flex items-center group max-xl:ml-auto mr-2 md:mr-8">
        <a 
          href="/resume.pdf" 
          download
          className="flex items-center relative overflow-hidden bg-white/10 hover:bg-white/20 duration-300 ease-out translate-all rounded-full pl-4 lg:pl-6 pr-2 py-2"
        >
          <div className="text-white text-sm sm:text-base font-medium pl-2 lg:pl-4 pr-4 lg:pr-8 relative z-10">Download Resume</div>
          <div className="ml-auto rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center relative z-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-6 sm:h-6">
              <path d="M12 16L12 8M12 16L8 12M12 16L16 12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </a>
      </div>
    </div>
  );

  const renderMobileMenuButton = () => (
    <button 
      className="xl:hidden w-10 h-10 flex items-center justify-center z-[950] ml-auto me-4"
      onClick={() => setMobileMenuOpen(true)}
      aria-label="Open mobile menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  const renderHeaderContent = () => (
    <div className="mx-auto px-4 md:pl-6 md:pr-2 lg:pl-8 lg:pr-4 xl:pl-14 xl:pr-3 2xl:px-24 py-4 flex justify-between items-center relative">
      {/* Logo */}
      <div className="items-center flex justify-start z-[300]">
        <div className="lg:py-2 w-full flex">
          <Link href="/" className="text-white text-2xl font-bold">Portfolio</Link>
          {/* Desktop Navigation */}
          <div className={`xl:flex ${mobileMenuOpen ? 'hidden' : 'hidden'} flex-col xl:flex-row items-center text-nowrap space-y-4 lg:space-y-0 space-x-2 xl:space-x-8 w-full ms-5 2xl:ms-24 lg:w-auto mt-4 lg:mt-0`}>
            <Link href="/" className="text-white text-md xl:text-lg font-medium hover:text-gray-300">Home</Link>
            <Link href="/about" className="text-white text-md xl:text-lg font-medium hover:text-gray-300">About</Link>
            <Link href="/projects" className="text-white text-md xl:text-lg font-medium hover:text-gray-300">Projects</Link>
            <Link href="/skills" className="text-white text-md xl:text-lg font-medium hover:text-gray-300">Skills</Link>
            <Link href="/contact" className="text-white text-md xl:text-lg font-medium hover:text-gray-300">Contact</Link>
          </div>
        </div>
      </div>
      {/* Action buttons */}
      {renderActionButtons()}
      {/* Mobile menu button */}
      {renderMobileMenuButton()}
    </div>
  );

  return (
    <>
      <div ref={headerRef} className="w-full relative bg-[#111]">
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-[10000] flex"
            onClick={() => setMobileMenuOpen(false)}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 z-[10000]" />
            {/* Drawer */}
            <div
              className="relative w-2/3 h-full bg-[#111] z-[10000] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Mobile menu header with logo and close button */}
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <div className="py-2">
                  <Link href="/" className="text-white text-2xl font-bold">Portfolio</Link>
                </div>
                <button 
                  className="rounded-md p-2 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile menu items */}
              <div className="flex-1 overflow-y-auto">
                <nav className="py-2">
                  <div className="border-b border-gray-800" key="home">
                    <div className="flex justify-between items-center px-6 py-4">
                      <Link href="/" className="text-white text-lg font-medium">Home</Link>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-800" key="about">
                    <div className="flex justify-between items-center px-6 py-4">
                      <Link href="/about" className="text-white text-lg font-medium">About</Link>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-800" key="projects">
                    <div className="flex justify-between items-center px-6 py-4">
                      <Link href="/projects" className="text-white text-lg font-medium">Projects</Link>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-800" key="skills">
                    <div className="flex justify-between items-center px-6 py-4">
                      <Link href="/skills" className="text-white text-lg font-medium">Skills</Link>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-800" key="contact">
                    <div className="px-6 py-4">
                      <Link href="/contact" className="text-white text-lg font-medium">Contact</Link>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Navigation */}
        <div className="w-full bg-[#111] opacity-100 relative">
          {renderHeaderContent()}
        </div>
      </div>

      {/* Scrolled header */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            key="scroll-header"
            initial={{ y: '-100%', opacity: 0 }}
            animate={showHeader ? { y: 0, opacity: 1 } : { y: '-100%', opacity: 0 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full fixed top-0 left-0 right-0 z-[900] bg-[#111]"
            style={{ willChange: 'transform, opacity' }}
          >
            {renderHeaderContent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal UI */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl relative w-full max-w-2xl mx-4">
            {/* Search Header */}
            <div className="p-4 border-b">
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Search for products, blog posts, or services..."
                  className="w-full px-4 py-3 pl-12 text-gray-900 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#278d45]"
                />
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#278d45]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#278d45]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Tabs */}
            <div className="flex border-b">
              <button className="flex-1 py-3 text-sm font-medium text-[#278d45] border-b-2 border-[#278d45]">
                All
              </button>
              <button className="flex-1 py-3 text-sm font-medium text-gray-500">
                Products
              </button>
              <button className="flex-1 py-3 text-sm font-medium text-gray-500">
                Blog
              </button>
              <button className="flex-1 py-3 text-sm font-medium text-gray-500">
                Services
              </button>
            </div>

            {/* Search Content */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {/* Recent Searches */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Searches</h3>
                <div className="space-y-2">
                  <button className="flex items-center w-full p-2 hover:bg-gray-50 rounded-lg">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-14 0 9 9 0 0114 0z" />
                    </svg>
                    <span className="text-gray-700">organic feed</span>
                  </button>
                  <button className="flex items-center w-full p-2 hover:bg-gray-50 rounded-lg">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-14 0 9 9 0 0114 0z" />
                    </svg>
                    <span className="text-gray-700">livestock care</span>
                  </button>
                </div>
              </div>

              {/* Popular Searches */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">
                    Animal Feed
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">
                    Veterinary Services
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">
                    Farm Equipment
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">
                    Livestock Care
                  </button>
                </div>
              </div>

              {/* Search Tips */}
              <div className="mt-6 text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Tips</h3>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Search for products by name, brand, or category</li>
                  <li>• Find blog posts about farming and livestock</li>
                  <li>• Discover our services and expertise</li>
                  <li>• Use specific keywords for better results</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;