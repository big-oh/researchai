'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import ResearchDashboard from '@/components/ResearchDashboard';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowDashboard(true);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowDashboard(false);
      setIsTransitioning(false);
    }, 300);
  };

  // Reset scroll position when switching views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showDashboard]);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Transition Overlay */}
      <div 
        className={`fixed inset-0 bg-[var(--bg-primary)] z-50 pointer-events-none transition-opacity duration-300 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {!showDashboard ? (
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
          <Hero onStart={handleStart} />
          <Features />
          <Pricing />
          <Footer />
        </div>
      ) : (
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'}`}>
          <ResearchDashboard onBack={handleBack} />
        </div>
      )}
    </main>
  );
}
