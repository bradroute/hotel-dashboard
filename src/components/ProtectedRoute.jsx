import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, matchPath } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

/**
 * Wrap your routes in <ProtectedRoute> to ensure:
 *  • the user is signed in
 *  • the user has at least one property (hotel) before proceeding
 *  • property-picker page is used for multi-property users
 *  • property-specific routes are always accessible
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState({
    loading: true,
    session: null,
    hotels: [],
    propertyCount: 0
  });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    async function bootstrap() {
      try {
        // 1) Get session
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (!session) {
          setStatus({ loading: false, session: null, hotels: [], propertyCount: 0 });
          return;
        }
        // 2) Fetch hotels for this user
        const { data: hotels, error } = await supabase
          .from('hotels')
          .select('id')
          .eq('profile_id', session.user.id);
        if (!isMounted) return;
        if (error) {
          setStatus({ loading: false, session, hotels: [], propertyCount: 0 });
          return;
        }
        setStatus({
          loading: false,
          session,
          hotels: hotels || [],
          propertyCount: hotels?.length || 0
        });
      } catch (err) {
        console.error('ProtectedRoute bootstrap error', err);
        if (isMounted)
          setStatus({ loading: false, session: null, hotels: [], propertyCount: 0 });
      }
    }
    bootstrap();
    return () => { isMounted = false; };
  }, []);

  if (status.loading) return null;

  if (!status.session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isOnboarding     = location.pathname === '/onboarding';
  const isPropertyPicker = location.pathname === '/property-picker';
  const isDashboard      = matchPath('/dashboard/:hotelId', location.pathname);
  const isAnalytics      = matchPath('/analytics/:hotelId', location.pathname);
  const isSettings       = matchPath('/settings/:hotelId', location.pathname);

  // Is this a property route? (dashboard, analytics, settings)
  const isPropertyRoute = isDashboard || isAnalytics || isSettings;

  // ---- THE FIX: allow explicit onboarding access ----
  if (isOnboarding) {
    return children;
  }
  // ---------------------------------------------------

  // No hotels, not onboarding? => must onboard
  if (status.propertyCount === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  // Has multiple hotels, not on picker/onboarding/property route? => must pick
  if (
    status.propertyCount > 1 &&
    !isPropertyPicker &&
    !isOnboarding &&
    !isPropertyRoute
  ) {
    return <Navigate to="/property-picker" replace />;
  }

  // Just finished onboarding
  // (Note: we already allow onboarding above, so you can safely keep this for completeness)
  if (isOnboarding && status.propertyCount > 0) {
    if (status.propertyCount === 1) {
      // Redirect to dashboard for single property
      return (
        <Navigate to={`/dashboard/${status.hotels[0].id}`} replace />
      );
    }
    // Multi-property: go to picker
    return <Navigate to="/property-picker" replace />;
  }

  // All good: render children
  return children;
}
