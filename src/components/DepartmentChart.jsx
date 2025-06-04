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
import styles from '../styles/Analytics.module.css';

/**
 * Props: dataObj = { housekeeping: 2, maintenance: 1, ... }
 */
export default function DepartmentChart({ dataObj }) {
  // Convert { key: value } → [ { name: key, value: value }, … ]
  const data = Object.entries(dataObj).map(([name, value]) => ({ name, value }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#87cefa']; // sample palette

  return (
    <div className={styles.chartCard}>
      <h3>Requests by Department</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} fill="#8884d8" label>
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
