// src/Analytics.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from './utils/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './styles/Analytics.module.css';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [summary, setSummary] = useState({
    today: 0,
    this_week: 0,
    this_month: 0,
  });
  const [deptData, setDeptData]     = useState([]);  // [{ name, value }]
  const [avgResponse, setAvgResponse] = useState(0); // in minutes
  const [dailyData, setDailyData]   = useState([]);  // [{ date, avg }]

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        // 1) Who is the user?
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) throw userErr || new Error('Not authenticated');

        // 2) Find their hotel_id
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', user.id)
          .single();
        if (profErr || !profile) throw profErr || new Error('Profile not found');
        const hotelId = profile.hotel_id;

        // 3) Summary counts
        const now = new Date();
        const startOfToday = new Date(now).setHours(0, 0, 0, 0);
        const startOfWeek  = new Date(startOfToday);
        startOfWeek.setDate(new Date(startOfToday).getDate() - new Date(startOfToday).getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [todayCount, weekCount, monthCount] = await Promise.all([
          supabase
            .from('requests')
            .select('id', { count: 'exact', head: true })
            .eq('hotel_id', hotelId)
            .gte('created_at', new Date(startOfToday).toISOString()),
          supabase
            .from('requests')
            .select('id', { count: 'exact', head: true })
            .eq('hotel_id', hotelId)
            .gte('created_at', new Date(startOfWeek).toISOString()),
          supabase
            .from('requests')
            .select('id', { count: 'exact', head: true })
            .eq('hotel_id', hotelId)
            .gte('created_at', startOfMonth.toISOString()),
        ]);
        if (todayCount.error) throw todayCount.error;
        if (weekCount.error)  throw weekCount.error;
        if (monthCount.error) throw monthCount.error;
        setSummary({
          today: todayCount.count,
          this_week: weekCount.count,
          this_month: monthCount.count,
        });

        // 4) Department breakdown
        const { data: allReqs, error: deptErr } = await supabase
          .from('requests')
          .select('department')
          .eq('hotel_id', hotelId);
        if (deptErr) throw deptErr;
        const deptMap = {};
        allReqs.forEach(({ department }) => {
          const name = department || 'General';
          deptMap[name] = (deptMap[name] || 0) + 1;
        });
        setDeptData(
          Object.entries(deptMap).map(([name, value]) => ({ name, value }))
        );

        // 5) Average response time (in minutes)
        const { data: acked, error: ackErr } = await supabase
          .from('requests')
          .select('created_at,acknowledged_at')
          .eq('hotel_id', hotelId)
          .eq('acknowledged', true);
        if (ackErr) throw ackErr;
        const diffs = acked
          .filter((r) => r.created_at && r.acknowledged_at)
          .map(
            (r) =>
              (new Date(r.acknowledged_at) - new Date(r.created_at)) / 60000
          );
        const avg =
          diffs.length > 0
            ? diffs.reduce((a, b) => a + b, 0) / diffs.length
            : 0;
        setAvgResponse(parseFloat(avg.toFixed(2)));

        // 6) Daily averages for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const { data: lastWeek, error: weekErr } = await supabase
          .from('requests')
          .select('created_at,acknowledged_at')
          .eq('hotel_id', hotelId)
          .eq('acknowledged', true)
          .gte('created_at', sevenDaysAgo.toISOString());
        if (weekErr) throw weekErr;
        // Group by date string
        const group = {};
        lastWeek.forEach((r) => {
          const date = r.created_at.slice(0, 10); // YYYY-MM-DD
          const mins =
            (new Date(r.acknowledged_at) - new Date(r.created_at)) / 60000;
          if (!group[date]) group[date] = [];
          group[date].push(mins);
        });
        // Build array of last 7 days in order
        const daily = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayStr = d.toISOString().slice(0, 10);
          const arr = group[dayStr] || [];
          const avgDay =
            arr.length > 0
              ? arr.reduce((a, b) => a + b, 0) / arr.length
              : 0;
          daily.push({ date: dayStr, avg: parseFloat(avgDay.toFixed(2)) });
        }
        setDailyData(daily);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className={styles.container}>Loading…</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1>Analytics</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <h3>Today</h3>
          <p>{summary.today}</p>
        </div>
        <div className={styles.statBox}>
          <h3>This Week</h3>
          <p>{summary.this_week}</p>
        </div>
        <div className={styles.statBox}>
          <h3>This Month</h3>
          <p>{summary.this_month}</p>
        </div>
        <div className={styles.statBox}>
          <h3>Avg Response Time</h3>
          <p>{avgResponse} min</p>
        </div>
      </div>

      <h2>Requests by Department</h2>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={deptData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2>Daily Avg. Response Time (Last 7 Days)</h2>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avg" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
