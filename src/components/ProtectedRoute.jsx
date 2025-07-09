// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ProtectedRoute({ children }) {
  const [session, setSession]             = useState(undefined); // undefined = “not yet loaded”
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checking, setChecking]           = useState(true);
  const location = useLocation();

  // 1) Listen to auth state
  useEffect(() => {
    // initial fetch
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    // subscription for future changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 2) Whenever session or path changes, re-check profile → onboarding status
  useEffect(() => {
    (async () => {
      // if session === undefined we’re still waiting on auth
      if (session === undefined) return;

      // if no session → no need to check profile
      if (session === null) {
        setNeedsOnboarding(false);
        setChecking(false);
        return;
      }

      setChecking(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('ProtectedRoute profile error', error);
          // force onboarding on error
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(!profile?.hotel_id);
        }
      } catch (err) {
        console.error('ProtectedRoute unknown error', err);
        setNeedsOnboarding(true);
      } finally {
        setChecking(false);
      }
    })();
  }, [session, location.pathname]);

  // 3) Show spinner / nothing while we’re fetching auth or profile
  if (session === undefined || checking) {
    return null;
  }

  // 4) Not signed in → kick to login
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 5) Signed in but no hotel_id → force onboarding
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // 6) Otherwise, show the protected page
  return children;
}
