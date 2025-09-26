// src/contexts/PropertyContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const PropertyContext = createContext();

export function PropertyProvider({ children }) {
  const [properties, setProperties]   = useState([]);
  const [currentProperty, setCurrent] = useState(null); // no auto-select
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [session, setSession]         = useState(null);

  // 1) Session bootstrap
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_evt, s) => setSession(s || null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // 2) Load properties for the signed-in user
  useEffect(() => {
    if (!session?.user) {
      setProperties([]);
      setCurrent(null);
      setLoading(false);
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

        // Optional: bring in a saved hotel_id if it’s *not* owned (shared, legacy, etc.)
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', userId)
          .maybeSingle();
        if (profErr) throw profErr;

        let merged = [...owned];
        if (profile?.hotel_id && !owned.find(p => p.id === profile.hotel_id)) {
          const { data: extra, error: extraErr } = await supabase
            .from('hotels')
            .select('id,name,type')
            .eq('id', profile.hotel_id)
            .maybeSingle();
          if (extraErr) throw extraErr;
          if (extra) merged.unshift(extra);
        }

        setProperties(merged);

        // IMPORTANT: do NOT auto-select here.
        // Keep currentProperty as-is; user chooses in PropertyPicker.
      } catch (err) {
        console.error('PropertyContext.refresh error:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    refresh();
  }, [session]);

  // 3) Explicit switch (user action). Also persists to profile.
  const switchProperty = async (property) => {
    setCurrent(property);
    try {
      await supabase
        .from('profiles')
        .update({ hotel_id: property?.id ?? null })
        .eq('id', session.user.id);
    } catch (err) {
      console.error('PropertyContext.switchProperty error:', err);
    }
  };

  // 4) Create property (then make it current)
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
      // Caller can navigate to /dashboard/:id
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
        currentProperty,   // null until user selects
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
