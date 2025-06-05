// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Analytics from './Analytics';

/* Import our new CSS Module */
import styles from './styles/App.module.css';

function App() {
  return (
    <Router>
      {/* 1. Replace style={{ padding: '1rem' }} with className={styles.container} */}
      <div className={styles.container}>
        {/* 2. Replace style={{ marginBottom: '1rem' }} with className={styles.nav} */}
        <nav className={styles.nav}>
          {/* 3. Replace style={{ marginRight: '1rem' }} with className={styles.navLink} */}
          <Link to="/" className={styles.navLink}>
            Dashboard
          </Link>
          {/* The second link doesn’t need marginRight, since it’s the last one */}
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
