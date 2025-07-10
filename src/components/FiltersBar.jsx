// src/components/FiltersBar.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';
import { motion } from 'framer-motion';

const barVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } }
};

export default function FiltersBar({
  showActiveOnly,
  onToggleActive,
  unacknowledgedOnly,
  onToggleUnacknowledged,
  selectedDepartment,
  onChangeDepartment,
  departmentOptions,
  selectedPriority,
  onChangePriority,
  priorityOptions,
  sortOrder,
  onChangeSort,
  searchTerm,
  onChangeSearch
}) {
  return (
    <motion.div
      className={styles.filterBar}
      variants={barVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      <div className={styles.checkboxGroup}>
        <label>
          <input
            type="checkbox"
            className={styles.filterCheckbox}
            checked={showActiveOnly}
            onChange={(e) => onToggleActive(e.target.checked)}
          />
          <span className="text-operon-charcoal font-medium">Show Active Only</span>
        </label>

        <label>
          <input
            type="checkbox"
            className={styles.filterCheckbox}
            checked={unacknowledgedOnly}
            onChange={(e) => onToggleUnacknowledged(e.target.checked)}
          />
          <span className="text-operon-charcoal font-medium">Unacknowledged Only</span>
        </label>
      </div>

      <label>
        <span className="text-operon-charcoal font-medium mr-1">Department:</span>
        <select
          className={styles.filterSelect}
          value={selectedDepartment}
          onChange={(e) => onChangeDepartment(e.target.value)}
        >
          <option value="All">All Departments</option>
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="text-operon-charcoal font-medium mr-1">Priority:</span>
        <select
          className={styles.filterSelect}
          value={selectedPriority}
          onChange={(e) => onChangePriority(e.target.value)}
        >
          <option value="All">All Priorities</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="text-operon-charcoal font-medium mr-1">Sort:</span>
        <select
          className={styles.filterSelect}
          value={sortOrder}
          onChange={(e) => onChangeSort(e.target.value)}
        >
          <option value="newest">Newest → Oldest</option>
          <option value="oldest">Oldest → Newest</option>
        </select>
      </label>

      <motion.input
        type="text"
        placeholder="Search..."
        className={styles.filterSearch}
        value={searchTerm}
        onChange={(e) => onChangeSearch(e.target.value)}
        whileFocus={{ scale: 1.025, boxShadow: '0 0 0 2px #47B2FF33' }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </motion.div>
  );
}
