import React from 'react';
import { FaFileContract, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.18 } },
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-operon-background">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex justify-center items-start min-h-screen pt-28 px-4"
      >
        <div className="bg-white shadow-lg rounded-xl p-10 max-w-4xl w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-operon-charcoal flex items-center gap-3">
              <FaFileContract className="text-operon-blue text-2xl" />
              Terms &amp; Conditions
            </h1>
            <p className="text-operon-muted text-lg mt-2 leading-relaxed">
              These terms govern your use of Operon’s guest messaging platform. By
              accessing or using our service, you agree to these terms.
            </p>
          </div>

          <div className="space-y-6 text-operon-charcoal text-base mb-8">
            <section>
              <h2 className="font-semibold mb-2">1. Acceptance of Terms</h2>
              <p>
                You agree that Operon may send and receive SMS messages strictly to handle
                service requests initiated by you. Standard message & data rates may apply.
              </p>
            </section>

            <section>
              <h2 className="font-semibold mb-2">2. Use of Service</h2>
              <p>
                Operon provides messaging infrastructure only. The content and handling of
                service requests are the responsibility of the property you’re communicating with.
              </p>
            </section>

            <section>
              <h2 className="font-semibold mb-2">3. Prohibited Conduct</h2>
              <p>
                You will not use Operon for any unlawful, promotional, or marketing purposes.
                Any such use may result in suspension or termination of service.
              </p>
            </section>

            <section>
              <h2 className="font-semibold mb-2">4. Changes to Terms</h2>
              <p>
                We may update these terms at any time. We’ll post the revised terms at
                this URL, and continued use constitutes acceptance.
              </p>
            </section>
          </div>

          <p className="text-operon-muted flex items-center gap-2 text-base mb-8">
            <FaEnvelope className="text-operon-blue" />
            Questions about these terms? Contact{' '}
            <a
              href="mailto:team@operonapp.com"
              className="text-operon-blue underline hover:text-blue-500 transition"
            >
              team@operonapp.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
