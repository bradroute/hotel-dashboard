// src/pages/RequestForm.jsx
import React, { useState } from 'react';
import { useParams }       from 'react-router-dom';

export default function RequestForm() {
  const { hotelId } = useParams();
  const [message, setMessage] = useState('');
  const [status, setStatus]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending…');
    const res = await fetch('/api/webform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotel_id: hotelId, message }),
    });
    if (res.ok) {
      setStatus('✅ Request submitted!');
      setMessage('');
    } else {
      setStatus('❌ Submission failed.');
    }
  };

  return (
    <div style={{ maxWidth:400, margin:'2rem auto' }}>
      <h2>Send a Request</h2>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column' }}>
        <textarea
          rows={4}
          placeholder="Your request…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          style={{ marginBottom:8, padding:8 }}
        />
        <button type="submit" style={{ padding:8 }}>Submit</button>
        {status && <p style={{ marginTop:8 }}>{status}</p>}
      </form>
    </div>
  );
}
