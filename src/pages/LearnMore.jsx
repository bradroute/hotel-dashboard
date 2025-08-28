import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoMark from '../assets/logo-icon2.png';

const SHOW_GRID_BG = false; // toggle the faint grid if you want

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function LearnMore() {
  return (
    // Match Terms: dvh height, horizontal clip only, orbs scroll with page, seam fix
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        {/* ---------- Hero card ---------- */}
        <motion.section variants={fade} initial="initial" animate="animate" className="relative">
          {/* keep glow inside bounds (no negative inset) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl blur opacity-70"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-3">
              <img src={logoMark} alt="Operon" className="h-10 w-10" />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-operon-charcoal">
                Learn more about{' '}
                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Operon
                </span>
              </h1>
            </div>

            <p className="text-operon-muted text-lg leading-relaxed max-w-3xl">
              Built for modern hospitality and property teams, Operon centralizes requests,
              automates the busywork with AI, and gives leadership real-time visibility into
              service quality and SLAs.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-lg bg-operon-blue text-white hover:bg-blue-400 transition text-sm sm:text-base text-center"
              >
                Start Free
              </Link>
              <a
                href="mailto:support@operonops.com"
                className="px-5 py-2.5 rounded-lg border border-operon-blue text-operon-blue hover:bg-blue-50 transition text-sm sm:text-base text-center"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </motion.section>

        {/* ---------- Three-step overview ---------- */}
        <motion.section
          variants={fade}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.05 }}
          className="mt-10 grid md:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Intake',
              desc: 'Guests or residents submit requests via app or SMS. Everything lands in one queue.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16v12H5.5L4 18V4Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 8h10M7 12h7" stroke="currentColor" strokeWidth="2" />
                </svg>
              ),
            },
            {
              title: 'Classify',
              desc: 'AI tags department, priority, and room/area. SLAs and routing rules apply automatically.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l7 4v10l-7 4-7-4V7l7-4Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M9 12h6" stroke="currentColor" strokeWidth="2" />
                </svg>
              ),
            },
            {
              title: 'Resolve',
              desc: 'Staff acknowledge, update, and complete—while analytics track speed, bottlenecks, and SLAs.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 13l4 4 12-12" stroke="currentColor" strokeWidth="2" />
                </svg>
              ),
            },
          ].map(({ title, desc, icon }) => (
            <div
              key={title}
              className="rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-5"
            >
              <div className="flex items-center gap-3 text-operon-charcoal mb-2">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-blue-50 text-operon-blue">
                  {icon}
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <p className="text-sm text-operon-muted leading-6">{desc}</p>
            </div>
          ))}
        </motion.section>

        {/* ---------- Feature grid ---------- */}
        <motion.section
          variants={fade}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            'Real-time dashboard with filters and bulk actions',
            'AI-powered request classification & enrichment',
            'Custom priorities, SLAs, and escalations',
            'Cross-department visibility and audit trail',
            'Analytics for response times, SLA misses, and trends',
            'Secure by design: role-based access and sensible defaults',
          ].map((text) => (
            <div key={text} className="rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-5">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <p className="text-sm text-operon-charcoal leading-6">{text}</p>
              </div>
            </div>
          ))}
        </motion.section>

        {/* ---------- Bottom CTA ---------- */}
        <motion.section
          variants={fade}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.15 }}
          className="mt-12 mb-10 flex flex-col sm:flex-row gap-3"
        >
          <Link
            to="/signup"
            className="px-5 py-2.5 rounded-lg bg-operon-blue text-white hover:bg-blue-400 transition text-sm sm:text-base text-center"
          >
            Create your account
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-lg border border-operon-blue text-operon-blue hover:bg-blue-50 transition text-sm sm:text-base text-center"
          >
            Back to Login
          </Link>
        </motion.section>
      </div>
    </main>
  );
}
