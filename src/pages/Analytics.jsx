// src/pages/Analytics.jsx — updated to match new API payload
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAnalytics } from '../hooks/useAnalytics';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
};

export default function Analytics() {
  const { hotelId } = useParams();
  const propertyId = hotelId;

  // Get property name for title
  const [propertyName, setPropertyName] = useState('');
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      const { data } = await supabase
        .from('hotels')
        .select('name')
        .eq('id', propertyId)
        .single();
      if (data?.name) setPropertyName(data.name);
    })();
  }, [propertyId]);

  // Date range controls
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [range, setRange] = useState({ start: weekAgo, end: today });

  // Use analytics for this property
  const { data, loading, error } = useAnalytics(range.start, range.end, propertyId);

  if (!propertyId || loading) {
    return <div className="p-6 text-lg font-medium">Loading analytics…</div>;
  }
  if (error) {
    return <div className="p-6 text-lg text-red-600">Error: {error}</div>;
  }

  const {
    total = 0,
    avgAck = 0,
    missedSLAs = 0,
    avgCompletion = 0,
    repeatPercent = 0,
    estimatedRevenue = 0,
    enhancedLaborTimeSaved = 0,
    serviceScoreEstimate = 0,
    requestsByHour = [],
    topDepartments = [],
    commonWords = [],
    priorityBreakdown = [],
    serviceScoreTrend = [],
    repeatGuestTrend = [],
    requestsPerOccupiedRoom = [],
    dailyCompletionRate = [],
    weeklyCompletionRate = [],
    monthlyCompletionRate = [],
    endDayRequests = null,          // for “Requests Today”
    sentimentTrend = [],            // NEW: trend data [{date, positive, neutral, negative}]
  } = data || {};

  // Requests Today
  const isSingleDay = range.start === range.end;
  const singleDaySum = requestsByHour.reduce((sum, r) => sum + (r.count || 0), 0);
  const requestsToday = endDayRequests ?? (isSingleDay ? singleDaySum : '—');

  // Derived stat
  const slaCompliancePct = total ? Math.round(((total - missedSLAs) / total) * 100) : 0;

  // Chart data shaping
  const byHourData       = requestsByHour.map(d => ({ hour: d.hour, count: d.count }));
  const deptData         = topDepartments;
  const commonData       = commonWords.map(w => ({ name: w.word, value: w.count }));
  const priorityData     = priorityBreakdown;
  const scoreTrendData   = serviceScoreTrend.map(d => ({ period: d.period, score: d.avgServiceScore }));
  const repeatTrendData  = repeatGuestTrend.map(d => ({ period: d.period, repeatPct: d.repeatPct }));
  const perRoomData      = requestsPerOccupiedRoom.map(d => ({ date: d.date, value: d.requestsPerRoom }));
  const sentimentData    = sentimentTrend.map(d => ({
    date: d.date,
    positive: d.positive || 0,
    neutral: d.neutral || 0,
    negative: d.negative || 0,
  }));

  const COLORS = ['#47B2FF', '#2D2D2D', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-operon-background pt-24 px-6 flex flex-col items-center"
      >
        <div className="max-w-6xl w-full space-y-10">
          <h1 className="text-4xl font-bold text-operon-charcoal flex items-center gap-2">
            <span role="img" aria-label="bar chart">📊</span> {propertyName || 'Property'} Analytics
          </h1>

          <div className="flex gap-4 items-center">
            <input
              type="date"
              className="border border-gray-300 p-2 rounded shadow-sm"
              value={range.start}
              onChange={e => setRange(r => ({ ...r, start: e.target.value }))}
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="border border-gray-300 p-2 rounded shadow-sm"
              value={range.end}
              onChange={e => setRange(r => ({ ...r, end: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <StatCard title="Total Requests"       value={total} />
            <StatCard title="Requests Today"       value={requestsToday} />
            <StatCard title="Missed SLAs"          value={missedSLAs} />
            <StatCard title="Avg Ack Time (min)"   value={avgAck} />
            <StatCard title="Avg Completion (min)" value={avgCompletion} />
            <StatCard title="Revenue"              value={`$${estimatedRevenue}`} />
            <StatCard title="Labor Saved (min)"    value={enhancedLaborTimeSaved} />
            <StatCard title="Repeat Request %"     value={`${repeatPercent}%`} />
            <StatCard title="Service Score"        value={serviceScoreEstimate} />
            <StatCard title="SLA Compliance %"     value={`${slaCompliancePct}%`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Requests by Hour (replaces Requests Per Day) */}
            <ChartSection title="Requests by Hour (0–23)">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byHourData}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Top Departments */}
            <ChartSection title="Top Departments">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Priority Breakdown */}
            <ChartSection title="Priority Breakdown">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {priorityData.map((_, i) => (
                      <Cell key={i} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Percent Complete */}
            <ChartSection title="Percent Complete">
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <p className="text-xl font-semibold text-operon-charcoal">
                  Per Day: {dailyCompletionRate.at(-1)?.completionRate || 0}%
                </p>
                <p className="text-xl font-semibold text-operon-charcoal">
                  Per Week: {weeklyCompletionRate.at(-1)?.completionRate || 0}%
                </p>
                <p className="text-xl font-semibold text-operon-charcoal">
                  Per Month: {monthlyCompletionRate.at(-1)?.completionRate || 0}%
                </p>
              </div>
            </ChartSection>

            {/* Common Request Words */}
            <ChartSection title="Common Request Words">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={commonData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Service Score Trend */}
            <ChartSection title="Service Score Trend">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreTrendData}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Repeat Guest Trend */}
            <ChartSection title="Repeat Guest Trend">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={repeatTrendData}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="repeatPct" />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Requests per Occupied Room */}
            <ChartSection title="Requests per Occupied Room">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={perRoomData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* NEW: Guest Sentiment Trend (stacked) */}
            <ChartSection title="Guest Sentiment Trend">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sentimentData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="positive" stackId="s" />
                  <Bar dataKey="neutral"  stackId="s" />
                  <Bar dataKey="negative" stackId="s" />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow flex flex-col items-center justify-center">
      <h3 className="text-operon-blue text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-operon-charcoal">{value}</p>
    </div>
  );
}

function ChartSection({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-operon-charcoal mb-2">{title}</h2>
      {children}
    </div>
  );
}
