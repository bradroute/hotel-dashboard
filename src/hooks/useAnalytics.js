// src/hooks/useAnalytics.js — updated to support hotelId param, tz offset, and correct endDate handling
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * Fetch analytics scoped by hotel_id.
 * @param {string} startDate - YYYY-MM-DD (inclusive)
 * @param {string} endDate   - YYYY-MM-DD (inclusive)
 * @param {string=} hotelIdOverride - Optional hotelId to query (falls back to user profile)
 */
export function useAnalytics(startDate, endDate, hotelIdOverride) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Ensure authenticated
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        if (!user) throw new Error('Not authenticated');

        // Resolve hotel id
        let hotelId = hotelIdOverride;
        if (!hotelId) {
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('hotel_id')
            .eq('id', user.id)
            .single();
          if (profileErr) throw profileErr;
          if (!profile?.hotel_id) throw new Error('Profile missing hotel_id');
          hotelId = profile.hotel_id;
        }

        // Local timezone offset in minutes (e.g., CDT = -300)
        const tzOffsetMinutes = -new Date().getTimezoneOffset();

        // Build URL with required query params (API normalizes end-of-day itself)
        const urlObj = new URL(`${process.env.REACT_APP_API_URL}/analytics/full`);
        urlObj.searchParams.append('hotel_id', hotelId);
        urlObj.searchParams.append('startDate', startDate);
        urlObj.searchParams.append('endDate', endDate);
        urlObj.searchParams.append('tzOffsetMinutes', String(tzOffsetMinutes));

        // Optional: tune common words if you want — safe defaults used by API otherwise
        // urlObj.searchParams.append('commonTopN', '7');
        // urlObj.searchParams.append('commonMinLen', '3');
        // urlObj.searchParams.append('commonMinCount', '2');

        const url = urlObj.toString();
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Analytics API ${res.status}: ${text}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err.name === 'AbortError') return; // ignore aborted fetch
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => ctrl.abort();
  }, [startDate, endDate, hotelIdOverride]);

  return { data, loading, error };
}
