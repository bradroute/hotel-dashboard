// src/contexts/PropertyContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export const PropertyContext = createContext();

const LS_KEY = 'operon:last_hotel_id';
const pathIdRegex = /\/(dashboard|analytics|settings)\/([0-9a-f-]{10,})/i;
const extractHotelIdFromPath = (pathname = '') => {
  const m = pathname.match(pathIdRegex);
  return m ? m[2] : null;
};

export function PropertyProvider({ children }) {
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrent] = useState(null); // will be rehydrated below
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  // separate state so we can rehydrate from the user's profile
  const [profileHotelId, setProfileHotelId] = useState(null);

  /* 1) Session bootstrap */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s || null));
    return () => subscription.unsubscribe();
  }, []);

  /* 2) Load properties for the signed-in user */
  useEffect(() => {
    if (!session?.user) {
      setProperties([]);
      setCurrent(null);
      setProfileHotelId(null);
      setLoading(false);
      try {
        localStorage.removeItem(LS_KEY);
      } catch {}
      return;
    }

    const refresh = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = session.user.id;

        // Owned properties
        const { data: owned = [], error: ownedErr } = await supabase
          .from('hotels')
          .select('id,name,type')
          .eq('profile_id', userId);
        if (ownedErr) throw ownedErr;

        // Possibly a saved hotel_id (shared, legacy, etc.)
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', userId)
          .maybeSingle();
        if (profErr) throw profErr;

        setProfileHotelId(profile?.hotel_id ?? null);

        let merged = [...owned];
        if (profile?.hotel_id && !owned.find((p) => p.id === profile.hotel_id)) {
          const { data: extra, error: extraErr } = await supabase
            .from('hotels')
            .select('id,name,type')
            .eq('id', profile.hotel_id)
            .maybeSingle();
          if (extraErr) throw extraErr;
          if (extra) merged.unshift(extra);
        }

        setProperties(merged);
        // do not auto-select here; the rehydration effect below handles initial selection
      } catch (err) {
        console.error('PropertyContext.refresh error:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    refresh();
  }, [session]);

  /* 3) Rehydrate currentProperty after properties load (URL → profile → localStorage) */
  useEffect(() => {
    if (!session?.user) return;
    if (loading) return;
    if (currentProperty?.id) return;

    const fromUrl = extractHotelIdFromPath(location.pathname);
    const fromProfile = profileHotelId || null;
    let fromStorage = null;
    try {
      fromStorage = localStorage.getItem(LS_KEY) || null;
    } catch {}

    const candidateId = fromUrl || fromProfile || fromStorage;
    if (!candidateId) return;

    const found = properties.find((p) => p.id === candidateId);
    if (found) {
      setCurrent(found);
    }
    // if not found, stay null; user can pick from the selector
  }, [session, loading, properties, profileHotelId, location.pathname, currentProperty?.id]);

  /* 4) Explicit switch (user action). Persist to profile and localStorage. */
  const switchProperty = async (property) => {
    setCurrent(property || null);
    try {
      await supabase
        .from('profiles')
        .update({ hotel_id: property?.id ?? null })
        .eq('id', session.user.id);
    } catch (err) {
      console.error('PropertyContext.switchProperty error:', err);
    }
    try {
      if (property?.id) localStorage.setItem(LS_KEY, property.id);
      else localStorage.removeItem(LS_KEY);
    } catch {}
  };

  /* 5) Create property (then make it current) */
  const addProperty = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { profile_id: session.user.id, ...data };
      const { data: newHotel, error: insertErr } = await supabase
        .from('hotels')
        .insert([payload])
        .select('id,name,type')
        .single();
      if (insertErr) throw insertErr;

      await switchProperty(newHotel);
      // caller can navigate to /dashboard/:id
    } catch (err) {
      console.error('PropertyContext.addProperty error:', err);
      setError(err.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        currentProperty,
        loading,
        error,
        switchProperty,
        addProperty,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}
