// route: /reset
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
  if (stage === 'done')     return <Shell><h2>Password updated</h2><p>You can now log in with your new password.</p><button onClick={() => navigate('/login')}>Back to Login</button></Shell>;

  return (
    <Shell>
      <h2>Create a new password</h2>
      <form onSubmit={submitNewPassword}>
        <label>New password</label>
        <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} autoFocus required />
        <label>Confirm password</label>
        <input type="password" value={pwd2} onChange={(e)=>setPwd2(e.target.value)} required />
        {err && <div className="error">{err}</div>}
        <button disabled={loading}>{loading ? 'Saving…' : 'Update password'}</button>
      </form>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="auth-shell">
      <div className="card">{children}</div>
    </div>
  );
}
