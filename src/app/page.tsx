'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useUser } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';
import ResearchDashboard from '@/components/ResearchDashboard';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

function HomeContent() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin');
  const { user, isLoading } = useUser();

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

  const openSignIn = () => {
    setAuthModalView('signin');
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalView('signup');
    setAuthModalOpen(true);
  };

  // Reset scroll position when switching views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showDashboard]);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultView={authModalView}
      />

      {/* Transition Overlay */}
      <div 
        className={`fixed inset-0 bg-[var(--bg-primary)] z-50 pointer-events-none transition-opacity duration-300 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {!showDashboard ? (
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
          <Hero 
            onStart={handleStart} 
            onSignIn={openSignIn}
            onSignUp={openSignUp}
            isAuthenticated={!!user}
          />
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

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
