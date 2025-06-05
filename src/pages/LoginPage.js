// src/pages/LoginPage.js
import React, { useState } from 'react';

function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === process.env.REACT_APP_DASHBOARD_PASSWORD) {
      localStorage.setItem('authenticated', 'true');
      onLogin();
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit}>
        <h2>Hotel Crosby Staff Login</h2>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
