// src/Analytics.js

import React, { useEffect, useState } from 'react';
import { supabase } from './utils/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import styles from './styles/Analytics.module.css';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [summary, setSummary]     = useState({ today:0, this_week:0, this_month:0 });
  const [deptData, setDeptData]   = useState([]);   // [{ name, value }]
  const [avgResponse, setAvgResponse] = useState(0);
  const [dailyData, setDailyData] = useState([]);  // [{ date, avg }]

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        // 1) Get current user
        const { data:{ user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) throw userErr || new Error('Not authenticated');

        // 2) Get hotel_id
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', user.id)
          .single();
        if (profErr || !profile) throw profErr || new Error('Profile not found');
        const hotelId = profile.hotel_id;

        // 3) Summary counts
        const now = new Date();
        const startOfToday = new Date(now).setHours(0,0,0,0);
        const startOfWeek  = new Date(startOfToday);
        startOfWeek.setDate(new Date(startOfToday).getDate() - new Date(startOfToday).getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [tCount, wCount, mCount] = await Promise.all([
          supabase.from('requests').select('id',{count:'exact',head:true})
            .eq('hotel_id',hotelId).gte('created_at', new Date(startOfToday).toISOString()),
          supabase.from('requests').select('id',{count:'exact',head:true})
            .eq('hotel_id',hotelId).gte('created_at', new Date(startOfWeek).toISOString()),
          supabase.from('requests').select('id',{count:'exact',head:true})
            .eq('hotel_id',hotelId).gte('created_at', startOfMonth.toISOString())
        ]);
        if (tCount.error) throw tCount.error;
        if (wCount.error) throw wCount.error;
        if (mCount.error) throw mCount.error;
        setSummary({ today:tCount.count, this_week:wCount.count, this_month:mCount.count });

        // 4) Department breakdown
        const { data: allReqs, error: deptErr } = await supabase
          .from('requests')
          .select('department')
          .eq('hotel_id', hotelId);
        if (deptErr) throw deptErr;
        const deptMap = {};
        allReqs.forEach(({ department }) => {
          const name = department||'General';
          deptMap[name] = (deptMap[name]||0) + 1;
        });
        setDeptData(Object.entries(deptMap).map(([name,value])=>({ name, value })));

        // 5) Overall average response time
        const { data: acked, error: ackErr } = await supabase
          .from('requests')
          .select('created_at,acknowledged_at')
          .eq('hotel_id', hotelId)
          .eq('acknowledged', true);
        if (ackErr) throw ackErr;
        const diffs = acked.filter(r=>r.created_at && r.acknowledged_at)
                           .map(r=>(new Date(r.acknowledged_at)-new Date(r.created_at))/60000);
        const avg = diffs.length ? diffs.reduce((a,b)=>a+b,0)/diffs.length : 0;
        setAvgResponse(parseFloat(avg.toFixed(2)));

        // 6) Daily averages for past 7 days
        const since = new Date();
        since.setDate(since.getDate()-6);
        const { data:lastWeek, error: weekErr } = await supabase
          .from('requests')
          .select('created_at,acknowledged_at')
          .eq('hotel_id',hotelId)
          .eq('acknowledged',true)
          .gte('created_at', since.toISOString());
        if (weekErr) throw weekErr;
        const groups = {};
        lastWeek.forEach(r => {
          const d = r.created_at.slice(0,10);
          const mins = (new Date(r.acknowledged_at)-new Date(r.created_at))/60000;
          (groups[d] = groups[d]||[]).push(mins);
        });
        const daily = [];
        for (let i=0; i<7; i++) {
          const d = new Date();
          d.setDate(d.getDate()-(6-i));
          const key = d.toISOString().slice(0,10);
          const arr = groups[key]||[];
          const dayAvg = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
          daily.push({ date:key, avg: parseFloat(dayAvg.toFixed(2)) });
        }
        setDailyData(daily);

      } catch(err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className={styles.container}>Loading…</div>;
  if (error)   return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Analytics</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Today</h3>
          <p>{summary.today}</p>
        </div>
        <div className={styles.statCard}>
          <h3>This Week</h3>
          <p>{summary.this_week}</p>
        </div>
        <div className={styles.statCard}>
          <h3>This Month</h3>
          <p>{summary.this_month}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Avg Response Time</h3>
          <p>{avgResponse} min</p>
        </div>
      </div>

      <section className={styles.chartSection}>
        <h2>Requests by Department</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={deptData}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="name" tick={{ fill:'#555', fontSize: 12 }} />
            <YAxis tick={{ fill:'#555', fontSize: 12 }} />
            <Tooltip wrapperStyle={{ fontSize: '0.85rem' }} />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className={styles.chartSection}>
        <h2>Daily Avg. Response Time</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={dailyData}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="date" tick={{ fill:'#555', fontSize: 12 }} />
            <YAxis tick={{ fill:'#555', fontSize: 12 }} />
            <Tooltip wrapperStyle={{ fontSize: '0.85rem' }} />
            <Bar dataKey="avg" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
