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
import PropertyPicker from './pages/PropertyPicker';
import Help from './pages/Help';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { supabase } from './utils/supabaseClient';
import { AnimatePresence } from 'framer-motion';

// ✅ NEW: global fixed gradient background
import BackgroundOrbs from './components/BackgroundOrbs';

function AppContent({ session }) {
  const location = useLocation();
  const publicPaths = [
    '/about',
    '/learn-more',
    '/login',
    '/signup',
    '/privacy-policy',
    '/terms',
    '/help'
  ];
  const showFooter = publicPaths.includes(location.pathname);

  return (
    // isolate creates a clean stacking context; orbs sit behind everything
    <div className="relative isolate min-h-screen flex flex-col bg-operon-background">
      <BackgroundOrbs /> {/* rendered once for the whole app */}

      <Navbar /> {/* already has its own z-index */}

      {/* lift all routed content above the background */}
      <main className="relative z-10 flex-1 w-full px-4">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/about" element={<About />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/help" element={<Help />} />
            <Route
              path="/login"
              element={session ? <Navigate to="/property-picker" replace /> : <LoginPage />}
            />
            <Route
              path="/signup"
              element={session ? <Navigate to="/property-picker" replace /> : <SignUp />}
            />

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

            {/* Dashboard, Analytics, Settings */}
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
                  : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      {/* keep footer above background too */}
      {showFooter && (
        <div className="relative z-10">
          <Footer />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
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
