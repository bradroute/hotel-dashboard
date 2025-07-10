import React from 'react';
import {
  FaArrowRight,
  FaEnvelope,
  FaChartLine,
  FaCogs,
  FaComments
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
};

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-operon-background">
      <Navbar />
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
              <FaChartLine className="text-operon-blue text-2xl" />
              Learn More About Operon
            </h1>
            <p className="text-operon-muted text-lg mt-2 leading-relaxed">
              Operon is designed for modern hospitality teams that want to elevate their
              operational efficiency. We empower hotels by offering:
            </p>
          </div>

          <ul className="space-y-4 text-operon-charcoal text-base mb-8">
            <li className="flex items-start gap-3">
              <FaComments className="text-green-500 mt-1" />
              Real-time guest communication via SMS
            </li>
            <li className="flex items-start gap-3">
              <FaCogs className="text-green-500 mt-1" />
              Smart request routing by department
            </li>
            <li className="flex items-start gap-3">
              <FaCogs className="text-green-500 mt-1" />
              Custom priority levels and SLAs
            </li>
            <li className="flex items-start gap-3">
              <FaChartLine className="text-green-500 mt-1" />
              Live operational dashboards and KPIs
            </li>
            <li className="flex items-start gap-3">
              <FaChartLine className="text-green-500 mt-1" />
              Cross-department visibility and accountability
            </li>
          </ul>

          <p className="text-operon-muted text-lg mb-5 leading-relaxed">
            Whether you’re a boutique hotel or a large resort, Operon gives your team a centralized
            hub for service excellence.
          </p>

          <p className="text-operon-muted flex items-center gap-2 text-base mb-8">
            <FaEnvelope className="text-operon-blue" />
            Want a demo or pricing info?{' '}
            <a
              href="mailto:team@operonapp.com"
              className="text-operon-blue underline hover:text-blue-500 transition"
            >
              team@operonapp.com
            </a>
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center bg-operon-blue text-white font-medium py-2.5 px-6 rounded hover:bg-blue-500 transition text-base"
          >
            Go to Dashboard <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
