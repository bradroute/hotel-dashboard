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
    if (!id || currentProperty?.id === id) return;

    const selected = properties.find((p) => p.id === id);
    if (!selected) return;

    await switchProperty(selected);
    if (!currentPath.startsWith('/property-picker')) {
      navigate(`/dashboard/${selected.id}`, { replace: true });
    }
  };

  const linkBase =
    'font-medium text-sm sm:text-base text-operon-blue hover:text-operon-blue underline-offset-4 hover:underline';

  return (
    <AnimatePresence mode="wait">
      <motion.header
        key={location.pathname}
        variants={navVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur border-b border-black/5"
      >
        <nav className="w-full h-16 px-3 sm:px-4 md:px-6 flex items-center justify-between">
          {/* Left cluster */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={logoFull} alt="Operon Logo" className="h-8 sm:h-10" />
              <span className="text-xl font-bold text-operon-charcoal hidden sm:block">Operon</span>
            </Link>

            {session && !propLoading && properties?.length > 0 && (
              <select
                value={currentProperty?.id || ''}
                onChange={handlePropertyChange}
                className="border border-gray-300 bg-white text-gray-800 rounded px-2 py-1 text-sm max-w-[240px] truncate focus:outline-none focus:ring-2 focus:ring-operon-blue"
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
            {!session && (
              <>
                <Link to="/about" className={linkBase}>About</Link>
                <Link to="/learn-more" className={linkBase}>Learn More</Link>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-800 hover:border-operon-blue hover:text-operon-blue text-sm sm:text-base"
                >
                  Log in
                </Link>
                <a
                  href="mailto:info@operonops.com?subject=Operon%20Demo%20Request"
                  className="bg-operon-blue text-white font-medium px-3 sm:px-4 py-1.5 rounded hover:bg-blue-400 text-sm sm:text-base"
                >
                  Book demo
                </a>
              </>
            )}

            {session && (
              <>
                {currentProperty?.id ? (
                  <>
                    {currentPath !== `/dashboard/${currentProperty.id}` && (
                      <Link
                        to={`/dashboard/${currentProperty.id}`}
                        className={linkBase}
                        aria-current={currentPath.includes('/dashboard') ? 'page' : undefined}
                      >
                        Dashboard
                      </Link>
                    )}
                    {currentPath !== `/analytics/${currentProperty.id}` && (
                      <Link
                        to={`/analytics/${currentProperty.id}`}
                        className={linkBase}
                        aria-current={currentPath.includes('/analytics') ? 'page' : undefined}
                      >
                        Analytics
                      </Link>
                    )}
                    {currentPath !== `/settings/${currentProperty.id}` && (
                      <Link
                        to={`/settings/${currentProperty.id}`}
                        className={linkBase}
                        aria-current={currentPath.includes('/settings') ? 'page' : undefined}
                      >
                        Settings
                      </Link>
                    )}
                  </>
                ) : (
                  currentPath !== '/property-picker' && (
                    <Link to="/property-picker" className={linkBase}>
                      Choose Property
                    </Link>
                  )
                )}

                {currentPath !== '/help' && <Link to="/help" className={linkBase}>Help</Link>}

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
