import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [stage, setStage] = useState('verifying'); // verifying | form | done | invalid
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // parse token_hash from query or hash fragment
  function getTokenHash() {
    const qToken = params.get('token_hash');
    if (qToken) return qToken;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return hash.get('token_hash');
  }
  function getType() {
    const q = params.get('type') || new URLSearchParams(window.location.hash.replace(/^#/, '')).get('type');
    return q;
  }

  useEffect(() => {
    const type = getType();
    const token_hash = getTokenHash();

    if (type === 'recovery' && token_hash) {
      supabase.auth.verifyOtp({ type: 'recovery', token_hash })
        .then(({ error }) => setStage(error ? 'invalid' : 'form'));
      return;
    }

    // Fallback for providers that send ?code=... (rare in recovery)
    const code = params.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(window.location.href)
        .then(({ error }) => setStage(error ? 'invalid' : 'form'));
      return;
    }

    setStage('invalid');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitNewPassword(e) {
    e.preventDefault();
    if (pwd.length < 8) { setErr('Use at least 8 characters.'); return; }
    if (pwd !== pwd2)   { setErr('Passwords do not match.'); return; }
    setLoading(true); setErr(null);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) setErr(error.message);
    else setStage('done');
  }

  if (stage === 'verifying') return <Shell><p>Verifying link…</p></Shell>;
  if (stage === 'invalid')  return <Shell><Notice title="Invalid or expired link" text="Request a new reset link from the login page." /></Shell>;
  if (stage === 'done')     return <Shell><Notice title="Password updated" text="You can now log in with your new password." button={{label:'Back to Login', onClick:()=>navigate('/login')}} /></Shell>;

  return (
    <Shell>
      <h2 className="text-2xl font-semibold text-operon-charcoal mb-2">Create a new password</h2>
      <form onSubmit={submitNewPassword} className="space-y-4">
        <label className="block">
          <span className="block text-sm text-gray-600 mb-1">New password</span>
          <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} autoFocus required
                 className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue"/>
        </label>
        <label className="block">
          <span className="block text-sm text-gray-600 mb-1">Confirm password</span>
          <input type="password" value={pwd2} onChange={(e)=>setPwd2(e.target.value)} required
                 className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue"/>
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400 disabled:opacity-60">
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

function Notice({ title, text, button }) {
  return (
    <div className="rounded-xl border bg-white px-5 py-4 shadow">
      <div className="text-base font-medium text-operon-charcoal">{title}</div>
      <div className="text-sm text-gray-600 mt-1">{text}</div>
      {button && (
        <button onClick={button.onClick}
                className="mt-3 rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400">
          {button.label}
        </button>
      )}
    </div>
  );
}
