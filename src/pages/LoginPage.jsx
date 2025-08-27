import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import logoFull from '../assets/logo-icon2.png';
import { motion } from 'framer-motion';

const fade = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
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

    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setBusy(false); setError(authErr.message); return; }
    const userId = data.user.id;

    const { data: hotels, error: hotelsErr } = await supabase
      .from('hotels')
      .select('id')
      .eq('profile_id', userId);
    if (hotelsErr) { setBusy(false); setError('Login succeeded but failed to fetch properties.'); return; }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', userId)
      .single();
    if (profileErr) { setBusy(false); setError('Login succeeded but failed to fetch profile.'); return; }

    if (!hotels || hotels.length === 0) { setBusy(false); navigate('/onboarding'); return; }
    if (!profile?.hotel_id)         { setBusy(false); navigate('/property-picker'); return; }

    setBusy(false);
    // if your router uses /dashboard/:id, swap for: navigate(`/dashboard/${profile.hotel_id}`)
    navigate('/dashboard');
  }

  return (
    <main className="relative min-h-screen pt-24 overflow-hidden bg-operon-background">
      {/* --- Background: soft grid + gradient orbs --- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px, 40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(99,179,237,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(56,189,248,.25), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ---------- Left: premium hero ---------- */}
          <motion.section variants={fade} initial="initial" animate="animate">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs text-operon-muted tracking-wide mb-4">
              Hotels • Apartments • Condos • Restaurants
            </div>

            <div className="flex items-center gap-3 mb-4">
              <img src={logoFull} alt="Operon" className="h-12 sm:h-14" />
              <p className="text-sm text-operon-muted hidden sm:block">Modern property operations</p>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] text-operon-charcoal">
              The modern <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">operations platform</span>
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

            {/* Trust row */}
            <p className="mt-5 text-sm italic text-gray-500">
              “Operon cut our response times in half.” — Front Desk Manager
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                'Real-time Dashboard',
                'AI Classification',
                'Analytics & SLAs',
                'Role-based Access',
                'Secure & Compliant',
              ].map((pill) => (
                <span
                  key={pill}
                  className="text-xs text-operon-muted px-3 py-1 rounded-full border border-white/15 bg-white/5"
                >
                  {pill}
                </span>
              ))}
            </div>
          </motion.section>

          {/* ---------- Right: glassy auth card ---------- */}
          <motion.aside
            variants={fade}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.05 }}
            className="w-full"
          >
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-0.5 rounded-2xl blur opacity-60"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))',
                }}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-operon-charcoal text-center mb-2">
                  Login
                </h2>

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
                    <input
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                      required
                    />
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
                </form>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* ---------- Optional: slim “as seen in / fits brand” bar ---------- */}
        <div className="mt-16 mb-10 grid grid-cols-2 sm:grid-cols-4 gap-6 opacity-70">
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
