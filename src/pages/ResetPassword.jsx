// src/pages/ResetPassword.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [stage, setStage] = useState('verifying'); // 'verifying'|'form'|'done'|'invalid'
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const type = params.get('type');
    const token = params.get('token_hash');
    if (type !== 'recovery' || !token) { setStage('invalid'); return; }

    supabase.auth.exchangeCodeForSession(window.location.href)
      .then(({ error }) => {
        if (error) setStage('invalid');
        else setStage('form');
      });
  }, [params]);

  async function submitNewPassword(e) {
    e.preventDefault();
    if (pwd.length < 8) { setErr('Use at least 8 characters.'); return; }
    if (pwd !== pwd2) { setErr('Passwords do not match.'); return; }
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) setErr(error.message);
    else setStage('done');
  }

  if (stage === 'verifying') return <Shell><p>Verifying link…</p></Shell>;
  if (stage === 'invalid')  return <Shell><h2>Invalid or expired link</h2><p>Request a new reset link from the login page.</p></Shell>;
  if (stage === 'done')     return <Shell><h2>Password updated</h2><p>You can now log in with your new password.</p><button onClick={() => navigate('/login')} className="mt-3 rounded-lg bg-operon-blue px-4 py-2 text-white">Back to Login</button></Shell>;

  return (
    <Shell>
      <h2 className="text-2xl font-semibold text-operon-charcoal mb-2">Create a new password</h2>
      <form onSubmit={submitNewPassword} className="space-y-4">
        <label className="block">
          <span className="block text-sm text-gray-600 mb-1">New password</span>
          <input
            type="password"
            value={pwd}
            onChange={(e)=>setPwd(e.target.value)}
            autoFocus
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-gray-600 mb-1">Confirm password</span>
          <input
            type="password"
            value={pwd2}
            onChange={(e)=>setPwd2(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue"
          />
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400 disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-dvh grid place-items-center bg-operon-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        {children}
      </div>
    </div>
  );
}
