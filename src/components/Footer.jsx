// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.15 } },
};

const Footer = () => (
  <motion.footer
    className="w-full bg-white border-t text-center py-4 text-sm text-gray-500 mt-12"
    variants={footerVariants}
    initial="initial"
    animate="animate"
    exit="initial"
  >
    <div className="max-w-7xl mx-auto px-4">
      <p className="mb-1">
        &copy; {new Date().getFullYear()} Operon. All rights reserved.
      </p>
      <p>
        <Link to="/privacy-policy" className="underline hover:text-operon-blue">
          Privacy Policy
        </Link>
        <span className="mx-2">|</span>
        <Link to="/terms" className="underline hover:text-operon-blue">
          Terms &amp; Conditions
        </Link>
      </p>
    </div>
  </motion.footer>
);

export default Footer;
