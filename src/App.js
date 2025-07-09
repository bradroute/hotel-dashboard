// src/App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignUp';
import About from './pages/About';
import LearnMore from './pages/LearnMore';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import OnboardingPage from './pages/OnboardingPage';
import PropertyPicker from './pages/PropertyPicker';   // <-- ADD THIS LINE
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import { supabase } from './utils/supabaseClient';

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
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
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

        {/* Onboarding route */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Property Picker route */}
        <Route
          path="/property-picker"
          element={
            <ProtectedRoute>
              <PropertyPicker />
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

      {/* Footer only on public pages */}
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
      <PropertyProvider>
        <div className="max-w-7xl mx-auto px-4">
          <AppRoutes session={session} />
        </div>
      </PropertyProvider>
    </Router>
  );
}
