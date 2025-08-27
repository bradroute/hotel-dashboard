// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoFull from '../assets/logo-icon2.png';

const footerVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.15 } },
};

export default function Footer() {
  const year = new Date().getFullYear();

  const linkClass =
    'text-gray-600 hover:text-operon-blue transition inline-flex items-center gap-2';

  return (
    <motion.footer
      variants={footerVariants}
      initial="initial"
      animate="animate"
      className="relative mt-16 border-t bg-white"
      role="contentinfo"
    >
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logoFull} alt="Operon" className="h-8 w-8 rounded" />
              <span className="text-lg font-extrabold text-operon-charcoal">Operon</span>
            </Link>
            <p className="mt-3 text-sm text-gray-600 max-w-xs">
              Modern property operations—coordinate requests, elevate service, and empower your team.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-operon-charcoal tracking-wide mb-3">
              Product
            </h3>
            <ul className="space-y-2">
              <li><Link to="/learn-more" className={linkClass}>Learn More</Link></li>
              <li><Link to="/signup" className={linkClass}>Get Started</Link></li>
              <li><Link to="/help" className={linkClass}>Help Center</Link></li>
              <li><Link to="/about" className={linkClass}>About</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-operon-charcoal tracking-wide mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@operonops.com" className={linkClass}>
                  Contact Support
                </a>
              </li>
              <li><Link to="/terms" className={linkClass}>Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy-policy" className={linkClass}>Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h3 className="text-sm font-semibold text-operon-charcoal tracking-wide mb-3">
              Follow
            </h3>
            <div className="flex items-center gap-3">
              {/* Replace # with your profiles */}
              <a href="#" aria-label="LinkedIn" className="p-2 rounded border hover:border-operon-blue hover:text-operon-blue text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4zM8.5 8h3.8v2.05h.05c.53-1 1.85-2.05 3.8-2.05 4.07 0 4.82 2.68 4.82 6.16V23h-4v-7.1c0-1.69-.03-3.86-2.35-3.86-2.35 0-2.71 1.84-2.71 3.75V23h-4z"/></svg>
              </a>
              <a href="#" aria-label="Twitter / X" className="p-2 rounded border hover:border-operon-blue hover:text-operon-blue text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21.5l-7.5 8.566L23.5 22h-6.09l-4.76-5.59L6.9 22H3.64l8.02-9.173L1.5 2h6.25l4.3 5.148L18.244 2Zm-1.07 18h1.783L7.92 4H6.137L17.173 20Z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {year} Operon. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Secure by design
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Real-time dashboard
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
