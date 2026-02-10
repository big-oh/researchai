'use client';

import { Zap, Shield, Clock, FileCheck, Globe, Sparkles, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Generation',
    description: 'Leverage advanced Gemini 2.5 Pro to generate comprehensive research papers in minutes, not days.',
    gradient: 'from-[var(--accent-indigo)] to-[var(--accent-purple)]',
    iconColor: 'text-[var(--accent-indigo-light)]',
    bgColor: 'bg-[var(--accent-indigo)]/10',
  },
  {
    icon: FileCheck,
    title: 'IEEE Compliant',
    description: 'Every paper follows IEEE formatting standards with proper structure, citations, and academic tone.',
    gradient: 'from-[var(--accent-purple)] to-[var(--accent-pink)]',
    iconColor: 'text-[var(--accent-purple-light)]',
    bgColor: 'bg-[var(--accent-purple)]/10',
  },
  {
    icon: Clock,
    title: 'Lightning Fast',
    description: 'Generate publication-ready papers in under 2 minutes. Save weeks of research and writing time.',
    gradient: 'from-[var(--accent-cyan)] to-[var(--accent-indigo)]',
    iconColor: 'text-[var(--accent-cyan-light)]',
    bgColor: 'bg-[var(--accent-cyan)]/10',
  },
  {
    icon: Shield,
    title: 'Academic Quality',
    description: 'Rigorous methodology sections, comprehensive literature reviews, and properly cited references.',
    gradient: 'from-[var(--accent-amber)] to-[var(--accent-pink)]',
    iconColor: 'text-[var(--accent-amber)]',
    bgColor: 'bg-[var(--accent-amber)]/10',
  },
  {
    icon: Globe,
    title: 'Any Topic',
    description: 'From computer science to healthcare, our AI handles any research domain with expertise.',
    gradient: 'from-[var(--accent-indigo)] to-[var(--accent-cyan)]',
    iconColor: 'text-[var(--accent-indigo-light)]',
    bgColor: 'bg-[var(--accent-indigo)]/10',
  },
  {
    icon: Sparkles,
    title: 'Export Ready',
    description: 'Download your paper as DOCX or HTML. Ready for submission to journals and conferences.',
    gradient: 'from-[var(--accent-purple)] to-[var(--accent-indigo)]',
    iconColor: 'text-[var(--accent-purple-light)]',
    bgColor: 'bg-[var(--accent-purple)]/10',
  },
];

export default function Features() {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 grid-pattern-dense opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 badge-indigo mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Features</span>
          </div>
          
          <h2 
            className="font-bold tracking-tight mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Everything You Need for{' '}
            <span className="text-gradient">Academic Writing</span>
          </h2>
          
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg leading-relaxed">
            Professional-grade research paper generation with all the features researchers need to succeed
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => { cardRefs.current[index] = el; }}
              data-index={index}
              className={`group surface-card p-8 cursor-pointer transition-all duration-700 ${
                visibleCards.has(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: `${index * 100}ms`,
              }}
            >
              {/* Glow Effect on Hover */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(600px circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 40%)`,
                }}
              />

              {/* Icon Container */}
              <div className={`relative w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                
                {/* Icon Glow */}
                <div className={`absolute inset-0 rounded-2xl ${feature.bgColor} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
              </div>

              {/* Content */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                </div>
                
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Border Glow */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${feature.gradient.includes('indigo') ? 'rgba(99, 102, 241, 0.5)' : feature.gradient.includes('purple') ? 'rgba(168, 85, 247, 0.5)' : 'rgba(6, 182, 212, 0.5)'}, transparent)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="surface-glass inline-flex items-center gap-4 px-8 py-4 rounded-2xl">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-indigo)] to-[var(--accent-purple)] border-2 border-[var(--bg-primary)] flex items-center justify-center text-xs font-bold text-white"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-[var(--text-primary)] font-medium">Join 10,000+ researchers</p>
              <p className="text-[var(--text-tertiary)] text-sm">Already using ResearchAI</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
