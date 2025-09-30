// src/pages/Analytics.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.18 } },
};

const COLORS = ['#3b82f6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

function fmtCurrency(n) {
  if (n == null) return '$0';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Number(n).toLocaleString()}`;
  }
}

export default function Analytics() {
  const { hotelId } = useParams();
  const propertyId = hotelId;

  // Property name
  const [propertyName, setPropertyName] = useState('');
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      const { data } = await supabase.from('hotels').select('name').eq('id', propertyId).single();
      if (data?.name) setPropertyName(data.name);
    })();
  }, [propertyId]);

  // Date range (default last 7 days)
  const todayISO = new Date().toISOString().slice(0, 10);
  const weekAgoISO = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [range, setRange] = useState({ start: weekAgoISO, end: todayISO });

  const setQuick = (days) => {
    if (days === 0) {
      const t = new Date().toISOString().slice(0, 10);
      setRange({ start: t, end: t });
      return;
    }
    const end = new Date();
    const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    setRange({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    });
  };

  // Analytics hook
  const { data, loading, error } = useAnalytics(range.start, range.end, propertyId);

  // Unpack with defaults
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
    endDayRequests = null,
    sentimentTrend = [],
  } = data || {};

  // Requests Today
  const isSingleDay = range.start === range.end;
  const singleDaySum = requestsByHour.reduce((sum, r) => sum + (r.count || 0), 0);
  const requestsToday = endDayRequests ?? (isSingleDay ? singleDaySum : '—');

  // Derived
  const slaCompliancePct = total ? Math.round(((total - missedSLAs) / total) * 100) : 0;
  const dayCount = useMemo(() => {
    const s = new Date(range.start); const e = new Date(range.end);
    return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
  }, [range]);

  // Chart data
  const byHourData      = requestsByHour.map(d => ({ hour: d.hour, count: d.count }));
  const deptData        = topDepartments;
  const commonData      = commonWords.map(w => ({ name: w.word, value: w.count }));
  const priorityData    = priorityBreakdown;
  const scoreTrendData  = serviceScoreTrend.map(d => ({ period: d.period, score: d.avgServiceScore }));
  const repeatTrendData = repeatGuestTrend.map(d => ({ period: d.period, repeatPct: d.repeatPct }));
  const perRoomData     = requestsPerOccupiedRoom.map(d => ({ date: d.date, value: d.requestsPerRoom }));
  const sentimentData   = sentimentTrend.map(d => ({
    date: d.date, positive: d.positive || 0, neutral: d.neutral || 0, negative: d.negative || 0,
  }));

  // Sentiment Category Trend (categorical: Negative=-1, Neutral=0, Positive=1)
  const catFromCounts = (pos, neu, neg) => {
    if (pos > neg && pos > neu) return 1;        // Positive
    if (neg > pos && neg > neu) return -1;       // Negative
    return 0;                                    // Neutral or tie
  };
  const catLabel = (v) => (v === 1 ? 'Positive' : v === -1 ? 'Negative' : 'Neutral');
  const sentimentCategoryData = sentimentTrend.map(d => {
    const pos = d.positive || 0, neu = d.neutral || 0, neg = d.negative || 0;
    const idx = catFromCounts(pos, neu, neg);
    return { date: d.date, idx, label: catLabel(idx) };
  });

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative min-h-dvh bg-operon-background pt-24 overflow-x-clip"
    >
      {/* background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -left-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -right-40 h-[38rem] w-[38rem] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-operon-charcoal">
              {propertyName || 'Property'} <span className="text-gray-400 font-semibold">Analytics</span>
            </h1>
            <div className="text-xs text-gray-500 mt-1">
              Range: {range.start} → {range.end} · {dayCount} {dayCount === 1 ? 'day' : 'days'}
            </div>
          </div>

          {/* Range controls */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={range.start}
              onChange={e => setRange(r => ({ ...r, start: e.target.value }))}
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={range.end}
              onChange={e => setRange(r => ({ ...r, end: e.target.value }))}
            />
            <div className="flex items-center gap-1">
              {[
                { k: 0,  label: 'Today' },
                { k: 7,  label: '7d' },
                { k: 30, label: '30d' },
                { k: 90, label: '90d' },
              ].map(({ k, label }) => (
                <button
                  key={label}
                  onClick={() => setQuick(k)}
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs hover:bg-gray-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <StatCard title="Total Requests" value={total} />
          <StatCard title="Requests Today" value={requestsToday} />
          <StatCard title="Missed SLAs" value={missedSLAs} />
          <StatCard title="Avg Ack (min)" value={avgAck} />
          <StatCard title="Avg Completion (min)" value={avgCompletion} />
          <StatCard title="Revenue" value={fmtCurrency(estimatedRevenue)} />
          <StatCard title="Labor Saved (min)" value={enhancedLaborTimeSaved} />
          <StatCard title="Repeat Request %" value={`${repeatPercent}%`} />
          <StatCard title="Service Score" value={serviceScoreEstimate} />
          <StatCard title="SLA Compliance" value={`${slaCompliancePct}%`} />
        </div>

        {/* Charts */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 mb-6">
            <div className="font-semibold">Analytics error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="relative rounded-2xl p-4 bg-white shadow-2xl ring-1 ring-black/5 min-h-[300px]">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="h-40 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartSection title="Requests by Hour (0–23)">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byHourData}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Top Departments">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Priority Breakdown">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {priorityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Percent Complete">
              <div className="h-[250px] w-full flex items-center justify-center">
                <div className="space-y-2 text-center">
                  <p className="text-xl font-semibold text-operon-charcoal">
                    Per Day: {dailyCompletionRate.at(-1)?.completionRate ?? 0}%
                  </p>
                  <p className="text-xl font-semibold text-operon-charcoal">
                    Per Week: {weeklyCompletionRate.at(-1)?.completionRate ?? 0}%
                  </p>
                  <p className="text-xl font-semibold text-operon-charcoal">
                    Per Month: {monthlyCompletionRate.at(-1)?.completionRate ?? 0}%
                  </p>
                </div>
              </div>
            </ChartSection>

            <ChartSection title="Common Request Words">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={commonData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Service Score Trend">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreTrendData}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke={COLORS[0]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Repeat Guest Trend">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={repeatTrendData}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="repeatPct" stroke={COLORS[3]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Requests per Occupied Room">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={perRoomData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={COLORS[1]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Categorical sentiment trend: Positive / Neutral / Negative */}
            <ChartSection title="Guest Sentiment Trend">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sentimentCategoryData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[-1, 1]} ticks={[-1, 0, 1]} tickFormatter={(v) => (v === 1 ? 'Positive' : v === -1 ? 'Negative' : 'Neutral')} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip formatter={(_, __, item) => [item?.payload?.label, 'Sentiment']} />
                  <Line type="stepAfter" dataKey="idx" stroke={COLORS[5]} strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>
          </div>
        )}
      </div>
    </motion.main>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="relative">
      {/* glow */}
      <div
        aria-hidden="true"
        className="absolute -inset-0.5 rounded-2xl blur opacity-60"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.30), rgba(34,211,238,.22))' }}
      />
      <div className="relative p-4 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 text-center">
        <h3 className="text-operon-blue text-xs font-medium tracking-wide">{title}</h3>
        <p className="text-2xl font-bold text-operon-charcoal mt-1">{value}</p>
      </div>
    </div>
  );
}

function ChartSection({ title, children }) {
  return (
    <div className="relative">
      {/* glow */}
      <div
        aria-hidden="true"
        className="absolute -inset-0.5 rounded-2xl blur opacity-60"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.30), rgba(34,211,238,.22))' }}
      />
      {/* min-h ensures uniform tile height (≈ title + 250px chart area) */}
      <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-4 min-h-[300px]">
        <h2 className="text-lg font-semibold text-operon-charcoal mb-2">{title}</h2>
        {children}
      </div>
    </div>
  );
}
