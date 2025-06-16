import React, { useState } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts'

export default function Analytics() {
  const today   = new Date().toISOString().slice(0,10)
  const weekAgo = new Date(Date.now() - 6*24*60*60*1000).toISOString().slice(0,10)
  const [range, setRange] = useState({ start: weekAgo, end: today })

  const { data, loading, error } = useAnalytics(range.start, range.end)

  if (loading) return <div className="p-6 text-lg font-medium">Loading analytics…</div>
  if (error)   return <div className="p-6 text-lg text-red-600">Error: {error}</div>

  const deptData = Object.entries(data.deptBreakdown).map(([name, value]) => ({ name, value }))
  const dailyData = data.dailyResp.map(d => ({ date: d.date, avg: d.avgResponseTime }))
  const priorityData = Object.entries(data.priority).map(([name, value]) => ({ name, value }))
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-10">
      <h1 className="text-4xl font-bold text-gray-800">📊 Hotel Analytics</h1>

      {/* Date Range */}
      <div className="flex gap-4 items-center">
        <input type="date" className="border p-2 rounded shadow-sm" value={range.start} onChange={e => setRange(r => ({ ...r, start: e.target.value }))} />
        <span className="text-gray-500">to</span>
        <input type="date" className="border p-2 rounded shadow-sm" value={range.end} onChange={e => setRange(r => ({ ...r, end: e.target.value }))} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Total Requests" value={data.total} />
        <StatCard title="SLA Met" value={`${data.sla}%`} />
        <StatCard title="Avg Completion (min)" value={data.avgComplete} />
        <StatCard title="Escalations" value={data.escalations} />
        <StatCard title="Repeat Guests" value={data.repeatGuests.totalRepeatGuests} />
        <StatCard title="Repeat Requests" value={data.repeatGuests.totalRepeatRequests} />
        <StatCard title="Revenue" value={`$${data.revenue}`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ChartSection title="Requests by Department">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Volume Growth">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[data.volumeGrowth]}>
              <XAxis dataKey="periodCount" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="percentChange" stroke={COLORS[1]} />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Daily Response Time">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="avg" stroke={COLORS[2]} />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Priority Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={100} label>
                {priorityData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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
