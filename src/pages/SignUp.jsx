// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { supabase }        from '../utils/supabaseClient';
import { useNavigate }     from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [hotelName, setHotelName]   = useState('');
  const [error, setError]           = useState('');
  const [msg, setMsg]               = useState('');
  const navigate                    = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    // 1. Create the auth user
    const { data: signUpData, error: signUpError } = 
      await supabase.auth.signUp({ email, password });
    if (signUpError) return setError(signUpError.message);

    const userId = signUpData.user.id;

    // 2. Insert a hotel record
    const { data: hotelData, error: hotelError } =
      await supabase
        .from('hotels')
        .insert({ name: hotelName })
        .select('id')
        .single();
    if (hotelError) return setError(hotelError.message);

    // 3. Link profile → hotel
    const { error: profileError } = 
      await supabase
        .from('profiles')
        .insert({ id: userId, hotel_id: hotelData.id });
    if (profileError) return setError(profileError.message);

    // 4. Success → let them know & redirect to login
    setMsg('✅ Sign-up successful! Please check your email for confirmation.');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'100vh' }}>
      <form onSubmit={handleSignUp} style={{ display:'flex',flexDirection:'column',width:300 }}>
        <h2>Create Hotel Account</h2>
        <input
          type="text"
          placeholder="Hotel Name"
          value={hotelName}
          onChange={e => setHotelName(e.target.value)}
          required style={{ marginBottom:8,padding:8 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required style={{ marginBottom:8,padding:8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required style={{ marginBottom:8,padding:8 }}
        />
        <button type="submit" style={{ padding:8 }}>Sign Up</button>
        {error && <p style={{ color:'red', marginTop:8 }}>{error}</p>}
        {msg   && <p style={{ marginTop:8 }}>{msg}</p>}
      </form>
    </div>
  );
}
