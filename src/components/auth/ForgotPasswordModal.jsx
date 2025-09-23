import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.operonops.com/reset',
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div role="dialog" aria-modal="true" className="modal-backdrop">
      <div className="modal-card">
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <h3>Reset your password</h3>
            <p>Enter your account email. We’ll send a secure link.</p>
            <input
              type="email"
              required
              autoFocus
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {err && <div className="error">{err}</div>}
            <div className="row">
              <button disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <button type="button" className="ghost" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h3>Check your inbox</h3>
            <p>
              We emailed a reset link to <b>{email}</b>. The link expires soon.
            </p>
            <button onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
