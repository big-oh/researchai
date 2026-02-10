'use client';

import { ArrowRight, Sparkles, FileText, Zap, Shield, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroProps {
  onStart: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
  isAuthenticated?: boolean;
}

export default function Hero({ onStart, onSignIn, onSignUp, isAuthenticated }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Gradient Orbs - Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Indigo Orb */}
        <div 
          className={`absolute top-1/4 -left-40 w-[600px] h-[600px] orb orb-indigo animate-pulse-slow transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animationDelay: '0s' }}
        />
        
        {/* Secondary Purple Orb */}
        <div 
          className={`absolute bottom-1/4 -right-40 w-[700px] h-[700px] orb orb-purple animate-pulse-slow transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animationDelay: '2s' }}
        />
        
        {/* Accent Cyan Orb */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] orb orb-cyan animate-pulse-slow transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animationDelay: '1s', opacity: 0.3 }}
        />

        {/* Floating particles effect */}
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-[var(--accent-cyan)] rounded-full animate-float opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-[var(--accent-purple)] rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-[var(--accent-indigo)] rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-indigo)] via-[var(--accent-purple)] to-[var(--accent-pink)]" />
            <div className="absolute inset-[2px] bg-[var(--bg-primary)] rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-95">
              <FileText className="w-5 h-5 text-[var(--accent-indigo)]" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Research<span className="text-[var(--accent-indigo)]">AI</span>
          </span>
        </div>
        
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="nav-link text-sm">Features</a>
          <a href="#pricing" className="nav-link text-sm">Pricing</a>
          <a href="#" className="nav-link text-sm">Docs</a>
          
          {isAuthenticated ? (
            <button 
              onClick={onStart}
              className="btn btn-secondary text-sm py-2.5 px-5"
            >
              Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={onSignIn}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onSignUp}
                className="btn btn-secondary text-sm py-2.5 px-5"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-6 lg:px-12 pt-20 lg:pt-28 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full badge-indigo mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Powered by Gemini 2.5 Pro</span>
          </div>

          {/* Main Headline - Golden Ratio Typography */}
          <h1 
            className={`font-bold tracking-tight mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.236rem)', lineHeight: 1.1 }}
          >
            <span className="text-[var(--text-primary)] block">Generate</span>
            <span className="text-gradient block mt-2">Research Papers</span>
            <span className="text-[var(--text-secondary)] font-light block mt-2">in Minutes</span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`text-lg md:text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Transform any research topic into a publication-ready IEEE paper with AI. 
            Complete with proper citations, methodology, and academic structure.
          </p>

          {/* CTAs */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <button 
              onClick={onStart}
              className="btn btn-primary group text-base py-4 px-8"
            >
              <span>Start Generating</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={scrollToFeatures}
              className="btn btn-ghost group"
            >
              <Zap className="w-5 h-5 text-[var(--accent-amber)]" />
              <span>View Features</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div 
            className={`grid grid-cols-3 gap-4 max-w-xl mx-auto mb-24 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="surface-glass p-6 rounded-2xl">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">10K+</div>
              <div className="text-[var(--text-tertiary)] text-sm">Papers Generated</div>
            </div>
            <div className="surface-glass p-6 rounded-2xl">
              <div className="text-3xl md:text-4xl font-bold text-gradient-cyan mb-1">98%</div>
              <div className="text-[var(--text-tertiary)] text-sm">IEEE Compliant</div>
            </div>
            <div className="surface-glass p-6 rounded-2xl">
              <div className="text-3xl md:text-4xl font-bold text-gradient-amber mb-1">&lt;2m</div>
              <div className="text-[var(--text-tertiary)] text-sm">Avg. Time</div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div 
            className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="text-[var(--text-tertiary)] text-sm mb-8 uppercase tracking-widest">Trusted by researchers at</p>
            <div className="flex items-center justify-center gap-12 md:gap-16 opacity-50">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <Shield className="w-5 h-5" />
                <span className="font-semibold tracking-tight">Stanford</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <Zap className="w-5 h-5" />
                <span className="font-semibold tracking-tight">MIT</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <FileText className="w-5 h-5" />
                <span className="font-semibold tracking-tight">IEEE</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold tracking-tight">Oxford</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        <button 
          onClick={scrollToFeatures}
          className="flex flex-col items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
