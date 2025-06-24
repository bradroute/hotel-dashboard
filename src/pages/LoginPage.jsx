import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import logoFull from '../assets/logo-icon2.png';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) setError(authErr.message);
    else navigate('/dashboard');
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm fixed top-0 left-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoFull} alt="Operon Logo" className="h-8 sm:h-10" />
          <span className="text-xl font-bold text-operon-charcoal hidden sm:block">Operon</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/about"
            className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
          >
            About
          </Link>
          <Link
            to="/learn-more"
            className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
          >
            Learn More
          </Link>
          <Link
            to="/signup"
            className="bg-operon-blue text-white font-medium px-4 py-1.5 rounded hover:bg-blue-400 text-sm sm:text-base"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-operon-background p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <img
            src={logoFull}
            alt="Operon"
            className="h-14 sm:h-16 mx-auto mb-3"
          />
          <h1 className="text-3xl font-semibold text-operon-charcoal">Welcome to Operon</h1>
          <p className="text-operon-muted text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Operon is a lightweight yet powerful hotel operations platform that streamlines
            guest service requests across all departments — in real time.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Link to="/learn-more">
              <button className="px-6 py-2 border border-operon-blue text-operon-blue rounded hover:bg-blue-50 transition text-sm sm:text-base">
                Learn More
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-6 py-2 bg-operon-blue text-white rounded hover:bg-blue-400 transition text-sm sm:text-base">
                Sign Up
              </button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 italic mt-4 max-w-sm mx-auto">
            "Operon cut our response times in half." — Front Desk Manager, Hotel Crosby
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg space-y-6"
        >
          <h2 className="text-2xl font-semibold text-operon-charcoal text-center mb-2">
            Login
          </h2>

          {error && (
            <p className="text-center text-red-600 text-sm">{error}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
            required
          />

          <button
            type="submit"
            className="w-full bg-operon-blue hover:bg-blue-400 text-white py-2 rounded font-medium transition"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-operon-blue hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
