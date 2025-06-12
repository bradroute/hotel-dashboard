// src/utils/api.js

// In .env you should have something like:
//   REACT_APP_API_URL=http://localhost:3001

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ── Requests API ─────────────────────────────────────────────────────────────

export async function getAllRequests() {
  const res = await fetch(`${BASE_URL}/requests`);
  if (!res.ok) throw new Error(`getAllRequests failed: ${res.status}`);
  return res.json();
}

export async function acknowledgeRequest(id) {
  const res = await fetch(`${BASE_URL}/requests/${id}/acknowledge`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'acknowledgeRequest failed');
  }
  return res.json();
}

export async function completeRequest(id) {
  const res = await fetch(`${BASE_URL}/requests/${id}/complete`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'completeRequest failed');
  }
  return res.json();
}

// ── Analytics API ────────────────────────────────────────────────────────────

export async function getSummary() {
  const res = await fetch(`${BASE_URL}/analytics/summary`);
  if (!res.ok) throw new Error(`getSummary failed: ${res.status}`);
  return res.json();
}

export async function getByDepartment() {
  const res = await fetch(`${BASE_URL}/analytics/by-department`);
  if (!res.ok) throw new Error(`getByDepartment failed: ${res.status}`);
  return res.json();
}

export async function getAvgResponseTime() {
  const res = await fetch(`${BASE_URL}/analytics/avg-response-time`);
  if (!res.ok) throw new Error(`getAvgResponseTime failed: ${res.status}`);
  return res.json();
}

export async function getDailyResponseTimes() {
  const res = await fetch(`${BASE_URL}/analytics/daily-response-times`);
  if (!res.ok) throw new Error(`getDailyResponseTimes failed: ${res.status}`);
  return res.json();
}

// ── Notes API ────────────────────────────────────────────────────────────────

export async function getNotes(requestId) {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/notes`);
  if (!res.ok) throw new Error(`getNotes failed: ${res.status}`);
  return res.json();
}

export async function addNote(requestId, content) {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'addNote failed');
  }
  return res.json();
}

export async function deleteNote(requestId, noteId) {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/notes/${noteId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'deleteNote failed');
  }
  return res.json();
}
