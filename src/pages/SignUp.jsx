// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Link } from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg]           = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg(error.message);
    else      setMsg('✅ Check your email for a confirmation link.');
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <form onSubmit={handleSignUp} style={{ display:'flex', flexDirection:'column', width:300 }}>
        <h2>Create an Account</h2>
        <input
          type="email"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          required
          style={{ marginBottom: 8, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          required
          style={{ marginBottom: 8, padding: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>Sign Up</button>
        {msg && <p style={{ marginTop:8 }}>{msg}</p>}
        <p style={{ marginTop:16, fontSize:14 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
