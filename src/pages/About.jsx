import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoMark from '../assets/logo-icon2.png';

const SHOW_GRID_BG = false; // toggle the faint grid if you like

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function About() {
  return (
    // Match Terms page: dvh, orbs that scroll, left seam fix, no nested scrollbars
    <main className="relative min-h-dvh pt-24 overflow-x-clip bg-operon-background">
      {/* background accents (scroll with page) */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute top-[-12rem] left-0 -ml-px -translate-x-24
          h-[34rem] w-[34rem] rounded-full blur-3xl
        "
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute bottom-[-14rem] right-0
          h-[38rem] w-[38rem] rounded-full blur-[90px]
        "
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }}
      />
      {SHOW_GRID_BG && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[.25]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(17,24,39,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.08) 1px, transparent 1px)',
            backgroundSize: '42px 42px, 42px 42px',
            maskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
          }}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <motion.section
          variants={fade}
          initial="initial"
          animate="animate"
          className="relative"
        >
          {/* glow behind the card (kept inside bounds) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl blur opacity-70"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-10">
            {/* header */}
            <div className="flex items-center gap-3 mb-4">
              <img src={logoMark} alt="Operon" className="h-10 w-10" />
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-operon-charcoal">
                About{' '}
                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Operon
                </span>
              </h1>
            </div>

            {/* body copy */}
            <p className="text-operon-muted text-lg leading-relaxed max-w-3xl">
              Operon is a modern property operations platform that helps teams
              coordinate and resolve service requests in real time. Built for
              speed and clarity, it brings your staff into one place so you can
              respond faster and deliver an exceptional guest &amp; resident experience.
            </p>

            {/* checklist */}
            <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-operon-charcoal">
              {[
                'Real-time request intake, tracking, and acknowledgment',
                'Centralized dashboard across departments',
                'AI-powered classification and insightful analytics',
                'Role-based access with an audit trail',
                'Secure by design with sensible defaults',
                'Fast setup—ready in minutes, not months',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  {/* check icon (inline SVG) */}
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="text-[15px] leading-6">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA row */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/learn-more"
                className="px-5 py-2.5 rounded-lg border border-operon-blue text-operon-blue hover:bg-blue-50 transition text-sm sm:text-base text-center"
              >
                Learn More
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-lg bg-operon-blue text-white hover:bg-blue-400 transition text-sm sm:text-base text-center"
              >
                Get Started
              </Link>
            </div>

            {/* quote */}
            <p className="mt-6 text-sm italic text-gray-500">
              “Operon cut our response times in half.” — Front Desk Manager
            </p>
          </div>
        </motion.section>

        {/* slim stats band */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 opacity-90">
          {[
            { k: '1', v: 'Unified dashboard' },
            { k: '5', v: 'Core departments' },
            { k: 'AI', v: 'Classification built-in' },
            { k: 'Minutes', v: 'Fast setup' },
          ].map(({ k, v }) => (
            <div key={v} className="flex items-center gap-3">
              <span className="text-lg font-extrabold text-operon-charcoal">{k}</span>
              <span className="text-sm text-operon-muted">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
