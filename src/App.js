// src/App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/SettingsPage'; // ✅ NEW
import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignUp';
import About from './pages/About';
import LearnMore from './pages/LearnMore';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './utils/supabaseClient';

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

  return (
    <Router>
      <div className="max-w-7xl mx-auto px-4">
        <Routes>
          {/* Public routes */}
          <Route path="/about" element={<About />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/signup" element={session ? <Navigate to="/dashboard" replace /> : <SignUp />} />

          {/* Protected routes */}
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
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
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
