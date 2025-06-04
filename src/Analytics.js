// src/Analytics.jsx

import React, { useEffect, useState } from 'react';
import styles from './styles/Analytics.module.css';

import {
  getSummary,
  getByDepartment,
  getAvgResponseTime,
  getDailyResponseTimes,
} from './utils/api';

import StatsGrid from './components/StatsGrid';
import DepartmentChart from './components/DepartmentChart';
import ResponseTimeChart from './components/ResponseTimeChart';

export default function Analytics() {
  const [summary, setSummary] = useState({ today: 0, this_week: 0, this_month: 0 });
  const [byDept, setByDept] = useState({});
  const [avgTime, setAvgTime] = useState({ average_response_time_minutes: 0 });
  const [dailyTimes, setDailyTimes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAllAnalytics() {
      try {
        setLoading(true);
        const [sumRes, deptRes, avgRes, dailyRes] = await Promise.all([
          getSummary(),
          getByDepartment(),
          getAvgResponseTime(),
          getDailyResponseTimes(),
        ]);
        setSummary(sumRes);
        setByDept(deptRes);
        setAvgTime(avgRes);
        setDailyTimes(dailyRes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAllAnalytics();
  }, []);

  if (loading) return <div className={styles.container}>Loading…</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1>Analytics</h1>

      <StatsGrid
        today={summary.today}
        this_week={summary.this_week}
        this_month={summary.this_month}
      />

      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <h3>Overall Avg. Response (min)</h3>
          <p>{avgTime.average_response_time_minutes}</p>
        </div>
      </div>

      <DepartmentChart dataObj={byDept} />
      <ResponseTimeChart data={dailyTimes} />
    </div>
  );
}
