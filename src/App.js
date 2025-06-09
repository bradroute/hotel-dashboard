// src/App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './utils/supabaseClient';
import styles from './styles/App.module.css';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // listen for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Router>
      {session && (
        <nav className={styles.nav}>
          <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link to="/analytics" className={styles.navLink}>Analytics</Link>
          <button onClick={handleLogout} className={styles.navLink}>Logout</button>
        </nav>
      )}
      <div className={styles.container}>
        <Routes>
          <Route
            path="/login"
            element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              session
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
