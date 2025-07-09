// src/contexts/PropertyContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const PropertyContext = createContext();

export function PropertyProvider({ children }) {
  const [properties, setProperties]       = useState([]);
  const [currentProperty, setCurrent]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [session, setSession]             = useState(null);

  // Fetch initial session & subscribe to changes
  useEffect(() => {
    // grab current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    // subscribe
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Whenever session is ready, load properties
  useEffect(() => {
    if (!session?.user) {
      // if no user, clear state
      setProperties([]);
      setCurrent(null);
      setLoading(false);
      return;
    }

    const refreshProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = session.user.id;

        // 1) fetch all hotels for this user
        const { data: owned = [], error: ownedErr } = await supabase
          .from('hotels')
          .select('id,name,type')
          .eq('profile_id', userId);
        if (ownedErr) throw ownedErr;

        // 2) fetch saved hotel_id from profiles
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', userId)
          .maybeSingle();
        if (profErr) throw profErr;

        // 3) if saved ID isn’t in owned, fetch it explicitly so we can still switch back
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

        // 4) pick current: saved or first
        const initial =
          merged.find(p => p.id === profile?.hotel_id) ||
          merged[0] ||
          null;
        setCurrent(initial);
      } catch (err) {
        console.error('PropertyContext.refreshProperties error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    refreshProperties();
  }, [session]);

  // Switch active property
  const switchProperty = async property => {
    setCurrent(property);
    try {
      await supabase
        .from('profiles')
        .update({ hotel_id: property.id })
        .eq('id', session.user.id);
    } catch (err) {
      console.error('PropertyContext.switchProperty error:', err);
    }
  };

  // Add & switch in one go
  const addProperty = async data => {
    setLoading(true);
    setError(null);
    try {
      const hotelPayload = { profile_id: session.user.id, ...data };
      const { data: newHotel, error: insertErr } = await supabase
        .from('hotels')
        .insert([hotelPayload])
        .select('id,name,type')
        .single();
      if (insertErr) throw insertErr;

      // persist choice & reload
      await switchProperty(newHotel);
      // re-run the refresh logic
      const refresh = () => {}; // no-op here, effect on [session] will do it
      refresh();
    } catch (err) {
      console.error('PropertyContext.addProperty error:', err);
      setError(err.message);
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
        addProperty
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}
