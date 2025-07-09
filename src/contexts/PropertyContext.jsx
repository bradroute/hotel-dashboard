// src/contexts/PropertyContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const PropertyContext = createContext();

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrent] = useState(null);

  // load user & their saved property
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // fetch all hotels this user owns
      const { data: props } = await supabase
        .from('hotels')
        .select('id,name,type')
        .eq('profile_id', user.id);
      setProperties(props);
      // fetch their last‐selected hotel
      const { data: { hotel_id } } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', user.id)
        .single();
      const initial = props.find(p => p.id === hotel_id) || props[0];
      setCurrent(initial);
    }
    init();
  }, []);

  const switchProperty = async (property) => {
    setCurrent(property);
    // persist on profile row
    await supabase
      .from('profiles')
      .update({ hotel_id: property.id })
      .eq('id', (await supabase.auth.getUser()).data.user.id);
  };

  return (
    <PropertyContext.Provider value={{ properties, currentProperty, switchProperty }}>
      {children}
    </PropertyContext.Provider>
  );
}
