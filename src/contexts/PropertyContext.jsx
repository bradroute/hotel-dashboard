// src/contexts/PropertyContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const PropertyContext = createContext();

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrent] = useState(null);

  // Helper to load all properties & the saved one
  const refreshProperties = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // 1) fetch all
    const { data: props } = await supabase
      .from('hotels')
      .select('id,name,type')
      .eq('profile_id', user.id);
    setProperties(props);
    // 2) fetch saved hotel_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', user.id)
      .single();
    const initial = props.find(p => p.id === profile.hotel_id) || props[0];
    setCurrent(initial);
  };

  useEffect(() => {
    refreshProperties();
  }, []);

  // Switch active property (persist on profile)
  const switchProperty = async (property) => {
    setCurrent(property);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('profiles')
      .update({ hotel_id: property.id })
      .eq('id', user.id);
  };

  // Add a new property & switch to it
  const addProperty = async ({ name, type, timezone, address, city, state, zip_code }) => {
    const { data: { user } } = await supabase.auth.getUser();
    // 1) insert hotel
    const { data: newHotel, error } = await supabase
      .from('hotels')
      .insert([{
        profile_id: user.id,
        name, type, timezone,
        address, city, state, zip_code
      }])
      .select('id,name,type')
      .single();
    if (error) throw error;
    // 2) set as current
    await switchProperty(newHotel);
    // 3) re-load list (so dropdown shows it)
    await refreshProperties();
  };

  return (
    <PropertyContext.Provider value={{
      properties,
      currentProperty,
      switchProperty,
      addProperty
    }}>
      {children}
    </PropertyContext.Provider>
  );
}
