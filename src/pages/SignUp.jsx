import React, { useState, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoMark from '../assets/logo-icon2.png'; // use the same mark as login for consistency

const SHOW_GRID_BG = false; // set true if you want the faint grid background

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 6); // 0–6
}

export default function SignUp() {
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const strength = useMemo(() => calcStrength(password), [password]);
  const strengthPct = (strength / 6) * 100;
  const strengthLabel = strength <= 2 ? 'Weak' : strength <= 4 ? 'Good' : 'Strong';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!agree) {
      setError('Please agree to the Terms and Privacy Policy.');
      return;
    }

    setBusy(true);
    // Pass account name into user metadata so it’s available after confirm
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { account_name: accountName } },
    });

    setBusy(false);

    if (signUpErr) {
      setError(signUpErr.message);
      return;
    }

    setSuccessMessage(
      'Welcome! Please check your email for a confirmation link. Once confirmed, log in to finish setup.'
    );
  }

  return (
    // Match Terms: dvh height, horizontal clip only, orbs scroll with page, seam fix
    <main className="relative min-h-dvh pt-24 overflow-x-clip bg-operon-background">
      {/* background accents (scroll with page) */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute top-[-12rem] left-0 -ml-px -translate-x-24
          h-[34rem] w-[34rem] rounded-full blur-3xl
        "
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute bottom-[-14rem] right-0
          h-[38rem] w-[38rem] rounded-full blur-[90px]
        "
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }}
      />
      {SHOW_GRID_BG && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[.25]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(17,24,39,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.08) 1px, transparent 1px)',
            backgroundSize: '42px 42px, 42px 42px',
            maskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* -------- Left: hero -------- */}
          <motion.section variants={fade} initial="initial" animate="animate">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs text-operon-muted tracking-wide mb-4">
              Create your Operon account
            </div>

            <div className="flex items-center gap-3 mb-3">
              <img src={logoMark} alt="Operon" className="h-12 sm:h-14" />
              <span className="text-sm text-operon-muted hidden sm:block">
                Modern property operations
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-operon-charcoal">
              Get started in{' '}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                minutes
              </span>
            </h1>

            <p className="mt-4 text-[17px] text-operon-muted max-w-2xl leading-relaxed">
              Set up your account, invite your team, and start resolving requests faster.
              No long onboarding—just results.
            </p>

            <ul className="mt-6 space-y-2">
              {[
                'Unlimited requests during trial',
                'AI classification & analytics built in',
                'Role-based access and audit trail',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-operon-muted">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* -------- Right: sign up card -------- */}
          <motion.aside
            variants={fade}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.05 }}
            className="w-full"
          >
            <div className="relative">
              {/* glow (kept inside card bounds to avoid horizontal scrollbars) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl blur opacity-70"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-operon-charcoal text-center mb-2">
                  Sign Up
                </h2>

                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700" role="status">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block">
                    <span className="block text-sm text-gray-600 mb-1">Account Name</span>
                    <input
                      type="text"
                      placeholder="e.g., Hotel Crosby"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm text-gray-600 mb-1">Email</span>
                    <input
                      type="email"
                      autoComplete="email"
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
                        autoComplete="new-password"
                        placeholder="Create a strong password"
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

                    {/* strength meter */}
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${strengthPct}%`,
                            background:
                              strength <= 2
                                ? '#f43f5e'
                                : strength <= 4
                                ? '#f59e0b'
                                : '#10b981',
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Password strength: {strengthLabel}</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="h-4 w-4"
                      required
                    />
                    I agree to the{' '}
                    <Link to="/terms" className="underline hover:text-operon-blue">Terms</Link> and{' '}
                    <Link to="/privacy-policy" className="underline hover:text-operon-blue">Privacy Policy</Link>.
                  </label>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-operon-blue hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition"
                  >
                    {busy ? 'Creating account…' : 'Sign Up'}
                  </button>

                  <div className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-operon-blue hover:underline">Login</Link>
                  </div>
                </form>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
