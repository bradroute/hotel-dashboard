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

  const { properties, currentProperty, switchProperty, loading: propLoading } =
    useContext(PropertyContext);

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
    if (!id) return;
    if (currentProperty?.id === id) return;

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
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoFull} alt="Operon Logo" className="h-8 sm:h-10" />
              <span className="text-xl font-bold text-operon-charcoal hidden sm:block">Operon</span>
            </Link>

            {session && !propLoading && properties?.length > 0 && (
              <select
                value={currentProperty?.id || ''}
                onChange={handlePropertyChange}
                className="border rounded px-2 py-1 text-sm"
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

          <div className="flex items-center gap-6">
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
              </>
            )}

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
              </>
            )}

            {session ? (
              <button
                onClick={handleLogout}
                className="bg-operon-blue text-white font-medium px-4 py-1.5 rounded hover:bg-blue-400 text-sm sm:text-base"
              >
                Logout
              </button>
            ) : currentPath === '/signup' ? (
              <Link
                to="/login"
                className="bg-operon-blue text-white font-medium px-4 py-1.5 rounded hover:bg-blue-400 text-sm sm:text-base"
              >
                Login
              </Link>
            ) : (
              <Link
                to="/signup"
                className="bg-operon-blue text-white font-medium px-4 py-1.5 rounded hover:bg-blue-400 text-sm sm:text-base"
              >
                Sign Up
              </Link>
            )}
          </div>
        </nav>
      </motion.header>
    </AnimatePresence>
  );
}
