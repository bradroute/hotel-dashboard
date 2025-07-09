// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ProtectedRoute({ children }) {
  const [session, setSession]             = useState(undefined);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checking, setChecking]           = useState(true);
  const location = useLocation();

  // 1) load initial session + subscribe
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  // 2) whenever session or path changes, check if they have hotel_id
  useEffect(() => {
    (async () => {
      if (session === undefined) return;   // still loading auth
      if (!session) {
        setNeedsOnboarding(false);
        setChecking(false);
        return;
      }

      setChecking(true);
      try {
        // fetch profile row
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          // no profile row yet → force onboarding
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(!profile.hotel_id);
        }
      } catch (err) {
        console.error('ProtectedRoute:', err);
        setNeedsOnboarding(true);
      } finally {
        setChecking(false);
      }
    })();
  }, [session, location.pathname]);

  // 3) show nothing while loading
  if (session === undefined || checking) {
    return null;
  }

  // 4) if not signed in, go to login
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 5) if signed in but needs onboarding, force /onboarding
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // 6) otherwise show the protected page
  return children;
}
