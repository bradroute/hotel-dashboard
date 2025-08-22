// src/hooks/useAnalytics.js
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * Fetch analytics scoped by hotel_id.
 * @param {string} startDate - YYYY-MM-DD (inclusive)
 * @param {string} endDate   - YYYY-MM-DD (inclusive)
 * @param {string=} hotelIdOverride
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
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
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

        const tzOffsetMinutes = -new Date().getTimezoneOffset();
        const base = new URL(`${process.env.REACT_APP_API_URL}/analytics/full`);
        base.searchParams.append('hotel_id', hotelId);
        base.searchParams.append('tzOffsetMinutes', String(tzOffsetMinutes));

        // Full-range fetch
        const urlFull = new URL(base);
        urlFull.searchParams.append('startDate', startDate);
        urlFull.searchParams.append('endDate', endDate);

        const resFull = await fetch(urlFull.toString(), { signal: ctrl.signal });
        if (!resFull.ok) {
          const text = await resFull.text();
          throw new Error(`Analytics API ${resFull.status}: ${text}`);
        }
        const jsonFull = await resFull.json();

        // Single-day fetch for the selected END date (for “Requests Today”)
        const urlDay = new URL(base);
        urlDay.searchParams.append('startDate', endDate);
        urlDay.searchParams.append('endDate', endDate);

        const resDay = await fetch(urlDay.toString(), { signal: ctrl.signal });
        if (!resDay.ok) {
          const text = await resDay.text();
          throw new Error(`Analytics API (day) ${resDay.status}: ${text}`);
        }
        const jsonDay = await resDay.json();
        const endDayRequests = Array.isArray(jsonDay.requestsByHour)
          ? jsonDay.requestsByHour.reduce((s, r) => s + (r.count || 0), 0)
          : 0;

        setData({ ...jsonFull, endDayRequests });
      } catch (err) {
        if (err.name === 'AbortError') return;
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
