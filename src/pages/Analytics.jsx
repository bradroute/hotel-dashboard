// src/components/Analytics.jsx

import React, { useState } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts'

export default function Analytics() {
  const today   = new Date().toISOString().slice(0,10)
  const weekAgo = new Date(Date.now() - 6*24*60*60*1000).toISOString().slice(0,10)
  const [range, setRange] = useState({ start: weekAgo, end: today })

  const { data, loading, error } = useAnalytics(range.start, range.end)

  if (loading) return <div className="p-6 text-lg font-medium">Loading analytics…</div>
  if (error)   return <div className="p-6 text-lg text-red-600">Error: {error}</div>

  // Pull out the new percent-complete metrics
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

    // chart data
    requestsPerDay,
    topDepartments,
    commonWords,
    priorityBreakdown,
    serviceScoreTrend,
    repeatGuestTrend,
    requestsPerOccupiedRoom,
    topEscalationReasons,

    // our new object from the backend
    percentComplete: {
      day: dailyPct,
      week: weeklyPct,
      month: monthlyPct
    } = { day: 0, week: 0, month: 0 }
  } = data

  // transform for recharts
  const dailyData   = requestsPerDay.map(d => ({ date: d.date, count: d.count }))
  const deptData    = topDepartments
  const commonData  = commonWords.map(w => ({ name: w.word, value: w.count }))
  const priorityData = priorityBreakdown
  const serviceScoreData = serviceScoreTrend.map(d => ({ period: d.period, score: d.avgServiceScore }))
  const repeatData = repeatGuestTrend.map(d => ({ period: d.period, repeatPct: d.repeatPct }))
  const perRoomData = requestsPerOccupiedRoom.map(d => ({ date: d.date, value: d.requestsPerRoom }))
  const escalationData = topEscalationReasons.map(d => ({ reason: d.reason, count: d.count }))

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-10">
      <h1 className="text-4xl font-bold text-gray-800">📊 Hotel Analytics</h1>

      {/* Date Range */}
      <div className="flex gap-4 items-center">
        <input
          type="date"
          className="border p-2 rounded shadow-sm"
          value={range.start}
          onChange={e => setRange(r => ({ ...r, start: e.target.value }))}
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          className="border p-2 rounded shadow-sm"
          value={range.end}
          onChange={e => setRange(r => ({ ...r, end: e.target.value }))}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <StatCard title="Total Requests"      value={total} />
        <StatCard title="Avg Acknowledge (min)"  value={avgAck} />
        <StatCard title="Missed SLAs"         value={missedSLAs} />
        <StatCard title="Requests Per Day" value={data.requestsPerDay.length} />
        <StatCard title="Avg Completion (min)" value={avgCompletion} />
        <StatCard title="VIP Guests"          value={vipCount} />
        <StatCard title="Repeat Request %"     value={`${repeatPercent}%`} />
        <StatCard title="Revenue"             value={`$${estimatedRevenue}`} />
        <StatCard title="Labor Saved (min)"   value={`${enhancedLaborTimeSaved}`} />
        <StatCard title="Service Score"       value={serviceScoreEstimate} />
      </div>

      {/* Charts + New Percent-Complete Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Requests per Day */}
        <ChartSection title="Requests Per Day">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" />
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

        {/* Priority Breakdown */}
        <ChartSection title="Priority Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={80} label>
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* Service Score Trend */}
        <ChartSection title="Service Score Trend">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={serviceScoreData}>
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
            <LineChart data={repeatData}>
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
            <BarChart data={escalationData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="reason" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* Percent Complete (chart-sized) */}
        <ChartSection title="Percent Complete">
          <div className="h-full flex flex-col items-center justify-center space-y-2">
            <p className="text-xl font-semibold">Per Day: {dailyPct}%</p>
            <p className="text-xl font-semibold">Per Week: {weeklyPct}%</p>
            <p className="text-xl font-semibold">Per Month: {monthlyPct}%</p>
          </div>
        </ChartSection>

      </div>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow flex flex-col items-center justify-center">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  )
}

function ChartSection({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      {children}
    </div>
  )
}
