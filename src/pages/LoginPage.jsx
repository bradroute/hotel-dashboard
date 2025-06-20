// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import logoFull from '../assets/logo-full.png'; // Full logo

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) setError(authErr.message);
    else navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-operon-background p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg space-y-6"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center">
          <img
            src={logoFull}
            alt="Operon"
            className="max-h-[164px] w-auto object-contain mb-0"
          />
          <h1 className="text-xl font-semibold text-operon-charcoal text-center">
            Login
          </h1>
        </div>

        {error && (
          <p className="text-center text-red-600 text-sm">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
          required
        />

        <button
          type="submit"
          className="w-full bg-operon-blue hover:bg-blue-400 text-white py-2 rounded font-medium transition"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-operon-blue hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
