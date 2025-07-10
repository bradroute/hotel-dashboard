import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import logoFull from '../assets/logo-full.png';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.18 } },
};

export default function SignUp() {
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    // 1) Sign up sends confirmation email but does NOT return a session until confirmed
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpErr) {
      setError(signUpErr.message);
      return;
    }

    // 2) Don’t insert into profiles yet—user is still anon until they confirm email & log in
    setSuccessMessage(
      'Welcome! 🎉 Please check your email for a confirmation link before logging in.'
    );
  };

  return (
    <div className="min-h-screen bg-operon-background">
      <Navbar />
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4"
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg space-y-6"
        >
          <div className="flex flex-col items-center">
            <img
              src={logoFull}
              alt="Operon"
              className="max-h-[164px] w-auto object-contain mb-0"
            />
            <h1 className="text-xl font-semibold text-operon-charcoal text-center">
              Sign Up
            </h1>
          </div>

          {error && <p className="text-center text-red-600 text-sm">{error}</p>}
          {successMessage && (
            <p className="text-center text-green-600 text-sm">{successMessage}</p>
          )}

          <input
            type="text"
            placeholder="Account Name"
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
            required
          />

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
            Sign Up
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-operon-blue hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
