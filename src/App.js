// src/App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignUp';
import About from './pages/About';
import LearnMore from './pages/LearnMore';
import PrivacyPolicy from './pages/PrivacyPolicy';           // NEW
import TermsAndConditions from './pages/TermsAndConditions'; // NEW
import OnboardingPage from './pages/OnboardingPage';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';                   // NEW
import { supabase } from './utils/supabaseClient';

// Separate component to handle routing and footer logic inside Router context
function AppRoutes({ session }) {
  const location = useLocation();
  const publicPaths = [
    '/about',
    '/learn-more',
    '/login',
    '/signup',
    '/privacy-policy',
    '/terms'
  ];
  const showFooter = publicPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/about" element={<About />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />  {/* NEW */}
        <Route path="/terms" element={<TermsAndConditions />} />    {/* NEW */}
        <Route
          path="/login"
          element={
            session
              ? <Navigate to="/dashboard" replace />
              : <LoginPage />
          }
        />
        <Route
          path="/signup"
          element={
            session
              ? <Navigate to="/dashboard" replace />
              : <SignUp />
          }
        />

        {/* Onboarding route for authenticated users */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

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

      {/* Show footer on public-facing pages only */}
      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Initialize session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="max-w-7xl mx-auto px-4">
        <AppRoutes session={session} />
      </div>
    </Router>
  );
}
