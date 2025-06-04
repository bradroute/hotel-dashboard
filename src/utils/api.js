// src/utils/api.js

// In .env you should have something like:
//   REACT_APP_API_URL=http://localhost:3001
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * ---- Requests API ----
 */
export async function getRequests() {
  const res = await fetch(`${BASE_URL}/sms`);
  if (!res.ok) throw new Error(`getRequests failed: ${res.status}`);
  return res.json();
}

export async function acknowledgeRequest(id) {
  const res = await fetch(`${BASE_URL}/sms/${id}/acknowledge`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'acknowledgeRequest failed');
  }
  return res.json();
}

export async function completeRequest(id) {
  const res = await fetch(`${BASE_URL}/sms/${id}/complete`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'completeRequest failed');
  }
  return res.json();
}

/**
 * ---- Analytics API ----
 */

// GET /analytics/summary
export async function getSummary() {
  const res = await fetch(`${BASE_URL}/analytics/summary`);
  if (!res.ok) throw new Error(`getSummary failed: ${res.status}`);
  return res.json();
}

// GET /analytics/by-department
export async function getByDepartment() {
  const res = await fetch(`${BASE_URL}/analytics/by-department`);
  if (!res.ok) throw new Error(`getByDepartment failed: ${res.status}`);
  return res.json();
}

// GET /analytics/avg-response-time
export async function getAvgResponseTime() {
  const res = await fetch(`${BASE_URL}/analytics/avg-response-time`);
  if (!res.ok) throw new Error(`getAvgResponseTime failed: ${res.status}`);
  return res.json();
}

// GET /analytics/daily-response-times
export async function getDailyResponseTimes() {
  const res = await fetch(`${BASE_URL}/analytics/daily-response-times`);
  if (!res.ok) throw new Error(`getDailyResponseTimes failed: ${res.status}`);
  return res.json();
}
