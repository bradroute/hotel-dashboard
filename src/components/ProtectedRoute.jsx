import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

/**
 * Wrap your routes in <ProtectedRoute> to ensure:
 *  • the user is signed in
 *  • the user has at least one property (hotel) before proceeding
 *  • property-picker page is used for multi-property users
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState({ loading: true, session: null, propertyCount: 0 });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    async function bootstrap() {
      try {
        // 1) Get session
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (!session) {
          setStatus({ loading: false, session: null, propertyCount: 0 });
          return;
        }

        // 2) Fetch how many hotels this user owns
        const { data: hotels, error } = await supabase
          .from('hotels')
          .select('id')
          .eq('profile_id', session.user.id);

        if (!isMounted) return;

        if (error) {
          setStatus({ loading: false, session, propertyCount: 0 });
          return;
        }

        const count = hotels?.length || 0;
        setStatus({ loading: false, session, propertyCount: count });
      } catch (err) {
        console.error('ProtectedRoute bootstrap error', err);
        if (isMounted) setStatus({ loading: false, session: null, propertyCount: 0 });
      }
    }

    bootstrap();
    return () => { isMounted = false; };
  }, []);

  if (status.loading) {
    return null; // Spinner could go here
  }

  // Not logged in => login
  if (!status.session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isOnboarding     = location.pathname === '/onboarding';
  const isPropertyPicker = location.pathname === '/property-picker';

  // No hotels, not onboarding? => must onboard
  if (status.propertyCount === 0 && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Has multiple hotels, not on picker? => must pick
  if (status.propertyCount > 1 && !isPropertyPicker && !isOnboarding) {
    return <Navigate to="/property-picker" replace />;
  }

  // If they finish onboarding and have a hotel, but are still on /onboarding, go to picker (if multi) or dashboard (if single)
  if (isOnboarding && status.propertyCount > 0) {
    if (status.propertyCount === 1) {
      return <Navigate to="/dashboard" replace />;
    }
    if (status.propertyCount > 1) {
      return <Navigate to="/property-picker" replace />;
    }
  }

  // All good
  return children;
}
