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
      const { data, error } = await supabase
        .from('hotels')
        .select('name')
        .eq('id', propertyId)
        .single();
      if (data?.name) setPropertyName(data.name);
    })();
  }, [propertyId]);

  // Date range controls
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
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
    total,
    avgAck,
    missedSLAs,
    avgCompletion,
    vipCount,
    repeatPercent,
    estimatedRevenue,
    enhancedLaborTimeSaved,
    serviceScoreEstimate,
    requestsPerDay,
    topDepartments,
    commonWords,
    priorityBreakdown,
    serviceScoreTrend,
    repeatGuestTrend,
    requestsPerOccupiedRoom,
    topEscalationReasons,
    dailyCompletionRate = [],
    weeklyCompletionRate = [],
    monthlyCompletionRate = []
  } = data;

  const todayCount = requestsPerDay.find(d => d.date === range.end)?.count || 0;
  const dailyPct   = dailyCompletionRate.at(-1)?.completionRate || 0;
  const weeklyPct  = weeklyCompletionRate.at(-1)?.completionRate || 0;
  const monthlyPct = monthlyCompletionRate.at(-1)?.completionRate || 0;

  const dailyData      = requestsPerDay.map(d => ({ date: d.date, count: d.count }));
  const deptData       = topDepartments;
  const commonData     = commonWords.map(w => ({ name: w.word, value: w.count }));
  const priorityData   = priorityBreakdown;
  const scoreTrendData = serviceScoreTrend.map(d => ({ period: d.period, score: d.avgServiceScore }));
  const repeatTrendData= repeatGuestTrend.map(d => ({ period: d.period, repeatPct: d.repeatPct }));
  const perRoomData    = requestsPerOccupiedRoom.map(d => ({ date: d.date, value: d.requestsPerRoom }));
  const escData        = topEscalationReasons.map(d => ({ reason: d.reason, count: d.count }));

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
            <StatCard title="Requests Today"       value={todayCount} />
            <StatCard title="Missed SLAs"          value={missedSLAs} />
            <StatCard title="Avg Ack Time (min)"   value={avgAck} />
            <StatCard title="Avg Completion (min)" value={avgCompletion} />
            <StatCard title="Revenue"              value={`$${estimatedRevenue}`} />
            <StatCard title="Labor Saved (min)"    value={enhancedLaborTimeSaved} />
            <StatCard title="VIP Guests"           value={vipCount} />
            <StatCard title="Repeat Request %"     value={`${repeatPercent}%`} />
            <StatCard title="Service Score"        value={serviceScoreEstimate} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Requests Per Day */}
            <ChartSection title="Requests Per Day">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <XAxis dataKey="date" padding={{ left: 10, right: 10 }} />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke={COLORS[0]} />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Top Departments */}
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

            {/* Priority Breakdown */}
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

            {/* Percent Complete */}
            <ChartSection title="Percent Complete">
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <p className="text-xl font-semibold text-operon-charcoal">Per Day: {dailyPct}%</p>
                <p className="text-xl font-semibold text-operon-charcoal">Per Week: {weeklyPct}%</p>
                <p className="text-xl font-semibold text-operon-charcoal">Per Month: {monthlyPct}%</p>
              </div>
            </ChartSection>

            {/* Common Request Words */}
            <ChartSection title="Common Request Words">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={commonData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />  
                  <Bar dataKey="value" fill={COLORS[2]} />
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
                  <Line type="monotone" dataKey="score" stroke={COLORS[3]} />
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
                  <Line type="monotone" dataKey="repeatPct" stroke={COLORS[4]} />
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
                  <Line type="monotone" dataKey="value" stroke={COLORS[0]} />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Top Escalation Reasons */}
            <ChartSection title="Top Escalation Reasons">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={escData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="reason" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[1]} />
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
