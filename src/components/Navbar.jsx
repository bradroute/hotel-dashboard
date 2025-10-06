// src/components/Navbar.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { PropertyContext } from '../contexts/PropertyContext';
import logoFull from '../assets/logo-icon2.png';
import { motion, AnimatePresence } from 'framer-motion';

const navVariants = {
  initial: { opacity: 0, y: -25 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -25, transition: { duration: 0.2 } },
};

export default function Navbar() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const {
    properties,
    currentProperty,
    switchProperty,
    loading: propLoading,
  } = useContext(PropertyContext);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const handlePropertyChange = async (e) => {
    const id = e.target.value || null;
    if (!id || currentProperty?.id === id) return;

    const selected = properties.find((p) => p.id === id);
    if (!selected) return;

    await switchProperty(selected);
    if (!currentPath.startsWith('/property-picker')) {
      navigate(`/dashboard/${selected.id}`, { replace: true });
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.header
        key={location.pathname}
        variants={navVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-x-0 top-0 z-50 bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur border-b border-black/5"
      >
        {/* Full-bleed bar; items hug edges */}
        <nav className="w-full h-16 px-3 sm:px-4 md:px-6 flex items-center justify-between">
          {/* Left cluster */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={logoFull} alt="Operon Logo" className="h-8 sm:h-10" />
              <span className="text-xl font-bold text-operon-charcoal hidden sm:block">Operon</span>
            </Link>

            {/* Property switcher only when authenticated and properties loaded */}
            {session && !propLoading && properties?.length > 0 && (
              <select
                value={currentProperty?.id || ''}
                onChange={handlePropertyChange}
                className="border rounded px-2 py-1 text-sm max-w-[240px] truncate"
              >
                <option value="" disabled>
                  Select property…
                </option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type || 'hotel'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            {/* Public links when logged out */}
            {!session && (
              <>
                <Link
                  to="/about"
                  className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
                >
                  About
                </Link>
                <Link
                  to="/learn-more"
                  className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
                >
                  Learn More
                </Link>
                {/* Secondary auth link */}
                <Link
                  to="/login"
                  className="text-operon-blue/90 hover:text-operon-blue font-medium text-sm sm:text-base"
                >
                  Log in
                </Link>
                {/* Primary CTA: Book demo (marketing-first) */}
                <a
                  href="/book"
                  className="bg-operon-blue text-white font-medium px-3 sm:px-4 py-1.5 rounded hover:bg-blue-400 text-sm sm:text-base"
                >
                  Book demo
                </a>
              </>
            )}

            {/* App links when authenticated */}
            {session && currentProperty?.id && (
              <>
                {currentPath !== `/dashboard/${currentProperty.id}` && (
                  <Link
                    to={`/dashboard/${currentProperty.id}`}
                    className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
                  >
                    Dashboard
                  </Link>
                )}
                {currentPath !== `/analytics/${currentProperty.id}` && (
                  <Link
                    to={`/analytics/${currentProperty.id}`}
                    className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
                  >
                    Analytics
                  </Link>
                )}
                {currentPath !== `/settings/${currentProperty.id}` && (
                  <Link
                    to={`/settings/${currentProperty.id}`}
                    className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
                  >
                    Settings
                  </Link>
                )}
                {currentPath !== '/help' && (
                  <Link
                    to="/help"
                    className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
                  >
                    Help
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-operon-blue text-white font-medium px-3 sm:px-4 py-1.5 rounded hover:bg-blue-400 text-sm sm:text-base"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </motion.header>
    </AnimatePresence>
  );
}
