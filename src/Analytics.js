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

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Analytics</h1>

      <h2>Summary</h2>
      <ul>
        <li>Today: {summary.today}</li>
        <li>This Week: {summary.this_week}</li>
        <li>This Month: {summary.this_month}</li>
        <li>Avg. Response Time: {avgResponse !== null ? `${avgResponse} min` : 'Loading...'}</li>
      </ul>

      <h2>Requests by Department</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={departments}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="department" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: '2rem' }}>Daily Avg. Response Time (minutes)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dailyResponseData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="avg_minutes" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Analytics;
