import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const refreshRequests = () => {
    fetch('https://hotel-ops-api.onrender.com/sms')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error('Error fetching requests:', err));
  };

  useEffect(() => {
    refreshRequests();
    const interval = setInterval(refreshRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id) => {
    await fetch(`https://hotel-ops-api.onrender.com/sms/${id}/acknowledge`, {
      method: 'PATCH'
    });
    refreshRequests();
  };

  const handleComplete = async (id) => {
    await fetch(`https://hotel-ops-api.onrender.com/sms/${id}/complete`, {
      method: 'PATCH'
    });
    refreshRequests();
  };

  const getPriorityStyle = (priority) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return { backgroundColor: '#ef4444', color: 'white' };
      case 'normal':
        return { backgroundColor: '#facc15', color: '#78350f' };
      case 'low':
        return { backgroundColor: '#3b82f6', color: 'white' };
      default:
        return { backgroundColor: '#e5e7eb', color: '#1f2937' };
    }
  };

  return (
    <div style={{ padding: '3rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
        padding: '3rem'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '2rem' }}>📋 Hotel Request Dashboard</h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
          <label style={{ fontSize: '1.1rem' }}>
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={() => setShowActiveOnly(!showActiveOnly)}
              style={{ marginRight: '0.5rem' }}
            />
            Show only active requests
          </label>

          <label style={{ fontSize: '1.1rem' }}>
            Department:
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{
                marginLeft: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            >
              <option value="All">All</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="maintenance">Maintenance</option>
              <option value="room service">Room Service</option>
              <option value="valet">Valet</option>
              <option value="front desk">Front Desk</option>
            </select>
          </label>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={th}>Room</th>
                <th style={th}>Message</th>
                <th style={th}>Department</th>
                <th style={th}>Priority</th>
                <th style={th}>Received</th>
                <th style={th}>Acknowledged At</th>
                <th style={th}>Acknowledged</th>
                <th style={th}>Completed</th>
              </tr>
            </thead>
            <tbody>
              {requests
                .filter(r => !showActiveOnly || !r.completed)
                .filter(r => selectedDepartment === 'All' || r.department === selectedDepartment)
                .map((r, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                    <td style={td}>{r.from}</td>
                    <td style={td}>{r.message}</td>
                    <td style={td}>{r.department}</td>
                    <td style={td}>
                      <div style={{
                        ...getPriorityStyle(r.priority),
                        display: 'inline-block',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        {r.priority}
                      </div>
                    </td>
                    <td style={td}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={td}>{r.acknowledged_at ? new Date(r.acknowledged_at).toLocaleString() : '—'}</td>
                    <td style={td}>
                      {r.acknowledged ? '✅' : (
                        <button style={btn} onClick={() => handleAcknowledge(r.id)}>Acknowledge</button>
                      )}
                    </td>
                    <td style={td}>
                      {r.completed ? '✅' : (
                        <button style={btnAlt} onClick={() => handleComplete(r.id)}>Complete</button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const th = {
  padding: '1rem',
  textAlign: 'left',
  fontWeight: '600',
  fontSize: '1rem',
  borderBottom: '2px solid #d1d5db',
  whiteSpace: 'nowrap'
};

const td = {
  padding: '1rem',
  borderBottom: '1px solid #e5e7eb',
  verticalAlign: 'top',
  fontSize: '1rem'
};

const btn = {
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.95rem'
};

const btnAlt = {
  ...btn,
  backgroundColor: '#3b82f6'
};

export default Dashboard;
