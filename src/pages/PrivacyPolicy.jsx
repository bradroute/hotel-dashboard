import React from 'react';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
};

export default function PrivacyPolicy() {
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
              <FaLock className="text-operon-blue text-2xl" />
              Privacy Policy
            </h1>
            <p className="text-operon-muted text-lg mt-2 leading-relaxed">
              Operon (“we”, “us”, or “our”) is committed to protecting your privacy.
              This policy explains what information we collect, how we use it, and
              your rights.
            </p>
          </div>

          <div className="space-y-6 text-operon-charcoal text-base mb-8">
            <section>
              <h2 className="font-semibold mb-2">1. Information We Collect</h2>
              <p>
                We collect only the data necessary to provide guest messaging services:
                your phone number, messages you send, and metadata (timestamps, property ID).
              </p>
            </section>

            <section>
              <h2 className="font-semibold mb-2">2. How We Use Your Data</h2>
              <p>
                • To deliver your service requests to the appropriate property staff.<br/>
                • To maintain and improve our platform.<br/>
                • For compliance and fraud prevention.
              </p>
            </section>

            <section>
              <h2 className="font-semibold mb-2">3. Data Sharing & Security</h2>
              <p>
                We do not sell or rent your personal data. We share your information only
                with the property you’re staying at and our trusted service providers under
                strict confidentiality. All data is encrypted in transit and at rest.
              </p>
            </section>

            <section>
              <h2 className="font-semibold mb-2">4. Your Rights</h2>
              <p>
                You may request access, correction, or deletion of your data by emailing us.
                We’ll respond within 30 days.
              </p>
            </section>
          </div>

          <p className="text-operon-muted flex items-center gap-2 text-base mb-8">
            <FaEnvelope className="text-operon-blue" />
            Questions? Email us at{' '}
            <a
              href="mailto:info@operonapp.com"
              className="text-operon-blue underline hover:text-blue-500 transition"
            >
              info@operonapp.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
