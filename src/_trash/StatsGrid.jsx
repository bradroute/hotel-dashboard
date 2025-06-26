// src/components/StatsGrid.jsx

import React from 'react';
import styles from '../styles/Analytics.module.css';

/**
 * Props: { today, this_week, this_month }
 */
export default function StatsGrid({ today, this_week, this_month }) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statBox}>
        <h3>Today</h3>
        <p>{today}</p>
      </div>
      <div className={styles.statBox}>
        <h3>This Week</h3>
        <p>{this_week}</p>
      </div>
      <div className={styles.statBox}>
        <h3>This Month</h3>
        <p>{this_month}</p>
      </div>
    </div>
  );
}
