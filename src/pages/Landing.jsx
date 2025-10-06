// src/pages/Landing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import heroDesktop from '../assets/hero-desktop.png'; // export a crisp dashboard screenshot

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const float = {
  initial: { y: 0 },
  animate: {
    y: [-4, 4, -4],
    transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
  },
};

function RealAppPreviewImage() {
  return (
    <motion.div
      variants={float}
      initial="initial"
      animate="animate"
      className="relative mx-auto w-full max-w-xl"
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] blur-2xl opacity-80"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 40%, rgba(59,130,246,.18), rgba(34,211,238,.12) 45%, transparent 70%)',
        }}
      />
      {/* framed screenshot */}
      <div className="relative rounded-2xl border border-black/10 bg-white/90 shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <img
          src={heroDesktop}
          alt="Operon dashboard — live queue, routing, and SLA metrics"
          className="block w-full h-auto"
          loading="eager"
          fetchpriority="high"
        />
      </div>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <main className="relative min-h-dvh">
      <Navbar />

      {/* background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-[38rem] rounded-b-[4rem] blur-2xl"
        style={{
          background:
            'radial-gradient(60% 60% at 20% 0%, rgba(59,130,246,.22), transparent 60%), radial-gradient(55% 55% at 80% 0%, rgba(34,211,238,.18), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-14rem] right-0 h-[38rem] w-[38rem] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.18), transparent)' }}
      />

      {/* content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* HERO COPY */}
          <motion.section variants={fade} initial="initial" animate="animate" className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-white/70 backdrop-blur text-xs text-gray-600 tracking-wide mb-5">
              Hotels • Apartments • Condos • Restaurants
            </div>

            <h1 className="text-[2.75rem] sm:text-6xl font-black leading-tight tracking-tight text-gray-900">
              Order from chaos.
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Zero requests lost.
              </span>
            </h1>

            <p className="mt-5 text-[17px] text-gray-600 max-w-2xl leading-relaxed">
              Guests text. Operon auto-routes, timestamps, and proves it with live SLAs. Managers see
              reality—teams move faster.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:info@operonops.com?subject=Operon%20Demo%20Request"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-3 text-base font-medium text-white"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 transition-opacity group-hover:opacity-90" />
                <span className="relative">Book a 15-min demo</span>
              </a>
              <Link
                to="/learn-more"
                className="rounded-xl border border-blue-300/70 px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-50"
              >
                See 90-sec walkthrough
              </Link>
            </div>

            {/* trust bar */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Secure by design
              </span>
              <span>•</span>
              <span>Role-based access</span>
              <span>•</span>
              <span>Analytics & SLAs</span>
            </div>
          </motion.section>

          {/* HERO VISUAL (real screenshot) */}
          <motion.section
            variants={fade}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.06 }}
            className="relative"
          >
            <RealAppPreviewImage />
          </motion.section>
        </div>

        {/* Proof tiles */}
        <motion.section
          variants={fade}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.12 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            ['62%', 'faster acknowledgements'],
            ['–48%', 'missed SLAs'],
            ['$X', 'saved / room / mo'],
          ].map(([kpi, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur px-5 py-4 shadow-sm"
            >
              <div className="text-3xl font-semibold tracking-tight text-gray-900">{kpi}</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </motion.section>

        {/* Outcomes + pilot card */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['Faster first response', 'Auto-route by department & priority.'],
            ['Cleaner handoffs', 'Escalations and timestamps by default.'],
            ['Fewer phone loops', 'Guests text; staff see a single queue.'],
            ['Manager visibility', 'Live metrics for owners & GMs.'],
            ['SLA awareness', 'Targets, breaches, and trend lines.'],
            ['Data ownership', 'Export anytime. Your data stays yours.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-5">
              <div className="font-semibold text-gray-900">{t}</div>
              <div className="mt-1 text-sm text-gray-600">{d}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur p-5 shadow-sm">
          <div className="font-semibold text-gray-900">30-day pilot snapshot</div>
          <div className="text-sm text-gray-600 mt-1">212 requests • 0 dropped • 62% faster acks.</div>
          <div className="mt-2">
            <Link to="/learn-more" className="text-sm text-blue-600 underline">
              See methodology
            </Link>
          </div>
        </div>

        {/* FAQ strip */}
        <section className="mt-16 grid md:grid-cols-3 gap-4">
          {[
            ['How fast to launch?', 'Same day. Start with a pilot. No PMS required.'],
            ['Do guests need an app?', 'No. SMS day one. Staff app optional.'],
            ['What about IT?', 'SSO-ready. Least-privilege roles. Audit trails.'],
          ].map(([q, a]) => (
            <div key={q} className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-5">
              <div className="font-medium text-gray-900">{q}</div>
              <div className="text-sm text-gray-600 mt-1">{a}</div>
            </div>
          ))}
        </section>

        {/* Final CTA */}
        <section className="mt-14 text-center">
          <h3 className="text-2xl font-semibold text-gray-900">Ready to clear your queue?</h3>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a
              href="mailto:info@operonops.com?subject=Operon%20Demo%20Request"
              className="relative inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-3 text-white"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400" />
              <span className="relative">Book demo</span>
            </a>
            <Link
              to="/login"
              className="rounded-xl border border-gray-300 px-6 py-3 text-gray-800 hover:border-blue-400 hover:text-blue-600"
            >
              Log in
            </Link>
          </div>
        </section>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed left-3 right-3 bottom-3 md:hidden flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-black/10 bg-white/80 backdrop-blur">
        <span className="text-sm">Zero requests lost.</span>
        <a
          href="mailto:info@operonops.com?subject=Operon%20Demo%20Request"
          className="px-3 py-1.5 rounded-md bg-blue-500 text-white"
        >
          Book demo
        </a>
      </div>
    </main>
  );
}
