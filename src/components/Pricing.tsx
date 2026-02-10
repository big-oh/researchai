'use client';

import { Check, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out the platform',
    features: [
      '3 papers per month',
      'Up to 1,000 words',
      'Basic IEEE formatting',
      'HTML export',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious researchers and students',
    features: [
      'Unlimited papers',
      'Up to 10,000 words',
      'Advanced IEEE formatting',
      'DOCX & HTML export',
      'Priority generation',
      'Citation management',
      'Plagiarism checker',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    description: 'For research teams and institutions',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom templates',
      'API access',
      'Dedicated support',
      'SSO authentication',
      'White-label option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] orb orb-indigo opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] orb orb-purple opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 badge-purple mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </div>
          
          <h2 
            className="font-bold tracking-tight mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h2>
          
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            Choose the plan that fits your research needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                plan.popular
                  ? 'bg-gradient-to-b from-[var(--accent-indigo)]/10 via-[var(--bg-tertiary)] to-[var(--bg-secondary)] border-2 border-[var(--accent-indigo)]/30 scale-105 md:scale-110 z-10 glow-indigo'
                  : 'surface-card border border-[var(--border-default)] hover:border-[var(--border-hover)]'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--accent-indigo)] to-[var(--accent-purple)] text-white text-sm font-semibold shadow-lg">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {plan.name}
                </h3>
                <p className="text-[var(--text-tertiary)] text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span 
                    className={`font-bold ${plan.popular ? 'text-gradient text-5xl' : 'text-[var(--text-primary)] text-4xl'}`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-[var(--text-tertiary)]">{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.popular 
                        ? 'bg-[var(--accent-indigo)]/20' 
                        : 'bg-[var(--accent-indigo)]/10'
                    }`}>
                      <Check className={`w-3 h-3 ${
                        plan.popular ? 'text-[var(--accent-indigo-light)]' : 'text-[var(--accent-indigo)]'
                      }`} />
                    </div>
                    <span className="text-[var(--text-secondary)] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'btn btn-primary group'
                    : 'btn btn-secondary hover:bg-[var(--accent-indigo)] hover:text-white hover:border-[var(--accent-indigo)]'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Decorative Elements for Popular Plan */}
              {plan.popular && (
                <>
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--accent-indigo)] animate-pulse" />
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-[var(--accent-purple)] animate-pulse delay-500" />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-16 text-center">
          <p className="text-[var(--text-tertiary)] text-sm">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
}
