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
      // 1) get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setSession(null);
        setLoading(false);
        return;
      }
      setSession(session);

      // 2) fetch profile to see if they've completed onboarding
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('ProtectedRoute: failed to load profile', error);
        // fallback to sending them through onboarding
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(!profile?.hotel_id);
      }

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return null; // or a spinner
  }

  if (!session) {
    // not authenticated → go to login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (needsOnboarding && location.pathname !== '/onboarding') {
    // authenticated but no hotel → force onboarding
    return <Navigate to="/onboarding" replace />;
  }

  // all good → render protected content
  return children;
}
