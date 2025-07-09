// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1) Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setSession(null);
        setLoading(false);
        return;
      }
      setSession(session);

      // 2) Fetch profile to see if they've completed onboarding
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('ProtectedRoute: failed to load profile', error);
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(!profile?.hotel_id);
      }

      setLoading(false);
    })();
    // Re-run whenever path changes (so we re-check after onboarding completes)
  }, [location.pathname]);

  if (loading) {
    return null; // or a spinner component
  }

  if (!session) {
    // Not authenticated → redirect to login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (needsOnboarding && location.pathname !== '/onboarding') {
    // Authenticated but hasn't set up a property → force onboarding
    return <Navigate to="/onboarding" replace />;
  }

  // All good → render the protected page
  return children;
}
