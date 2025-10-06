import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function AuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
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

    if (!hotels || hotels.length === 0) { setBusy(false); navigate('/onboarding', { replace: true }); return; }

    setBusy(false);
    navigate('/property-picker', { replace: true });
  }

  return (
    <main className="relative min-h-dvh flex items-center justify-center px-4 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-0 h-[34rem] w-[34rem] rounded-full blur-3xl"
           style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-0 h-[38rem] w-[38rem] rounded-full blur-[90px]"
           style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }} />

      <motion.div variants={fade} initial="initial" animate="animate" className="w-full max-w-md">
        <div className="relative">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl blur opacity-70"
               style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }} />
          <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
            <h1 className="text-2xl font-semibold text-operon-charcoal text-center mb-2">Login</h1>

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
                  disabled={busy}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue disabled:opacity-60"
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
                    disabled={busy}
                    className="w-full px-4 py-2 pr-14 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue disabled:opacity-60"
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
                <button type="button" onClick={() => setForgotOpen(true)} className="hover:underline">
                  Forgot password?
                </button>
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
      </motion.div>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </main>
  );
}
