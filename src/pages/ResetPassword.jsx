// src/pages/ResetPassword.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  // UI state
  const [stage, setStage] = useState('verifying'); // verifying | form | done | invalid
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  // Pull values from ?query or #hash (eslint: use window.location)
  const qs = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const pick = (k) => qs.get(k) || hash.get(k);

  useEffect(() => {
    const type = pick('type');
    const token_hash = pick('token_hash');

    // Correct recovery flow: verifyOtp creates an authenticated session
    if (type === 'recovery' && token_hash) {
      supabase.auth
        .verifyOtp({ type: 'recovery', token_hash })
        .then(({ error }) => setStage(error ? 'invalid' : 'form'));
      return;
    }

    // Fallback (rare): provider sends ?code=...
    const code = pick('code');
    if (code) {
      supabase.auth
        .exchangeCodeForSession(window.location.href)
        .then(({ error }) => setStage(error ? 'invalid' : 'form'));
      return;
    }

    setStage('invalid');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr(null);

    if (pwd.length < 8) { setErr('Use at least 8 characters.'); return; }
    if (pwd !== pwd2)   { setErr('Passwords do not match.'); return; }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSaving(false);

    if (error) setErr(error.message);
    else setStage('done');
  }

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-operon-background pt-24 px-4">
      {/* background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -left-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -right-40 h-[38rem] w-[38rem] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-operon-charcoal">
            Secure{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              password reset
            </span>
          </h1>
          <p className="mt-3 text-sm text-operon-muted">Set a new password to continue.</p>
        </div>

        {/* Card */}
        <section className="mx-auto max-w-md">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-0.5 rounded-2xl blur opacity-70"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
            />
            <div className="relative rounded-2xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-black/5">
              {stage === 'verifying' && (
                <StateCard title="Verifying link…" subtitle="One moment while we check your request." />
              )}

              {stage === 'invalid' && (
                <StateCard
                  title="Invalid or expired link"
                  subtitle="Request a new reset link from the login page."
                  actions={
                    <button
                      onClick={() => navigate('/login')}
                      className="mt-3 w-full rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400"
                    >
                      Back to Login
                    </button>
                  }
                />
              )}

              {stage === 'done' && (
                <StateCard
                  title="Password updated"
                  subtitle="You can now log in with your new password."
                  actions={
                    <button
                      onClick={() => navigate('/login')}
                      className="mt-3 w-full rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400"
                    >
                      Go to Login
                    </button>
                  }
                />
              )}

              {stage === 'form' && (
                <>
                  <h2 className="mb-2 text-center text-2xl font-semibold text-operon-charcoal">
                    Create a new password
                  </h2>

                  <form onSubmit={submit} className="space-y-4">
                    <label className="block">
                      <span className="mb-1 block text-sm text-gray-600">New password</span>
                      <input
                        type="password"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        autoFocus
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm text-gray-600">Confirm password</span>
                      <input
                        type="password"
                        value={pwd2}
                        onChange={(e) => setPwd2(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                      />
                    </label>

                    <p className="text-xs text-gray-500">
                      Use at least 8 characters. Avoid common or reused passwords.
                    </p>

                    {err && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {err}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-lg bg-operon-blue px-4 py-2 font-medium text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Update password'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StateCard({ title, subtitle, actions }) {
  return (
    <div className="text-center">
      <div className="text-lg font-medium text-operon-charcoal">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{subtitle}</div>
      {actions}
    </div>
  );
}
