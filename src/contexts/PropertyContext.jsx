// src/contexts/PropertyContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const PropertyContext = createContext();

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to load all properties & the saved one
  const refreshProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1) fetch all hotels owned by this user
      const { data: owned = [], error: ownedErr } = await supabase
        .from('hotels')
        .select('id, name, type')
        .eq('profile_id', user.id);
      if (ownedErr) throw ownedErr;

      // 2) fetch the saved hotel_id
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', user.id)
        .single();
      if (profErr) throw profErr;

      // Merge: if saved hotel isn't in owned, fetch and prepend it
      let merged = [...owned];
      if (profile?.hotel_id && !owned.find(p => p.id === profile.hotel_id)) {
        const { data: extra, error: extraErr } = await supabase
          .from('hotels')
          .select('id, name, type')
          .eq('id', profile.hotel_id)
          .single();
        if (!extraErr && extra) merged.unshift(extra);
      }

      setProperties(merged);
      // 3) set currentProperty to saved or default
      const initial = merged.find(p => p.id === profile?.hotel_id) || merged[0] || null;
      setCurrent(initial);
    } catch (err) {
      console.error('PropertyContext.refreshProperties error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProperties();
  }, []);

  // Switch active property (persist on profile)
  const switchProperty = async property => {
    setCurrent(property);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('profiles')
        .update({ hotel_id: property.id })
        .eq('id', user.id);
    } catch (err) {
      console.error('PropertyContext.switchProperty error:', err);
    }
  };

  // Add a new property & switch to it
  const addProperty = async data => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const hotelPayload = { profile_id: user.id, ...data };
      const { data: newHotel, error: insertErr } = await supabase
        .from('hotels')
        .insert([hotelPayload])
        .select('id, name, type')
        .single();
      if (insertErr) throw insertErr;
      await switchProperty(newHotel);
      await refreshProperties();
    } catch (err) {
      console.error('PropertyContext.addProperty error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PropertyContext.Provider
      value={{ properties, currentProperty, loading, error, switchProperty, addProperty, refreshProperties }}
    >
      {children}
    </PropertyContext.Provider>
  );
}
