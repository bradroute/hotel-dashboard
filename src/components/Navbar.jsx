// src/components/Navbar.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { PropertyContext } from '../contexts/PropertyContext';
import logoFull from '../assets/logo-icon2.png';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Property context
  const { properties, currentProperty, switchProperty } = useContext(PropertyContext);

  useEffect(() => {
    // Fetch Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm fixed top-0 left-0 z-10">
      <Link to="/" className="flex items-center gap-2">
        <img src={logoFull} alt="Operon Logo" className="h-8 sm:h-10" />
        <span className="text-xl font-bold text-operon-charcoal hidden sm:block">Operon</span>
      </Link>

      <div className="flex items-center gap-6">
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

        {/* Property selector */}
        {session && properties.length > 0 && (
          <select
            value={currentProperty?.id || ''}
            onChange={e => {
              const sel = properties.find(p => p.id === e.target.value);
              switchProperty(sel);
            }}
            className="border rounded p-1 text-sm"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type})
              </option>
            ))}
          </select>
        )}

        {session && currentPath !== '/dashboard' && (
          <Link
            to="/dashboard"
            className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
          >
            Dashboard
          </Link>
        )}
        {session && currentPath !== '/analytics' && (
          <Link
            to="/analytics"
            className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
          >
            Analytics
          </Link>
        )}
        {session && currentPath !== '/settings' && (
          <Link
            to="/settings"
            className="text-operon-blue hover:underline font-medium text-sm sm:text-base"
          >
            Settings
          </Link>
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
  );
}
