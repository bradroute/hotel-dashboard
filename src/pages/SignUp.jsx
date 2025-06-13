// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) return setError(signUpError.message);

      const userId = signUpData.user.id;

      const { data: hotelData, error: hotelError } =
        await supabase.from('hotels').insert({ name: hotelName }).select('id').single();
      if (hotelError) return setError(hotelError.message);

      const { error: profileError } = await supabase.from('profiles').insert({ id: userId, hotel_id: hotelData.id });
      if (profileError) return setError(profileError.message);

      setMsg('✅ Sign-up successful! Please check your email for confirmation.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Create Hotel Account</h2>
        {error && <div className={styles.error}>{error}</div>}
        {msg && <div className={styles.success}>{msg}</div>}
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Hotel Name"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
