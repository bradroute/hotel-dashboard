import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import logoFull from '../assets/logo-icon2.png';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    // 1) Auth
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) {
      setBusy(false);
      setError(authErr.message);
      return;
    }
    const userId = data.user.id;

    // 2) Hotels for owner (multi-property)
    const { data: hotels, error: hotelsErr } = await supabase
      .from('hotels')
      .select('id')
      .eq('profile_id', userId);

    if (hotelsErr) {
      setBusy(false);
      setError('Login succeeded but failed to fetch properties.');
      return;
    }

    // 3) Active property on profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', userId)
      .single();

    if (profileErr) {
      setBusy(false);
      setError('Login succeeded but failed to fetch profile.');
      return;
    }

    // 4) Route
    if (!hotels || hotels.length === 0) {
      setBusy(false);
      navigate('/onboarding');
      return;
    }

    if (!profile?.hotel_id) {
      setBusy(false);
      navigate('/property-picker');
      return;
    }

    setBusy(false);
    navigate('/dashboard');
  }

  return (
    <main className="relative min-h-screen bg-operon-background pt-24 overflow-hidden">
      {/* Decorative gradients (no extra CSS needed) */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Hero / Marketing */}
          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-operon-muted text-xs tracking-wide mb-4">
              Hotels • Apartments • Condos • Restaurants
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <img src={logoFull} alt="Operon" className="h-12 sm:h-14" />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-operon-charcoal">
                The modern operations platform
              </h1>
            </div>

            <p className="text-operon-muted max-w-2xl leading-relaxed mx-auto md:mx-0">
              Coordinate and resolve service requests fast, boost team efficiency,
              and deliver an exceptional guest &amp; resident experience — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center md:justify-start">
              <Link
                to="/learn-more"
                className="px-5 py-2 rounded border border-operon-blue text-operon-blue hover:bg-blue-50 transition text-sm sm:text-base text-center"
              >
                Learn More
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded bg-operon-blue text-white hover:bg-blue-400 transition text-sm sm:text-base text-center"
              >
                Get Started
              </Link>
            </div>

            <p className="text-sm text-gray-500 italic mt-5">
              “Operon cut our response times in half.” — Front Desk Manager
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {['Real-time Dashboard', 'AI Classification', 'Analytics & SLAs', 'Secure & Compliant'].map((pill) => (
                <li
                  key={pill}
                  className="text-xs text-operon-muted px-3 py-1 rounded-full border border-white/15 bg-white/5"
                >
                  {pill}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Right: Auth card */}
          <motion.aside
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.05 }}
            className="w-full"
          >
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 sm:p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-operon-charcoal text-center mb-2">
                Login
              </h2>
              {error && (
                <div
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="block text-sm text-gray-600 mb-1">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    required
                  />
                </label>

                <label className="block">
                  <span className="block text-sm text-gray-600 mb-1">Password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-operon-blue hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition"
                >
                  {busy ? 'Signing in…' : 'Login'}
                </button>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <Link to="/reset" className="hover:underline">
                    Forgot password?
                  </Link>
                  <Link to="/signup" className="text-operon-blue hover:underline">
                    Create account
                  </Link>
                </div>
              </form>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
