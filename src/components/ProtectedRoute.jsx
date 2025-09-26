// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, matchPath } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

/**
 * Guards private routes:
 *  • requires auth
 *  • fetches user's properties
 *  • NEVER redirects away from /property-picker
 *  • sends users without any properties to /onboarding
 *  • for all other private paths that aren't property routes, go to /property-picker
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

  // If user has zero properties → force onboarding (unless already there)
  if (status.propertyCount === 0 && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Never redirect away from the picker; user must explicitly choose a property
  if (isPropertyPicker) {
    return children;
  }

  // Property-specific routes are always valid to render as-is
  if (isPropertyRoute) {
    return children;
  }

  // If user tries to hit any other private path, land on the picker (even with a single property)
  if (!isOnboarding) {
    return <Navigate to="/property-picker" replace />;
  }

  // Onboarding page: if they already have properties, send to picker (not to a dashboard)
  if (isOnboarding && status.propertyCount > 0) {
    return <Navigate to="/property-picker" replace />;
  }

  return children;
}
