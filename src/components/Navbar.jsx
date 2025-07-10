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

  // Property context
  const { properties, currentProperty, switchProperty, loading: propLoading } = useContext(PropertyContext);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handlePropertyChange = async e => {
    const selected = properties.find(p => p.id === e.target.value);
    if (selected) {
      await switchProperty(selected);
      navigate(`/dashboard/${selected.id}`);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        key={location.pathname}
        className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm fixed top-0 left-0 z-10"
        variants={navVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoFull} alt="Operon Logo" className="h-8 sm:h-10" />
            <span className="text-xl font-bold text-operon-charcoal hidden sm:block">Operon</span>
          </Link>

          {/* Property selector dropdown */}
          {session && !propLoading && properties?.length > 0 && (
            <select
              value={currentProperty?.id || ''}
              onChange={handlePropertyChange}
              className="border rounded px-2 py-1 text-sm"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* Only show About/Learn More if NOT logged in */}
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

          {/* Show dashboard, analytics, settings for logged in user */}
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
      </motion.nav>
    </AnimatePresence>
  );
}
