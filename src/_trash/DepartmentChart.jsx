// src/components/DepartmentChart.jsx

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from '../styles/Analytics.module.css'; // assuming you’ll brand this next

/**
 * Props: dataObj = { housekeeping: 2, maintenance: 1, ... }
 */
export default function DepartmentChart({ dataObj }) {
  const data = Object.entries(dataObj).map(([name, value]) => ({ name, value }));

  const COLORS = ['#47B2FF', '#2D2D2D', '#10b981', '#f59e0b', '#ef4444']; // Operon-inspired

  return (
    <div className={styles.chartCard}>
      <h3 className="text-lg font-semibold text-operon-charcoal mb-2">
        Requests by Department
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
