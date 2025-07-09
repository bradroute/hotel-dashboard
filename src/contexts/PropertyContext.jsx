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
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1) fetch all hotels for this profile
      const { data: props, error: propsErr } = await supabase
        .from('hotels')
        .select('id, name, type')
        .eq('profile_id', user.id);
      if (propsErr) throw propsErr;
      setProperties(props || []);

      // 2) fetch the saved hotel_id
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', user.id)
        .single();
      if (profErr) throw profErr;

      // pick the saved one or default to first
      const initial =
        props.find(p => p.id === profile?.hotel_id) ||
        props[0] ||
        null;
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
      const {
        data: { user }
      } = await supabase.auth.getUser();
      await supabase
        .from('profiles')
        .update({ hotel_id: property.id })
        .eq('id', user.id);
    } catch (err) {
      console.error('PropertyContext.switchProperty error:', err);
      // optionally restore previous currentProperty on failure
    }
  };

  // Add a new property & switch to it
  const addProperty = async ({
    name,
    type,
    timezone,
    address,
    city,
    state,
    zip_code
  }) => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      // 1) insert hotel
      const { data: newHotel, error: insertErr } = await supabase
        .from('hotels')
        .insert([
          {
            profile_id: user.id,
            name,
            type,
            timezone,
            address,
            city,
            state,
            zip_code
          }
        ])
        .select('id, name, type')
        .single();
      if (insertErr) throw insertErr;

      // 2) persist on profile & switch
      await switchProperty(newHotel);
      // 3) re-load full list (so dropdown shows it)
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
      value={{
        properties,
        currentProperty,
        loading,
        error,
        switchProperty,
        addProperty,
        refreshProperties
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}
