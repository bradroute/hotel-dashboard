import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

/**
 * Wrap your routes in <ProtectedRoute> to ensure:
 *  • the user is signed in
 *  • the user has completed onboarding (hotel_id set on their profile)
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState({ loading: true, session: null, hotelId: null });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    async function bootstrap() {
      try {
        // 1) Get session
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (!session) {
          setStatus({ loading: false, session: null, hotelId: null });
          return;
        }

        // 2) Fetch profile (robust: .maybeSingle() instead of .single())
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!isMounted) return;

        // Handle error or missing profile
        if (error || !profile) {
          // No profile (or error): send to onboarding (or handle as needed)
          setStatus({ loading: false, session, hotelId: null });
          return;
        }

        setStatus({ loading: false, session, hotelId: profile.hotel_id });
      } catch (err) {
        console.error('ProtectedRoute bootstrap error', err);
        if (isMounted) setStatus({ loading: false, session: null, hotelId: null });
      }
    }

    bootstrap();
    return () => { isMounted = false; };
  }, []);

  if (status.loading) {
    // You can render a spinner here if you want
    return null;
  }

  // Not logged in => go to login
  if (!status.session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isOnboarding = location.pathname === '/onboarding';

  // No profile or no hotel_id => onboarding (or property picker if you want, as discussed)
  if (!status.hotelId && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Completed onboarding but still on /onboarding => go to dashboard
  if (status.hotelId && isOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  // All good: render children
  return children;
}
