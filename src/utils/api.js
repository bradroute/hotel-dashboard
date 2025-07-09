// src/utils/api.js

// In .env you should have something like:
//   REACT_APP_API_URL=http://localhost:3001

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ── Requests API ─────────────────────────────────────────────────────────────

/**
 * Fetch all requests, optionally scoped to a specific hotel.
 * @param {string} [hotelId] – if provided, only returns requests for that hotel
 */
export async function getAllRequests(hotelId) {
  const url = new URL(`${BASE_URL}/requests`);
  if (hotelId) {
    url.searchParams.append('hotel_id', hotelId);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`getAllRequests failed: ${res.status}`);
  return res.json();
}

/**
 * Acknowledge a request (optionally scoped by hotel_id).
 * @param {string} id – request ID
 * @param {string} [hotelId] – if provided, passed through as query
 */
export async function acknowledgeRequest(id, hotelId) {
  const url = new URL(`${BASE_URL}/requests/${id}/acknowledge`);
  if (hotelId) url.searchParams.append('hotel_id', hotelId);
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'acknowledgeRequest failed');
  }
  return res.json();
}

/**
 * Complete a request (optionally scoped by hotel_id).
 * @param {string} id – request ID
 * @param {string} [hotelId] – if provided, passed through as query
 */
export async function completeRequest(id, hotelId) {
  const url = new URL(`${BASE_URL}/requests/${id}/complete`);
  if (hotelId) url.searchParams.append('hotel_id', hotelId);
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'completeRequest failed');
  }
  return res.json();
}

// ── Analytics API ────────────────────────────────────────────────────────────

/**
 * Fetch summary analytics, optionally scoped to a specific hotel.
 * @param {string} [hotelId]
 */
export async function getSummary(hotelId) {
  const url = new URL(`${BASE_URL}/analytics/summary`);
  if (hotelId) url.searchParams.append('hotel_id', hotelId);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`getSummary failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch analytics by department, optionally scoped to a specific hotel.
 * @param {string} [hotelId]
 */
export async function getByDepartment(hotelId) {
  const url = new URL(`${BASE_URL}/analytics/by-department`);
  if (hotelId) url.searchParams.append('hotel_id', hotelId);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`getByDepartment failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch average response time analytics, optionally scoped to a specific hotel.
 * @param {string} [hotelId]
 */
export async function getAvgResponseTime(hotelId) {
  const url = new URL(`${BASE_URL}/analytics/avg-response-time`);
  if (hotelId) url.searchParams.append('hotel_id', hotelId);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`getAvgResponseTime failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch daily response times analytics, optionally scoped to a specific hotel.
 * @param {string} [hotelId]
 */
export async function getDailyResponseTimes(hotelId) {
  const url = new URL(`${BASE_URL}/analytics/daily-response-times`);
  if (hotelId) url.searchParams.append('hotel_id', hotelId);
  const res = await fetch(url);
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
  const res = await fetch(
    `${BASE_URL}/requests/${requestId}/notes/${noteId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'deleteNote failed');
  }
  return res.json();
}

// ── Department Settings API ──────────────────────────────────────────────────

/**
 * Fetch enabled departments for a property.
 * @param {string} [hotelId]
 */
export async function getEnabledDepartments(hotelId) {
  const url = new URL(`${BASE_URL}/settings/departments`);
  if (hotelId) url.searchParams.append('hotel_id', hotelId);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`getEnabledDepartments failed: ${res.status}`);
  return res.json();
}

/**
 * Update enabled departments for a property.
 * @param {string} [hotelId]
 * @param {Array<string>} departments
 */
export async function updateEnabledDepartments(hotelId, departments) {
  const url = new URL(`${BASE_URL}/settings/departments`);
  if (hotelId) url.searchParams.append('hotel_id', hotelId);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ departments }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'updateEnabledDepartments failed');
  }
  return res.json();
}
