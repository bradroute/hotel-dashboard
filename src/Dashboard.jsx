// src/Dashboard.jsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Dashboard.module.css';
import {
  acknowledgeRequest,
  completeRequest,
} from './utils/api';
import FiltersBar from './components/FiltersBar';
import RequestsTable from './components/RequestsTable';
import { supabase } from './utils/supabaseClient';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Hide completed by default
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', user.id)
        .single();
      if (!profile) throw new Error('Profile not found');

      const { data, error: reqErr } = await supabase
        .from('requests')
        .select('*')
        .eq('hotel_id', profile.hotel_id)
        .order('created_at', { ascending: false });
      if (reqErr) throw reqErr;

      setRequests(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const departmentOptions = useMemo(() => {
    const deps = requests.map((r) => r.department || 'General');
    return ['All', ...Array.from(new Set(deps))];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => (showActiveOnly ? !r.completed : true))
      .filter((r) => (selectedDepartment === 'All' ? true : r.department === selectedDepartment));
  }, [requests, showActiveOnly, selectedDepartment]);

  const handleRowClick = (id) => navigate(`/request/${id}`);

  return (
    <div className={styles.container}>
      <h1>📋 Hotel Request Dashboard</h1>

      {error && <div className={styles.errorBanner}><p>Error: {error}</p></div>}

      <FiltersBar
        showActiveOnly={showActiveOnly}
        onToggleActive={setShowActiveOnly}
        selectedDepartment={selectedDepartment}
        onChangeDepartment={setSelectedDepartment}
        departmentOptions={departmentOptions}
      />

      {loading ? (
        <div className={styles.overlay}>
          <div className={styles.spinner} role="status" />
          <span>Loading requests…</span>
        </div>
      ) : (
        filteredRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No {showActiveOnly ? 'active' : ''} requests right now 🎉</p>
          </div>
        ) : (
          <RequestsTable
            requests={filteredRequests}
            onAcknowledge={async (id) => {
              await acknowledgeRequest(id);
              fetchAll();
            }}
            onComplete={async (id) => {
              await completeRequest(id);
              fetchAll();
            }}
            onRowClick={handleRowClick}
          />
        )
      )}
    </div>
  );
}

