// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // 1) fetch auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2) listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session?.user) {
          // check if user has a hotel_id in their profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('hotel_id')
            .eq('id', session.user.id)
            .maybeSingle();    // ← use maybeSingle so missing row isn't a 406

          // if there's any real error or no hotel_id, force onboarding
          setNeedsOnboarding(!!error || !profile?.hotel_id);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // you can render a spinner here if you like
    return null;
  }

  if (!session) {
    // not signed in → go to login
    return <Navigate to="/login" replace />;
  }

  if (needsOnboarding) {
    // signed in but no property set up yet → onboarding
    return <Navigate to="/onboarding" replace />;
  }

  // otherwise, render the protected content
  return children;
}

