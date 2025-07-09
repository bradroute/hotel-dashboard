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

  // 1. Fetch initial session & subscribe to changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );
    return () => subscription.unsubscribe();
  }, []);

  // 2. Whenever session is ready, load properties and update profile if needed
  useEffect(() => {
    if (!session?.user) {
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

        // 1) Fetch all properties owned by this user
        const { data: owned = [], error: ownedErr } = await supabase
          .from('hotels')
          .select('id,name,type')
          .eq('profile_id', userId);
        if (ownedErr) throw ownedErr;

        // 2) Fetch their saved hotel_id from profile
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', userId)
          .maybeSingle();
        if (profErr) throw profErr;

        let merged = [...owned];

        // 3) If profile.hotel_id isn't in owned list, fetch and merge it in
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

        // 4) Pick "current": profile's saved, or first property if not set
        let initial =
          merged.find(p => p.id === profile?.hotel_id) ||
          merged[0] ||
          null;

        // If user has properties but no hotel_id saved, auto-save their first as default
        if (merged.length === 1 && !profile?.hotel_id) {
          // Auto-set hotel_id in profile
          await supabase
            .from('profiles')
            .update({ hotel_id: merged[0].id })
            .eq('id', userId);
          initial = merged[0];
        }

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

  // 3. Switch active property (and update profile.hotel_id)
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

  // 4. Add new property and set as active
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

      // Switch to new property (will update hotel_id in profile too)
      await switchProperty(newHotel);
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
