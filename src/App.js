// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import LoginPage from './pages/LoginPage'; // make sure this path matches where you created LoginPage
import styles from './styles/App.module.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const isAuthed = localStorage.getItem('authenticated') === 'true';
    setAuthenticated(isAuthed);
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
  };

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            Dashboard
          </Link>
          <Link to="/analytics" className={styles.navLink}>
            Analytics
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
