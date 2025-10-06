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

import Landing from './pages/Landing';
import AuthLogin from './pages/AuthLogin';

import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';
import SignUp from './pages/SignUp';
import About from './pages/About';
import LearnMore from './pages/LearnMore';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import OnboardingPage from './pages/OnboardingPage';
import PropertyPicker from './pages/PropertyPicker';
import Help from './pages/Help';
import ResetPasswordPage from './pages/ResetPassword';

import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { supabase } from './utils/supabaseClient';
import { AnimatePresence } from 'framer-motion';

/** Global, full-bleed background glows. Never clip, never reveal body white. */
function BackgroundOrbs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-visible">
      <div
        className="absolute top-[-14rem] left-[-28rem] h-[44rem] w-[44rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(59,130,246,.25), rgba(59,130,246,0))'
        }}
      />
      <div
        className="absolute bottom-[-16rem] right-[-22rem] h-[46rem] w-[46rem] rounded-full blur-[90px]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(34,211,238,.22), rgba(34,211,238,0))'
        }}
      />
    </div>
  );
}

function AppContent({ session }) {
  const location = useLocation();
  const isReset = location.pathname.startsWith('/reset');
  const isLanding = location.pathname === '/';
  const hideGlobalOrbs = isLanding; // Landing has its own visual background

  const publicPaths = [
    '/',               // landing
    '/about',
    '/learn-more',
    '/login',
    '/signup',
    '/privacy-policy',
    '/terms',
    '/help'
  ];

  const showFooter = isLanding || publicPaths.includes(location.pathname);

  return (
    // Establish stacking context and keep all app content above the z-0 orbs
    <div className="relative z-10 flex flex-col min-h-screen">
      {!hideGlobalOrbs && <BackgroundOrbs />}

      {!isReset && !isLanding && <Navbar />}

      <main className="flex-1 w-full px-4">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public marketing */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/help" element={<Help />} />

            {/* Auth */}
            <Route
              path="/login"
              element={session ? <Navigate to="/property-picker" replace /> : <AuthLogin />}
            />
            <Route
              path="/signup"
              element={session ? <Navigate to="/property-picker" replace /> : <SignUp />}
            />

            {/* Password reset (public) */}
            <Route path="/reset" element={<ResetPasswordPage />} />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Property Picker */}
            <Route
              path="/property-picker"
              element={
                <ProtectedRoute>
                  <PropertyPicker />
                </ProtectedRoute>
              }
            />

            {/* App pages */}
            <Route
              path="/dashboard/:hotelId"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/:hotelId"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/:hotelId"
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
                  ? <Navigate to="/property-picker" replace />
                  : <Navigate to="/" replace />
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <PropertyProvider>
        <AppContent session={session} />
      </PropertyProvider>
    </Router>
  );
}
