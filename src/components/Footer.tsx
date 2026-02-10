'use client';

import { FileText, Github, Twitter, Linkedin, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'API', href: '#' },
    { name: 'Integrations', href: '#' },
  ],
  Company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Press', href: '#' },
  ],
  Resources: [
    { name: 'Documentation', href: '#' },
    { name: 'Help Center', href: '#' },
    { name: 'Community', href: '#' },
    { name: 'Templates', href: '#' },
  ],
  Legal: [
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Security', href: '#' },
    { name: 'Cookies', href: '#' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: '#', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-default)] pt-20 pb-8 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] orb orb-indigo opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-6 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-indigo)] via-[var(--accent-purple)] to-[var(--accent-pink)]" />
                <div className="absolute inset-[2px] bg-[var(--bg-primary)] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[var(--accent-indigo)]" />
                </div>
              </div>
              <span className="font-bold text-lg tracking-tight">
                Research<span className="text-[var(--accent-indigo)]">AI</span>
              </span>
            </div>
            
            <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-xs leading-relaxed">
              AI-powered research paper generation for academics, researchers, and students worldwide. Create publication-ready IEEE papers in minutes.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--accent-indigo)]/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-indigo-light)] transition-all duration-200"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-5 text-sm text-[var(--text-primary)]">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="surface-card p-8 rounded-2xl mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Stay Updated</h3>
              <p className="text-[var(--text-secondary)] text-sm">Get the latest AI research tips and product updates.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input flex-1 md:w-64"
              />
              <button className="btn btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-accent mb-8" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-[var(--text-tertiary)] text-sm">
            <p>© 2026 ResearchAI. All rights reserved.</p>
            <span className="hidden md:block">•</span>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>San Francisco, CA</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--success)]"></span>
            </span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
