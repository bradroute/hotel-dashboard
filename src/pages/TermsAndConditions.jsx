import React from 'react';
import { motion } from 'framer-motion';

const SHOW_GRID_BG = false;

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function TermsAndConditions() {
  const lastUpdated = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const Section = ({ id, title, children }) => (
    <section id={id} className="space-y-2">
      <h2 className="text-lg font-semibold text-operon-charcoal">{title}</h2>
      <div className="text-operon-charcoal text-[15px] leading-7">{children}</div>
    </section>
  );

  return (
    // isolate ⇒ keeps fixed orbs behind; overflow-x-clip ⇒ no sideways scroll from glow
    <main className="relative isolate min-h-dvh pt-24 overflow-x-clip bg-operon-background">
      {/* background accents (FIXED so they don't create an inner scrollbar) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 -ml-px h-[34rem] w-[34rem] rounded-full blur-3xl z-0"
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-0 bottom-[-10rem] h-[38rem] w-[38rem] rounded-full blur-[90px] z-0"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }}
      />
      {SHOW_GRID_BG && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 opacity-[.25] z-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(17,24,39,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.08) 1px, transparent 1px)',
            backgroundSize: '42px 42px, 42px 42px',
            maskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
          }}
        />
      )}

      {/* content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <motion.section variants={fade} initial="initial" animate="animate" className="relative">
          {/* glow stays inside card bounds */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl blur opacity-70"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-10">
            {/* header */}
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-operon-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2h8l4 4v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-operon-charcoal">
                Terms &amp; Conditions
              </h1>
            </div>

            <p className="text-operon-muted text-lg leading-relaxed">
              These terms govern your use of Operon’s platform. By accessing or using the service,
              you agree to these terms.
            </p>
            <p className="text-xs text-gray-500 mt-2">Last updated: {lastUpdated}</p>

            {/* TOC */}
            <div className="mt-6 grid sm:grid-cols-2 gap-2 text-sm">
              {[
                { href: '#accept', label: '1. Acceptance of Terms' },
                { href: '#eligibility', label: '2. Accounts & Eligibility' },
                { href: '#use', label: '3. Use of Service' },
                { href: '#messaging', label: '4. Messaging & Fees' },
                { href: '#prohibited', label: '5. Prohibited Conduct' },
                { href: '#ip', label: '6. Intellectual Property' },
                { href: '#disclaimers', label: '7. Disclaimers' },
                { href: '#liability', label: '8. Limitation of Liability' },
                { href: '#termination', label: '9. Termination' },
                { href: '#changes', label: '10. Changes to Terms' },
                { href: '#law', label: '11. Governing Law' },
                { href: '#contact', label: '12. Contact' },
              ].map(({ href, label }) => (
                <a key={href} href={href} className="text-operon-blue hover:underline">
                  {label}
                </a>
              ))}
            </div>

            {/* Body */}
            <div className="mt-8 space-y-6">
              {/* …unchanged sections… */}
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
