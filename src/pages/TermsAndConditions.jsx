import React from 'react';
import { motion } from 'framer-motion';

const SHOW_GRID_BG = false; // toggle the faint grid if you want

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
        <motion.section variants={fade} initial="initial" animate="animate" className="relative">
          {/* glow */}
          <div
            aria-hidden="true"
            className="absolute -inset-0.5 rounded-2xl blur opacity-70"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-10">
            {/* header */}
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-operon-blue">
                {/* document icon */}
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
              <Section id="accept" title="1. Acceptance of Terms">
                <p>
                  By creating an account or using the service, you accept these Terms and any
                  policies referenced here (including our <a href="/privacy-policy" className="text-operon-blue underline">Privacy Policy</a>).
                  If you use Operon on behalf of an organization, you represent that you’re authorized to accept these Terms for that organization.
                </p>
              </Section>

              <Section id="eligibility" title="2. Accounts & Eligibility">
                <p>
                  You must provide accurate information and keep your credentials secure. You are
                  responsible for all activity under your account, including actions by your staff or
                  collaborators.
                </p>
              </Section>

              <Section id="use" title="3. Use of Service">
                <p>
                  Operon provides operations and messaging infrastructure to route and track service
                  requests. The property you interact with is responsible for the content of messages
                  and the handling of requests.
                </p>
              </Section>

              <Section id="messaging" title="4. Messaging & Fees">
                <p>
                  SMS and other messaging features are intended solely for operational communications
                  (e.g., requests, updates, confirmations). Standard carrier message and data rates
                  may apply. You consent to receive such messages when you initiate a request or opt in.
                </p>
              </Section>

              <Section id="prohibited" title="5. Prohibited Conduct">
                <ul className="list-disc pl-5">
                  <li>Illegal, harmful, misleading, promotional/marketing, or spam messaging.</li>
                  <li>Interference with or disruption of the service or its security.</li>
                  <li>Reverse engineering, scraping, or abusing rate limits.</li>
                  <li>Using the service to collect or process sensitive data without authorization.</li>
                </ul>
              </Section>

              <Section id="ip" title="6. Intellectual Property">
                <p>
                  The service, including software, design, and content, is protected by law. We grant you a
                  limited, non-exclusive, non-transferable right to use the service in accordance with these Terms.
                </p>
              </Section>

              <Section id="disclaimers" title="7. Disclaimers">
                <p>
                  The service is provided “as is” and “as available.” We disclaim warranties of merchantability,
                  fitness for a particular purpose, and non-infringement to the fullest extent permitted by law.
                </p>
              </Section>

              <Section id="liability" title="8. Limitation of Liability">
                <p>
                  To the maximum extent permitted by law, Operon and its affiliates shall not be liable for any
                  indirect, incidental, special, consequential, or punitive damages, or for lost profits, data,
                  or business, even if advised of the possibility of such damages. Our aggregate liability relating
                  to the service is limited to the amounts paid to us for the service in the 12 months preceding the claim.
                </p>
              </Section>

              <Section id="termination" title="9. Termination">
                <p>
                  We may suspend or terminate access for breach or suspected misuse. You may stop using the service at any time.
                  Certain provisions survive termination (e.g., IP, disclaimers, limitations of liability).
                </p>
              </Section>

              <Section id="changes" title="10. Changes to Terms">
                <p>
                  We may update these Terms from time to time. Changes take effect when posted here. Your continued use
                  after changes are posted constitutes acceptance.
                </p>
              </Section>

              <Section id="law" title="11. Governing Law">
                <p>
                  These Terms are governed by the laws of the state/province where Operon is organized, excluding its conflicts of law rules.
                  Venue for disputes will be the competent courts in that jurisdiction unless otherwise required by applicable law.
                </p>
              </Section>

              <Section id="contact" title="12. Contact">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <a
                    href="mailto:support@operonops.com?subject=Terms%20Inquiry"
                    className="inline-flex items-center gap-2 text-operon-blue hover:underline"
                  >
                    {/* mail icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="m22 7-10 7L2 7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    support@operonops.com
                  </a>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <a href="tel:6513469559" className="text-operon-blue hover:underline">
                    (651) 346-9559
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This page is product copy, not legal advice. For specific questions, please consult counsel.
                </p>
              </Section>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
