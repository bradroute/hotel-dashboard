// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import logoFull from '../assets/logo-icon2.png';
import { motion } from 'framer-motion';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setBusy(false); setError(authErr.message); return; }
    const userId = data.user.id;

    const { data: hotels, error: hotelsErr } = await supabase
      .from('hotels').select('id').eq('profile_id', userId);
    if (hotelsErr) { setBusy(false); setError('Login succeeded but failed to fetch properties.'); return; }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles').select('hotel_id').eq('id', userId).single();
    if (profileErr) { setBusy(false); setError('Login succeeded but failed to fetch profile.'); return; }

    if (!hotels || hotels.length === 0) { setBusy(false); navigate('/onboarding'); return; }
    if (!profile?.hotel_id)           { setBusy(false); navigate('/property-picker'); return; }

    setBusy(false);
    // If routing uses property IDs, swap for: navigate(`/dashboard/${profile.hotel_id}`);
    navigate('/dashboard');
  }

  return (
    // Note: pb-10 + overflow-hidden and a mask on the accents to fade before the footer
    <main className="relative z-10 min-h-screen pt-24 pb-10 overflow-hidden bg-operon-background">
      {/* Decorative corner accents (scroll with page) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
        style={{
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}
      >
        {/* top-left blue */}
        <div
          className="absolute -left-[46vmin] -top-[42vmin] w-[110vmin] h-[110vmin] rounded-full blur-[90px] opacity-80"
          style={{
            background: 'radial-gradient(closest-side, rgba(59,130,246,0.22), rgba(59,130,246,0) 72%)',
          }}
        />
        {/* bottom-right cyan */}
        <div
          className="absolute -right-[50vmin] -bottom-[50vmin] w-[130vmin] h-[130vmin] rounded-full blur-[100px] opacity-80"
          style={{
            background: 'radial-gradient(closest-side, rgba(34,211,238,0.20), rgba(34,211,238,0) 72%)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ----------- HERO ----------- */}
          <motion.section variants={fade} initial="initial" animate="animate">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs text-operon-muted tracking-wide mb-4">
              Hotels • Apartments • Condos • Restaurants
            </div>

            <div className="flex items-center gap-3 mb-3">
              <img src={logoFull} alt="Operon" className="h-12 sm:h-14" />
              <span className="text-sm text-operon-muted hidden sm:block">Modern property operations</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-operon-charcoal">
              The modern{' '}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                operations platform
              </span>
            </h1>

            <p className="mt-4 text-[17px] text-operon-muted max-w-2xl leading-relaxed">
              Coordinate and resolve service requests fast, boost team efficiency,
              and deliver an exceptional guest &amp; resident experience — all in one place.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/learn-more"
                className="px-5 py-2.5 rounded-lg border border-operon-blue text-operon-blue hover:bg-blue-50 transition text-sm sm:text-base text-center"
              >
                Learn More
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-lg bg-operon-blue text-white hover:bg-blue-400 transition text-sm sm:text-base text-center"
              >
                Get Started
              </Link>
            </div>

            <p className="mt-5 text-sm italic text-gray-500">
              “Operon cut our response times in half.” — Front Desk Manager
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {['Real-time Dashboard', 'AI Classification', 'Analytics & SLAs', 'Role-based Access', 'Secure & Compliant']
                .map((pill) => (
                  <li key={pill} className="text-xs text-operon-muted px-3 py-1 rounded-full border border-white/15 bg-white/5">
                    {pill}
                  </li>
                ))}
            </ul>
          </motion.section>

          {/* ----------- AUTH CARD ----------- */}
          <motion.aside
            variants={fade}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.05 }}
            className="w-full"
          >
            <div className="relative">
              {/* soft glow border */}
              <div
                aria-hidden="true"
                className="absolute -inset-0.5 rounded-2xl blur opacity-70"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-operon-charcoal text-center mb-2">Login</h2>

                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
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
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm text-gray-600 mb-1">Password</span>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-14 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute inset-y-0 right-2 my-1 px-2 text-xs rounded-md border text-gray-600 hover:text-operon-blue"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-operon-blue hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition"
                  >
                    {busy ? 'Signing in…' : 'Login'}
                  </button>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <Link to="/reset" className="hover:underline">Forgot password?</Link>
                    <Link to="/signup" className="text-operon-blue hover:underline">Create account</Link>
                  </div>

                  <p className="text-[12px] text-gray-500 text-center pt-2">
                    By continuing you agree to our{' '}
                    <Link to="/terms" className="underline hover:text-operon-blue">Terms</Link> and{' '}
                    <Link to="/privacy-policy" className="underline hover:text-operon-blue">Privacy Policy</Link>.
                  </p>
                </form>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* slim feature ticks */}
        <div className="mt-16 mb-10 grid grid-cols-2 sm:grid-cols-4 gap-6 opacity-80">
          {['Real-time', 'AI-first', 'SLA-aware', 'Secure by design'].map((t) => (
            <div key={t} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-sm text-operon-muted">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
