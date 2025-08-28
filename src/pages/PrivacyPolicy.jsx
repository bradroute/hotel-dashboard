// src/pages/PrivacyPolicy.jsx
import React from 'react';
import { motion } from 'framer-motion';

const SHOW_GRID_BG = false; // toggle subtle grid if desired

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const Section = ({ id, title, children }) => (
    <section id={id} className="space-y-2">
      <h2 className="text-lg font-semibold text-operon-charcoal">{title}</h2>
      <div className="text-operon-charcoal text-[15px] leading-7">{children}</div>
    </section>
  );

  const Check = () => (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 mr-2 align-middle">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <motion.section variants={fade} initial="initial" animate="animate" className="relative">
          {/* glow (kept inside card bounds) */}
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
                  <path d="M6 10V7a6 6 0 1 1 12 0v3" stroke="currentColor" strokeWidth="2"/>
                  <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-operon-charcoal">
                Privacy Policy
              </h1>
            </div>
            <p className="text-operon-muted text-lg leading-relaxed">
              Operon (“we”, “us”, or “our”) is committed to protecting your privacy.
              This policy explains what information we collect, how we use it, and your rights.
            </p>
            <p className="text-xs text-gray-500 mt-2">Last updated: {lastUpdated}</p>

            {/* TOC */}
            <div className="mt-6 grid sm:grid-cols-2 gap-2 text-sm">
              {[
                { href: '#info', label: '1. Information We Collect' },
                { href: '#use', label: '2. How We Use Your Data' },
                { href: '#sharing', label: '3. Data Sharing & Subprocessors' },
                { href: '#security', label: '4. Security' },
                { href: '#retention', label: '5. Data Retention' },
                { href: '#rights', label: '6. Your Rights' },
                { href: '#changes', label: '7. Changes to this Policy' },
                { href: '#contact', label: '8. Contact' },
              ].map(({ href, label }) => (
                <a key={href} href={href} className="text-operon-blue hover:underline">
                  {label}
                </a>
              ))}
            </div>

            <div className="mt-8 space-y-6">
              <Section id="info" title="1. Information We Collect">
                <p>We only collect what’s needed to deliver the service:</p>
                <ul className="mt-2 space-y-1">
                  <li><Check />Account details (e.g., name, email).</li>
                  <li><Check />Operational data (request messages, timestamps, property / room identifiers, staff actions).</li>
                  <li><Check />Technical data (device/browser info, IP, logs) for security and reliability.</li>
                </ul>
              </Section>

              <Section id="use" title="2. How We Use Your Data">
                <ul className="mt-1 space-y-1">
                  <li><Check />Deliver and route guest/resident requests to the appropriate staff.</li>
                  <li><Check />Provide analytics, service levels (SLAs), and product improvements.</li>
                  <li><Check />Protect against fraud, abuse, and to comply with legal obligations.</li>
                </ul>
              </Section>

              <Section id="sharing" title="3. Data Sharing & Subprocessors">
                <p>
                  We do <strong>not</strong> sell or rent personal data. We share information only with:
                </p>
                <ul className="mt-1 space-y-1">
                  <li><Check />Your property and authorized staff you work with.</li>
                  <li><Check />Trusted vendors (e.g., hosting, communications, database) under strict agreements.</li>
                  <li><Check />Authorities when required by law.</li>
                </ul>
              </Section>

              <Section id="security" title="4. Security">
                <p>
                  We use industry-standard security controls, including encryption in transit and at rest,
                  role-based access, and logging. No system is perfectly secure, but we continually improve our defenses.
                </p>
              </Section>

              <Section id="retention" title="5. Data Retention">
                <p>
                  We retain data for as long as your account is active or as needed to provide the service,
                  meet legal obligations, or resolve disputes. You can request deletion (subject to legal/operational limits).
                </p>
              </Section>

              <Section id="rights" title="6. Your Rights">
                <p>
                  Depending on your location, you may have rights to access, correct, export, or delete your data,
                  and to object or restrict certain processing. We’ll respond to verified requests within a reasonable timeframe.
                </p>
              </Section>

              <Section id="changes" title="7. Changes to this Policy">
                <p>
                  We may update this policy to reflect changes to our practices. Updates will be posted here with a new
                  “Last updated” date.
                </p>
              </Section>

              <Section id="contact" title="8. Contact">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <a
                    href="mailto:info@operonops.com?subject=Privacy%20Request"
                    className="inline-flex items-center gap-2 text-operon-blue hover:underline"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="m22 7-10 7L2 7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    info@operonops.com
                  </a>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <a href="tel:6513469559" className="text-operon-blue hover:underline">
                    (651) 346-9559
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  For faster handling, include your property name and a summary of your request.
                </p>
              </Section>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
