import React, { useEffect, useState, useMemo, useCallback } from 'react';
import styles from './styles/Dashboard.module.css';

import {
  getRequests,
  acknowledgeRequest,
  completeRequest,
} from './utils/api';

import FiltersBar from './components/FiltersBar';
import RequestsTable from './components/RequestsTable';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Fetch all requests from the API
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // clear any previous error
      const data = await getRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Optional: auto-refresh every 60 seconds
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Pull out unique department names for the dropdown
  const departmentOptions = useMemo(() => {
    const allDeps = requests.map((r) => r.department || 'unknown');
    return Array.from(new Set(allDeps));
  }, [requests]);

  // Apply the two filters: showActiveOnly and department
  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        if (showActiveOnly && r.completed) return false;
        return true;
      })
      .filter((r) => {
        if (selectedDepartment === 'All') return true;
        return r.department === selectedDepartment;
      });
  }, [requests, showActiveOnly, selectedDepartment]);

  return (
    <div className={styles.container}>
      <h1>📋 Hotel Request Dashboard</h1>

      {/** Show an error banner if there’s an error */}
      {error && (
        <div className={styles.errorBanner}>
          {/* You can replace <p> with an icon + text if you want */}
          <p>Error: {error}</p>
        </div>
      )}

      {/** Always show filters, even if loading or error */}
      <FiltersBar
        showActiveOnly={showActiveOnly}
        onToggleActive={(val) => setShowActiveOnly(val)}
        selectedDepartment={selectedDepartment}
        onChangeDepartment={(val) => setSelectedDepartment(val)}
        departmentOptions={departmentOptions}
      />

      {/** Inline loading state */}
      {loading ? (
        <div className={styles.overlay}>
          <div className={styles.spinner} />
          <span>Loading requests…</span>
        </div>
      ) : (
        <RequestsTable
          requests={filteredRequests}
          onAcknowledge={async (id) => {
            try {
              await acknowledgeRequest(id);
              fetchAll();
            } catch (err) {
              alert('Acknowledgment failed: ' + err.message);
            }
          }}
          onComplete={async (id) => {
            try {
              await completeRequest(id);
              fetchAll();
            } catch (err) {
              alert('Completion failed: ' + err.message);
            }
          }}
        />
      )}
    </div>
  );
}
