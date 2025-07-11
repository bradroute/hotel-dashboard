import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import logoFull from '../assets/logo-icon2.png';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1) Sign in and get session
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) {
      setError(authErr.message);
      return;
    }

    const userId = data.user.id;

    // 2) Fetch all hotels for this user (multi-property support)
    const { data: hotels, error: hotelsErr } = await supabase
      .from('hotels')
      .select('id')
      .eq('profile_id', userId);
    if (hotelsErr) {
      setError('Login succeeded but failed to fetch properties.');
      return;
    }

    // 3) Fetch profile for active hotel_id
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', userId)
      .single();
    if (profileErr) {
      setError('Login succeeded but failed to fetch profile.');
      return;
    }

    // Routing logic
    if (!hotels || hotels.length === 0) {
      // User owns zero properties → go to onboarding
      navigate('/onboarding');
      return;
    }

    if (!profile.hotel_id) {
      // User owns hotels but has no active hotel_id → go to property picker
      navigate('/property-picker');
      return;
    }

    // Otherwise, user is good → go to dashboard
    navigate('/dashboard');
  };

  return (
    <>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col items-center justify-center min-h-screen bg-operon-background p-4 pt-24"
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <img src={logoFull} alt="Operon" className="h-14 sm:h-16 mx-auto mb-3" />
          <h1 className="text-3xl font-semibold text-operon-charcoal">Welcome to Operon</h1>
          <p className="text-operon-muted text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Operon is the modern property operations platform for hotels, apartments, condos, and restaurants. Coordinate and resolve service requests fast, boost team efficiency, and deliver an exceptional experience for your guests or residents—all in one place.
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
            "Operon cut our response times in half." — Front Desk Manager
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg space-y-6">
          <h2 className="text-2xl font-semibold text-operon-charcoal text-center mb-2">Login</h2>

          {error && <p className="text-center text-red-600 text-sm">{error}</p>}

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
      </motion.div>
    </>
  );
}
