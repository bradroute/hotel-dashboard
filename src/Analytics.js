import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from 'recharts';

function Analytics() {
  const [summary, setSummary] = useState({});
  const [departments, setDepartments] = useState([]);
  const [avgResponse, setAvgResponse] = useState(null);
  const [dailyResponseData, setDailyResponseData] = useState([]);

  useEffect(() => {
    fetch('https://hotel-ops-api.onrender.com/analytics/summary')
      .then(res => res.json())
      .then(data => setSummary(data));

    fetch('https://hotel-ops-api.onrender.com/analytics/by-department')
      .then(res => res.json())
      .then(data => {
        const formatted = Object.entries(data).map(([key, value]) => ({
          department: key,
          count: value
        }));
        setDepartments(formatted);
      });

    fetch('https://hotel-ops-api.onrender.com/analytics/avg-response-time')
      .then(res => res.json())
      .then(data => setAvgResponse(data.average_response_time_minutes));

    fetch('https://hotel-ops-api.onrender.com/analytics/daily-response-times')
      .then(res => res.json())
      .then(data => setDailyResponseData(data));
  }, []);

  const containerStyle = {
    padding: '2rem',
    minHeight: '100vh',
    backgroundColor: '#f4f4f5',
    fontFamily: 'sans-serif'
  };

  const cardStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  };

  const gridStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem'
  };

  const statBox = {
    flex: '1 1 22%',
    background: '#f9fafb',
    padding: '1rem',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '14px',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
  };

  const chartCard = {
    background: '#f9fafb',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '2rem',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: '24px', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
          <span role="img" aria-label="bar chart" style={{ marginRight: '0.5rem' }}>📊</span>
          Analytics
        </h1>

        <div style={gridStyle}>
          <div style={statBox}>
            <p style={{ color: '#6b7280' }}>Today</p>
            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{summary.today ?? 0}</p>
          </div>
          <div style={statBox}>
            <p style={{ color: '#6b7280' }}>This Week</p>
            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{summary.this_week ?? 0}</p>
          </div>
          <div style={statBox}>
            <p style={{ color: '#6b7280' }}>This Month</p>
            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{summary.this_month ?? 0}</p>
          </div>
          <div style={statBox}>
            <p style={{ color: '#6b7280' }}>Avg. Response Time</p>
            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
              {avgResponse !== null ? `${avgResponse} min` : '—'}
            </p>
          </div>
        </div>

        <div style={chartCard}>
          <h2 style={{ fontSize: '16px', marginBottom: '1rem' }}>Requests by Department</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={departments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCard}>
          <h2 style={{ fontSize: '16px', marginBottom: '1rem' }}>Daily Avg. Response Time (minutes)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyResponseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avg_minutes" stroke="#34d399" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
