// src/pages/Landing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function Landing() {
  return (
    <main className="relative min-h-dvh">
      {/* Shared site navbar */}
      <Navbar />

      {/* background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-12rem] left-0 -ml-px -translate-x-24 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-14rem] right-0 h-[38rem] w-[38rem] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }}
      />

      {/* content container (pad for fixed navbar height) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 pt-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* HERO */}
          <motion.section variants={fade} initial="initial" animate="animate">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs text-operon-muted tracking-wide mb-4">
              Hotels • Apartments • Condos • Restaurants
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-operon-charcoal">
              Slash guest wait time.{' '}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Zero requests lost.
              </span>
            </h1>

            <p className="mt-4 text-[17px] text-operon-muted max-w-2xl leading-relaxed">
              AI-routed SMS + staff app that clears backlogs and proves it with live metrics.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a
                href="/book"
                className="px-5 py-2.5 rounded-lg bg-operon-blue text-white hover:bg-blue-400 transition text-sm sm:text-base text-center"
              >
                Book a 15-min demo
              </a>
              <a
                href="/walkthrough"
                className="px-5 py-2.5 rounded-lg border border-operon-blue text-operon-blue hover:bg-blue-50 transition text-sm sm:text-base text-center"
              >
                See 90-sec walkthrough
              </a>
            </div>

            {/* Proof counters */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5">
                <strong className="text-2xl">62%</strong>
                <div className="text-sm text-operon-muted">faster acknowledgements</div>
              </div>
              <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5">
                <strong className="text-2xl">–48%</strong>
                <div className="text-sm text-operon-muted">missed SLAs</div>
              </div>
              <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5">
                <strong className="text-2xl">$X</strong>
                <div className="text-sm text-operon-muted">saved / room / mo</div>
              </div>
            </div>

            <p className="mt-5 text-sm italic text-gray-500">
              “Operon cut our response times in half.” — Front Desk Manager
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {['Real-time Dashboard','AI Classification','Analytics & SLAs','Role-based Access','Secure & Compliant'].map(
                (pill) => (
                  <li
                    key={pill}
                    className="text-xs text-operon-muted px-3 py-1 rounded-full border border-white/15 bg-white/5"
                  >
                    {pill}
                  </li>
                )
              )}
            </ul>
          </motion.section>

          {/* Outcome cards */}
          <motion.section variants={fade} initial="initial" animate="animate" transition={{ delay: 0.05 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { t: 'Faster first response', d: 'Auto-route by department & priority.' },
                { t: 'Cleaner handoffs', d: 'Escalations and timestamps by default.' },
                { t: 'Fewer phone loops', d: 'Guests text; staff see a single queue.' },
                { t: 'Manager visibility', d: 'Live metrics for owners & GMs.' },
              ].map(({ t, d }) => (
                <article key={t} className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <h3 className="font-semibold">{t}</h3>
                  <p className="text-sm text-operon-muted mt-1">{d}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0">
              <h4 className="font-semibold">30-day pilot snapshot</h4>
              <p className="text-sm text-operon-muted mt-1">212 requests • 0 dropped • 62% faster acks.</p>
              <div className="mt-3">
                <a href="/proof" className="text-sm text-operon-blue underline">See methodology</a>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Simple FAQ strip */}
        <section className="mt-16 grid md:grid-cols-3 gap-3">
          {[
            ['How fast to launch?', 'Same day without a PMS. Pilot first.'],
            ['Do guests need an app?', 'No. SMS day one. App optional.'],
            ['Data ownership?', 'You own it. Export anytime.'],
          ].map(([q, a]) => (
            <div key={q} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="font-medium">{q}</div>
              <div className="text-sm text-operon-muted mt-1">{a}</div>
            </div>
          ))}
        </section>

        {/* Final CTA */}
        <section className="mt-12 mb-20 text-center">
          <h3 className="text-2xl font-semibold">Ready to clear your queue?</h3>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a href="/book" className="px-5 py-2.5 rounded-lg bg-operon-blue text-white hover:bg-blue-400 transition">
              Book demo
            </a>
            <Link to="/login" className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-800 hover:border-operon-blue hover:text-operon-blue">
              Log in
            </Link>
          </div>
        </section>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed left-3 right-3 bottom-3 md:hidden flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-white/10 bg-white/10 backdrop-blur">
        <span className="text-sm">Slash guest wait time.</span>
        <a href="/book" className="px-3 py-1.5 rounded-md bg-operon-blue text-white">Book demo</a>
      </div>
    </main>
  );
}
