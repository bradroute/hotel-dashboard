// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, matchPath } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

/**
 * Guards private routes:
 *  • requires auth
 *  • fetches user's properties
 *  • NEVER redirects away from /property-picker
 *  • sends users without any properties to /onboarding (but never bounce picker)
 *  • non-property private paths fall back to /property-picker
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState({
    loading: true,
    session: null,
    hotels: [],
    propertyCount: 0,
  });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (!session) {
          setStatus({ loading: false, session: null, hotels: [], propertyCount: 0 });
          return;
        }

        const { data: hotels, error } = await supabase
          .from('hotels')
          .select('id')
          .eq('profile_id', session.user.id);

        if (!isMounted) return;

        if (error) {
          console.error('ProtectedRoute hotels error:', error);
          setStatus({ loading: false, session, hotels: [], propertyCount: 0 });
          return;
        }

        setStatus({
          loading: false,
          session,
          hotels: hotels || [],
          propertyCount: hotels?.length || 0,
        });
      } catch (err) {
        console.error('ProtectedRoute bootstrap error', err);
        if (isMounted) {
          setStatus({ loading: false, session: null, hotels: [], propertyCount: 0 });
        }
      }
    })();

    return () => { isMounted = false; };
  }, [location.pathname]);

  if (status.loading) return null;

  // Not signed in → go to login
  if (!status.session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const isOnboarding     = location.pathname === '/onboarding';
  const isPropertyPicker = location.pathname === '/property-picker';
  const isDashboard      = !!matchPath('/dashboard/:hotelId', location.pathname);
  const isAnalytics      = !!matchPath('/analytics/:hotelId', location.pathname);
  const isSettings       = !!matchPath('/settings/:hotelId', location.pathname);
  const isPropertyRoute  = isDashboard || isAnalytics || isSettings;

  // ── critical ordering: allow picker/onboarding before zero-properties redirect
  if (isPropertyPicker) return children;
  if (isOnboarding)     return children;

  // Zero properties → onboarding (but we already allowed picker above)
  if (status.propertyCount === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  // Property-specific routes are valid
  if (isPropertyRoute) return children;

  // Any other private path → picker
  return <Navigate to="/property-picker" replace />;
}
