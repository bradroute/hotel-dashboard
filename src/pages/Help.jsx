import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SHOW_GRID_BG = false; // toggle subtle grid if desired

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function Help() {
  return (
    <main className="relative min-h-screen pt-24 overflow-hidden bg-operon-background">
      {/* background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -left-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -right-40 h-[38rem] w-[38rem] rounded-full blur-[90px]"
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero / Title card */}
        <motion.section variants={fade} initial="initial" animate="animate" className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-0.5 rounded-2xl blur opacity-70"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-operon-charcoal mb-2">
              Need <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Help?</span>
            </h1>
            <p className="text-operon-muted text-lg leading-relaxed max-w-3xl">
              We’re here to get you back to operational excellence. Reach us by phone or email,
              or explore quick links below for common tasks.
            </p>

            {/* Contact cards */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <a
                href="tel:6513469559"
                className="group rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-5 flex items-start gap-3 hover:shadow-xl transition"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-operon-blue">
                  {/* phone icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.15 9.81 19.79 19.79 0 0 1 .08 1.18 2 2 0 0 1 2.06 0h2a2 2 0 0 1 2 1.72c.12.89.32 1.76.59 2.6a2 2 0 0 1-.45 2.11L5.1 7.53a16 16 0 0 0 6.37 6.37l1.1-1.1a2 2 0 0 1 2.11-.45c.84.27 1.71.47 2.6.59A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                <div>
                  <div className="text-operon-charcoal font-semibold">Call Support</div>
                  <div className="text-operon-blue group-hover:underline"> (651) 346-9559 </div>
                  <div className="text-xs text-gray-500 mt-1">Business hours: Mon–Fri • Central Time</div>
                </div>
              </a>

              <a
                href="mailto:support@operonops.com?subject=Operon%20Support%20Request&body=Describe%20your%20issue%20and%20include%20screenshots%20if%20possible."
                className="group rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-5 flex items-start gap-3 hover:shadow-xl transition"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-operon-blue">
                  {/* mail icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="m22 7-10 7L2 7" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                <div>
                  <div className="text-operon-charcoal font-semibold">Email Support</div>
                  <div className="text-operon-blue group-hover:underline">support@operonops.com</div>
                  <div className="text-xs text-gray-500 mt-1">We aim to reply within one business day.</div>
                </div>
              </a>
            </div>

            {/* Quick links */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-operon-charcoal mb-3">Quick links</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { to: '/reset', label: 'Reset your password' },
                  { to: '/learn-more', label: 'Product overview' },
                  { to: '/about', label: 'About Operon' },
                  { to: '/terms', label: 'Terms & Conditions' },
                  { to: '/privacy-policy', label: 'Privacy Policy' },
                  { to: '/login', label: 'Back to login' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="rounded-lg ring-1 ring-black/5 bg-white p-4 text-sm text-operon-charcoal hover:shadow-md hover:-translate-y-[1px] transition"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
