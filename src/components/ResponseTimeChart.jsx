// src/components/ResponseTimeChart.jsx

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from '../styles/Analytics.module.css';

/**
 * Props: data = [ { date: "2025-06-01", avg_minutes: 12.34 }, ... ]
 */
export default function ResponseTimeChart({ data }) {
  return (
    <div className={styles.chartCard}>
      <h3>Avg. Response Time (last 7 days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis unit=" min" />
          <Tooltip />
          <Line type="monotone" dataKey="avg_minutes" stroke="#8884d8" dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
