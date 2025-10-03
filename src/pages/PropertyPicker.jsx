// src/pages/PropertyPicker.jsx
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { PropertyContext } from '../contexts/PropertyContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import AddPropertyForm from '../components/AddPropertyForm';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function PropertyPicker() {
  const { properties, switchProperty, loading } = useContext(PropertyContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [selectingId, setSelectingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [query, setQuery] = useState('');

  const fromOnboarding =
    location.state?.onboarding === true ||
    new URLSearchParams(location.search).get('from') === 'onboarding';

  useEffect(() => {
    if (!loading && properties.length === 0 && !fromOnboarding) {
      navigate('/onboarding', { replace: true });
    }
  }, [loading, properties.length, fromOnboarding, navigate]);

  useEffect(() => {
    if (!fromOnboarding) return;
    if (properties.length > 0) return;

    let tries = 0;
    let cancelled = false;

    const poll = async () => {
      tries += 1;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: hotels, error } = await supabase
        .from('hotels')
        .select('id')
        .eq('profile_id', user.id);

      if (!cancelled && !error && (hotels?.length || 0) > 0) {
        window.location.reload();
      }
    };

    const id = setInterval(() => {
      if (tries >= 6) {
        clearInterval(id);
        return;
      }
      poll();
    }, 5000);

    poll();

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [fromOnboarding, properties.length]);

  async function handleSelect(property) {
    setSelectingId(property.id);
    try {
      await switchProperty(property);
      navigate(`/dashboard/${property.id}`, { replace: true });
    } finally {
      setSelectingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        String(p.id)?.toLowerCase().includes(q)
    );
  }, [properties, query]);

  const showPendingSetup = fromOnboarding && !loading && properties.length === 0;

  return (
    <>
      {/* Global background handled in App; no local orbs/clipping */}
      <main className="relative min-h-dvh pt-24">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div variants={fade} initial="initial" animate="animate" className="mb-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-operon-charcoal">
              Select your{' '}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                property
              </span>
            </h1>
          </motion.div>

          <motion.section variants={fade} initial="initial" animate="animate" transition={{ delay: 0.05 }}>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-0.5 rounded-2xl blur opacity-70"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-operon-charcoal">Your properties</h2>

                  <label className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name or type"
                      className="w-full bg-white border border-gray-300 rounded-lg px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </span>
                  </label>
                </div>

                <div className="mt-5">
                  {loading ? (
                    <ul className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <li key={i} className="animate-pulse rounded-lg border border-gray-200 p-4">
                          <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                          <div className="h-3 w-24 bg-gray-200 rounded" />
                        </li>
                      ))}
                    </ul>
                  ) : showPendingSetup ? (
                    <div className="border border-dashed rounded-lg p-6 text-center">
                      <div className="mx-auto mb-3 h-6 w-6 rounded-full border-2 border-gray-300 border-t-operon-blue animate-spin" />
                      <p className="text-sm text-gray-600">
                        Please wait a few moments while we finish setting up your property…
                        <br />
                        This can take ~15–30 seconds after onboarding. We’ll refresh automatically.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-operon-blue text-white px-3 py-2 text-sm hover:bg-blue-400"
                      >
                        Refresh now
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {filtered.map((prop) => (
                        <li
                          key={prop.id}
                          className="rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md hover:-translate-y-[1px] transition"
                        >
                          <div>
                            <div className="font-semibold text-operon-charcoal">{prop.name}</div>
                            <div className="mt-1 inline-flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-operon-blue border border-blue-100">
                                {prop.type}
                              </span>
                              <span className="text-[11px] text-gray-400">ID: {prop.id}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSelect(prop)}
                            disabled={!!selectingId}
                            className="inline-flex items-center gap-2 bg-operon-blue text-white px-4 py-2 rounded-lg hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                          >
                            {selectingId === prop.id ? (
                              <>
                                <span className="h-4 w-4 inline-block border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                                Selecting…
                              </>
                            ) : (
                              <>
                                Select
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
                                </svg>
                              </>
                            )}
                          </button>
                        </li>
                      ))}

                      {!loading && filtered.length === 0 && (
                        <li className="text-sm text-gray-500 border border-dashed rounded-lg p-6 text-center">
                          No matches for “{query}”. Try a different search or add a property.
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {!showPendingSetup && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 text-operon-blue hover:underline text-sm"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-operon-blue/40">
                        +
                      </span>
                      Add a new property
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddModal(false)} />
            <motion.div
              className="relative bg-white rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.92, y: 48, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-0.5 rounded-2xl blur opacity-60"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.30), rgba(34,211,238,.22))' }}
              />
              <button
                className="absolute top-2.5 right-3 z-10 text-xl text-gray-500 hover:text-gray-800"
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
              <div className="relative">
                <AddPropertyForm onClose={() => setShowAddModal(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
