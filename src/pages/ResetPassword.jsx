// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // grab recovery token from URL (query or hash)
  const params = new URLSearchParams(window.location.search);
  const pick = (k) =>
    params.get(k) ||
    new URLSearchParams(window.location.hash.replace(/^#/, '')).get(k);

  const token = pick('token') || pick('token_hash');
  const type = pick('type');

  useEffect(() => {
    if (type === 'recovery' && token) {
      supabase.auth.exchangeCodeForSession(token).catch(() => {
        setError('Invalid or expired link. Please request a new reset link.');
      });
    }
  }, [token, type]);

  async function handleReset(e) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-operon-background px-4">
      {/* background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-8 w-full max-w-md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-0.5 rounded-2xl blur opacity-50"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
        />

        <div className="relative">
          <h1 className="text-2xl font-bold text-operon-charcoal text-center">
            Create a new password
          </h1>

          {error && (
            <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
          )}
          {success && (
            <p className="mt-3 text-sm text-green-600 text-center">
              Password updated! Redirecting…
            </p>
          )}

          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-operon-blue"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-operon-blue"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-operon-blue text-white font-medium py-2.5 rounded-lg hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
