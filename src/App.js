// src/App.js

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';
import Dashboard from './Dashboard';
import Analytics from './pages/Analytics';
import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './utils/supabaseClient';

import logoIcon from './assets/logo-icon.png';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
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
  };

  return (
    <Router>
      {session && (
        <nav className="flex justify-between items-center bg-white px-6 py-4 shadow-sm border-b border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <img
                src={logoIcon}
                alt="Operon"
                className="max-h-[32px] w-auto object-contain"
              />
            </Link>
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="text-operon-blue font-medium hover:underline transition"
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className="text-operon-blue font-medium hover:underline transition"
              >
                Analytics
              </Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-operon-blue text-white font-medium py-2 px-4 rounded hover:bg-blue-400 transition"
          >
            Logout
          </button>
        </nav>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <Routes>
          <Route
            path="/login"
            element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={session ? <Navigate to="/dashboard" replace /> : <SignUp />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              session
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
