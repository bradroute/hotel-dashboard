import React, { useContext, useEffect, useMemo, useState } from 'react';
import { PropertyContext } from '../contexts/PropertyContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AddPropertyForm from '../components/AddPropertyForm';

const SHOW_GRID_BG = false; // toggle faint grid if you want

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function PropertyPicker() {
  const { properties, switchProperty, loading } = useContext(PropertyContext);
  const navigate = useNavigate();

  const [selectingId, setSelectingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!loading && properties.length === 1) {
      handleSelect(properties[0]);
    }
    if (!loading && properties.length === 0) {
      navigate('/onboarding');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, loading]);

  async function handleSelect(property) {
    setSelectingId(property.id);
    try {
      await switchProperty(property);
      navigate(`/dashboard/${property.id}`);
    } finally {
      setSelectingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      p =>
        p.name?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        String(p.id)?.toLowerCase().includes(q)
    );
  }, [properties, query]);

  return (
    <>
      <main className="relative min-h-screen pt-24 overflow-hidden bg-operon-background">
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
        {SHOW_GRID_BG && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[.25]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(17,24,39,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.08) 1px, transparent 1px)',
              backgroundSize: '42px 42px, 42px 42px',
              maskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
            }}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* ---------- Intro / hero ---------- */}
            <motion.section variants={fade} initial="initial" animate="animate">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs text-operon-muted tracking-wide mb-4">
                Choose where to work
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-operon-charcoal">
                Select your{' '}
                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  property
                </span>
              </h1>

              <p className="mt-4 text-[17px] text-operon-muted max-w-2xl leading-relaxed">
                Pick a property to open its real-time dashboard. You can switch anytime from
                the navbar dropdown. Need to add another? Use the button below.
              </p>

              <ul className="mt-6 space-y-2">
                {['Instant switch between properties', 'Role-based access & audit trail', 'AI-ready routing by department'].map(t => (
                  <li key={t} className="flex items-center gap-3 text-sm text-operon-muted">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* ---------- Glassy picker card ---------- */}
            <motion.section
              variants={fade}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.05 }}
              className="w-full"
            >
              <div className="relative">
                {/* glow */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-0.5 rounded-2xl blur opacity-70"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
                />
                <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 max-w-lg mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold text-operon-charcoal">Your properties</h2>

                    {/* Search */}
                    <label className="relative w-full sm:w-56">
                      <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
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

                  {/* List */}
                  <div className="mt-5">
                    {loading ? (
                      <ul className="space-y-3">
                        {[0,1,2].map(i => (
                          <li key={i} className="animate-pulse rounded-lg border border-gray-200 p-4">
                            <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-3">
                        {filtered.map(prop => (
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

                  {/* Add property CTA */}
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
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      {/* ---------- Modal: Add Property ---------- */}
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
              {/* subtle glow ring */}
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
