import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/Dashboard.module.css';

const rowVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};

export default function RequestsTable({
  requests,
  onAcknowledge,
  onComplete,
  onRowClick,
  onOpenNotes,
  onOpenDetails, // <-- new prop
}) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.requestsTable}>
        <thead>
          <tr>
            <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Created At</th>
            <th style={{ width: '70px', whiteSpace: 'nowrap' }}>Room</th>
            <th style={{ minWidth: '160px', whiteSpace: 'nowrap' }}>From</th>
            <th style={{ whiteSpace: 'nowrap', paddingRight: '24px' }}>Department</th>
            <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Priority</th>
            <th className={styles.messageCol} style={{ minWidth: '300px' }}>Message</th>
            <th style={{ width: '90px', whiteSpace: 'nowrap' }}>Notes</th>
            <th style={{ width: '110px', whiteSpace: 'nowrap' }}>Details</th>{/* Details button column */}
            <th style={{ width: '130px', whiteSpace: 'nowrap' }}>Acknowledge</th>
            <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Complete</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {requests.map((r) => {
              const priority = r.priority?.toLowerCase?.() || '';
              // Make high and urgent both RED (fixes your override)
              const priorityClass =
                priority === 'urgent' || priority === 'high'
                  ? styles.priorityUrgent
                  : priority === 'low'
                  ? styles.priorityLow
                  : styles.priorityNormal;

              const rowClass = [
                styles.row,
                r.is_vip ? styles.vipRow : '',
                r.is_staff ? styles.staffRow : '',
                'cursor-pointer transition',
              ].join(' ');

              return (
                <motion.tr
                  key={r.id}
                  onClick={() => onRowClick(r.id)}
                  className={rowClass}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <td>
                    {new Date(r.created_at).toLocaleString('en-US', {
                      timeZone: 'America/Chicago',
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </td>
                  <td style={{ textAlign: 'center' }}>{r.room_number || '—'}</td>
                  <td>
                    <div className="flex flex-col items-start">
                      <span>{r.from_phone}</span>
                      <div className="flex gap-1 mt-1">
                        {r.is_vip && <span className={styles.vipBadge}>VIP</span>}
                        {r.is_staff && <span className={styles.staffBadge}>STAFF</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{r.department}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={priorityClass}>{r.priority?.toUpperCase?.()}</span>
                  </td>
                  <td className={styles.messageCol}>{r.message}</td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.notesBtn}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNotes(r.id);
                      }}
                    >
                      Notes
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.detailsBtn}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(r); // Pass the whole request
                      }}
                    >
                      Details
                    </button>
                  </td>
                  <td>
                    {r.acknowledged ? (
                      <span className={styles.doneIcon} aria-label="acknowledged">✔️</span>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.ackBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledge(r.id);
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                  <td>
                    {r.completed ? (
                      <span className={styles.doneIcon} aria-label="completed">✔️</span>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.completeBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onComplete(r.id);
                        }}
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
