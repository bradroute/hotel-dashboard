// src/components/RequestRow.jsx

import React, { useEffect, useState } from 'react';
import styles from '../styles/Dashboard.module.css';

/**
 * Props:
 *  - request: { id, from, message, department, priority, created_at, acknowledged, completed }
 *  - onAcknowledge: function(id)
 *  - onComplete: function(id)
 *  - onRowClick: function(id)
 */
export default function RequestRow({ request, onAcknowledge, onComplete, onRowClick }) {
  const { id, from, message, department, priority, created_at, acknowledged, completed } = request;

  // Determine CSS class based on priority
  let priorityClass = '';
  if (priority.toLowerCase() === 'urgent') {
    priorityClass = styles.priorityUrgent;
  } else if (priority.toLowerCase() === 'normal') {
    priorityClass = styles.priorityNormal;
  } else if (priority.toLowerCase() === 'low') {
    priorityClass = styles.priorityLow;
  }

  const [createdAtCentral, setCreatedAtCentral] = useState('');

  useEffect(() => {
    if (created_at) {
      const dateObj = new Date(created_at);
      if (isNaN(dateObj.getTime())) {
        setCreatedAtCentral(created_at); // fallback
        return;
      }

      const formatted = dateObj.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });

      setCreatedAtCentral(formatted);
    }
  }, [created_at]);

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={() => onRowClick(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRowClick(id);
        }
      }}
      className="hover:bg-gray-100 transition"
    >
      <td className="text-sm text-operon-charcoal">{createdAtCentral || '—'}</td>
      <td className="text-sm text-operon-charcoal">{from}</td>
      <td className="text-sm text-operon-charcoal">{department}</td>
      <td>
        <span className={`${priorityClass} inline-block`}>{priority}</span>
      </td>
      <td className={`text-sm ${styles.messageCol}`}>{message}</td>
      <td>
        {acknowledged ? (
          <span className="text-green-600 text-lg" aria-label="Acknowledged">
            ✅
          </span>
        ) : (
          <button
            className={styles.ackBtn}
            aria-label="Acknowledge request"
            onClick={(e) => {
              e.stopPropagation();
              onAcknowledge(id);
            }}
          >
            Acknowledge
          </button>
        )}
      </td>
      <td>
        {completed ? (
          <span className="text-green-600 text-lg" aria-label="Completed">
            ✅
          </span>
        ) : (
          <button
            className={styles.completeBtn}
            aria-label="Complete request"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(id);
            }}
          >
            Complete
          </button>
        )}
      </td>
    </tr>
  );
}
