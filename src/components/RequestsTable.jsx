import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, StickyNote, Info } from 'lucide-react';
import styles from '../styles/Dashboard.module.css';

const rowVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.16 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString('en-US', {
      timeZone: 'America/Chicago', // keep your current behavior (can be made a prop later)
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function RequestsTable({
  requests,
  onAcknowledge,
  onComplete,
  onRowClick,
  onOpenNotes,
  onOpenDetails,
}) {
  return (
    <div className={`${styles.tableContainer} overflow-x-auto`}>
      <table className={`${styles.requestsTable} w-full text-sm`}>
        <thead className="sticky top-0 z-[1] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <tr>
            <th className="whitespace-nowrap text-left px-3 py-2">Created</th>
            <th className="whitespace-nowrap text-center px-3 py-2">Room</th>
            <th className="whitespace-nowrap text-center px-3 py-2 min-w-[160px]">From</th>
            <th className="whitespace-nowrap text-center px-3 py-2">Department</th>
            <th className="whitespace-nowrap text-center px-3 py-2">Priority</th>
            <th className={`${styles.messageCol} px-3 py-2 min-w-[300px] text-left`}>Message</th>
            <th className="whitespace-nowrap text-center px-3 py-2">Notes</th>
            <th className="whitespace-nowrap text-center px-3 py-2">Details</th>
            <th className="whitespace-nowrap text-center px-3 py-2">Acknowledge</th>
            <th className="whitespace-nowrap text-center px-3 py-2">Complete</th>
          </tr>
        </thead>

        <tbody>
          <AnimatePresence initial={false}>
            {requests.map((r) => {
              const priority = (r.priority || '').toLowerCase();
              const isUrgent = priority === 'urgent' || priority === 'high';

              const priorityClass =
                isUrgent
                  ? styles.priorityUrgent
                  : priority === 'low'
                  ? styles.priorityLow
                  : styles.priorityNormal;

              const baseRow =
                `${styles.row} ${r.is_vip ? styles.vipRow : ''} ${r.is_staff ? styles.staffRow : ''}`;

              const hoverRow =
                'group cursor-pointer transition-colors hover:bg-operon-background focus:bg-operon-background outline-none';

              return (
                <motion.tr
                  key={r.id}
                  className={`${baseRow} ${hoverRow}`}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onClick={() => onRowClick(r.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick(r.id);
                    }
                  }}
                >
                  {/* Created */}
                  <td className="px-3 py-2 align-top">
                    <time dateTime={r.created_at}>{formatDate(r.created_at)}</time>
                  </td>

                  {/* Room */}
                  <td className="px-3 py-2 align-top text-center">
                    {r.room_number || '—'}
                  </td>

                  {/* From + badges */}
                  <td className="px-3 py-2 align-top text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-operon-charcoal">{r.from_phone || '—'}</span>
                      <div className="flex gap-1 mt-1">
                        {r.is_vip && <span className={`${styles.vipBadge}`}>VIP</span>}
                        {r.is_staff && <span className={`${styles.staffBadge}`}>STAFF</span>}
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-3 py-2 align-top text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-operon-blue border border-blue-100 text-xs">
                      {r.department || '—'}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-2 align-top text-center">
                    <span className={`${priorityClass} inline-block`}>
                      {(r.priority || '').toUpperCase() || '—'}
                    </span>
                  </td>

                  {/* Message */}
                  <td
                    className={`${styles.messageCol} px-3 py-2 align-top text-gray-700`}
                    title={r.message}
                  >
                    <div className="truncate max-w-[48rem]">{r.message}</div>
                  </td>

                  {/* Notes */}
                  <td className="px-3 py-2 align-top text-center">
                    <button
                      type="button"
                      aria-label="Open notes"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 active:scale-[.99]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNotes(r.id);
                      }}
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                      Notes
                    </button>
                  </td>

                  {/* Details */}
                  <td className="px-3 py-2 align-top text-center">
                    <button
                      type="button"
                      aria-label="Open details"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 active:scale-[.99]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(r); // pass entire request
                      }}
                    >
                      <Info className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </td>

                  {/* Acknowledge */}
                  <td className="px-3 py-2 align-top text-center">
                    {r.acknowledged ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Ack’d
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label="Acknowledge request"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 text-operon-blue px-3 py-1.5 text-xs hover:bg-blue-100 active:scale-[.99]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledge(r.id);
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>

                  {/* Complete */}
                  <td className="px-3 py-2 align-top text-center">
                    {r.completed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Done
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label="Complete request"
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs hover:bg-emerald-100 active:scale-[.99]"
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
