import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';

const site = (process.env.REACT_APP_SITE_URL || window.location.origin).replace(/\/+$/,'');
const RESET_URL = `${site}/reset`;

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: RESET_URL,
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  function closeAndReset() {
    setEmail(''); setSent(false); setErr(null); setLoading(false);
    onClose?.();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-modal role="dialog">
          <div className="absolute inset-0 bg-black/40" onClick={closeAndReset} />
          <motion.div
            className="relative bg-white rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl"
            initial={{ scale: .92, y: 48, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: .92, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            onClick={(e)=>e.stopPropagation()}
          >
            <div aria-hidden className="pointer-events-none absolute -inset-0.5 rounded-2xl blur opacity-60"
                 style={{background:'linear-gradient(135deg, rgba(59,130,246,.30), rgba(34,211,238,.22))'}}/>
            <button className="absolute top-2.5 right-3 z-10 text-xl text-gray-500 hover:text-gray-800"
                    onClick={closeAndReset} aria-label="Close dialog">×</button>

            <div className="relative space-y-4">
              {!sent ? (
                <>
                  <h3 className="text-xl font-semibold text-operon-charcoal">Reset your password</h3>
                  <p className="text-sm text-gray-600">Enter your account email. We’ll send a secure reset link.</p>
                  {err && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                      <span className="block text-sm text-gray-600 mb-1">Email</span>
                      <input type="email" placeholder="you@company.com" value={email}
                             onChange={(e)=>setEmail(e.target.value)} autoFocus required
                             className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-operon-blue"/>
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" disabled={loading}
                              className="flex-1 inline-flex items-center justify-center gap-2 bg-operon-blue text-white px-4 py-2 rounded-lg hover:bg-blue-400 disabled:opacity-60">
                        {loading && <span className="h-4 w-4 inline-block border-2 border-white/70 border-t-transparent rounded-full animate-spin" />}
                        {loading ? 'Sending…' : 'Send reset link'}
                      </button>
                      <button type="button" onClick={closeAndReset}
                              className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50">Cancel</button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-operon-charcoal">Check your inbox</h3>
                  <p className="text-sm text-gray-600">We emailed a reset link to <b>{email}</b>. The link expires soon.</p>
                  <button onClick={closeAndReset}
                          className="w-full rounded-lg bg-operon-blue px-4 py-2 text-white hover:bg-blue-400">Close</button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
