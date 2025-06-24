import React from 'react';
import { FaHotel, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div className="min-h-screen bg-operon-background">
      <Navbar />
      <div className="flex justify-center items-start min-h-screen pt-28 px-4">
        <div className="bg-white shadow-lg rounded-xl p-10 max-w-3xl w-full">
          <div className="flex items-center mb-5 space-x-3">
            <FaHotel className="text-operon-blue text-3xl" />
            <h1 className="text-3xl font-semibold text-operon-charcoal">About Operon</h1>
          </div>
          <p className="text-operon-muted text-lg mb-7 leading-relaxed">
            Operon is a modern hotel operations platform that enables staff to manage and respond
            to guest service requests in real time. Built with simplicity and speed in mind, Operon
            helps your team stay coordinated, responsive, and focused on what matters most —{' '}
            <strong className="text-operon-charcoal">guest satisfaction</strong>.
          </p>
          <ul className="space-y-3 text-operon-charcoal text-base mb-8">
            <li className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              Real-time SMS request tracking and acknowledgment
            </li>
            <li className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              Centralized dashboard for all departments
            </li>
            <li className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              Insightful analytics to optimize response times
            </li>
            <li className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              Lightweight design with enterprise-level power
            </li>
          </ul>
          <Link
            to="/learn-more"
            className="bg-operon-blue text-white font-medium py-2.5 px-7 rounded hover:bg-blue-500 transition inline-block text-base"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
