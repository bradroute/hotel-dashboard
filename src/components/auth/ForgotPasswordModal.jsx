// src/components/auth/ForgotPasswordModal.jsx
import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-2xl">
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-operon-charcoal">Reset your password</h3>
            <p className="text-sm text-gray-600">
              Enter your account email. We’ll send a secure reset link.
            </p>
            <input
              type="email"
              required
              autoFocus
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-operon-blue"
            />
            {err && <div className="text-sm text-red-600">{err}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400 disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-operon-charcoal">Check your inbox</h3>
            <p className="text-sm text-gray-600">
              We emailed a reset link to <b>{email}</b>. The link expires soon.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
