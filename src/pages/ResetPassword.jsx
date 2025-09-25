// src/pages/ResetPassword.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [stage, setStage] = useState('verifying'); // verifying|form|done|invalid
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [err, setErr] = useState(null);
  const [debug, setDebug] = useState('');

  function pick(k) {
    const fromQuery = params.get(k);
    if (fromQuery) return fromQuery;
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return h.get(k);
  }

  useEffect(() => {
    const type = pick('type');
    const token_hash = pick('token_hash');

    setDebug(`href=${window.location.href} | type=${type || '-'} | token=${token_hash ? 'present' : 'missing'}`);

    if (type === 'recovery' && token_hash) {
      supabase.auth.verifyOtp({ type: 'recovery', token_hash })
        .then(({ error }) => setStage(error ? 'invalid' : 'form'));
    } else {
      // Fallback when provider sends ?code=...
      const code = pick('code');
      if (code) {
        supabase.auth.exchangeCodeForSession(window.location.href)
          .then(({ error }) => setStage(error ? 'invalid' : 'form'));
      } else {
        setStage('invalid');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitNewPassword(e) {
    e.preventDefault();
    if (pwd.length < 8) { setErr('Use at least 8 characters.'); return; }
    if (pwd !== pwd2)   { setErr('Passwords do not match.'); return; }
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) setErr(error.message);
    else setStage('done');
  }

  if (stage === 'verifying') return <Shell><p>Verifying link…</p></Shell>;
  if (stage === 'invalid')  return <Shell><Notice title="Invalid or expired link" text="Request a new reset link from the login page." debug={debug} /></Shell>;
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
        <button type="submit"
                className="w-full rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400">
          Update password
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

function Notice({ title, text, button, debug }) {
  return (
    <div className="rounded-xl border bg-white px-5 py-4 shadow">
      <div className="text-base font-medium text-operon-charcoal">{title}</div>
      <div className="text-sm text-gray-600 mt-1">{text}</div>
      {debug && <div className="mt-3 text-[11px] text-gray-400 break-all">{debug}</div>}
      {button && (
        <button onClick={button.onClick}
                className="mt-3 rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400">
          {button.label}
        </button>
      )}
    </div>
  );
}
