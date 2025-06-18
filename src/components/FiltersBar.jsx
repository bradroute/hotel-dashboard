// src/components/FiltersBar.jsx

import React from 'react';

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
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {/* Active Only */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={showActiveOnly}
          onChange={(e) => onToggleActive(e.target.checked)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-gray-700">Show Active Only</span>
      </label>

      {/* Unacknowledged Only */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={unacknowledgedOnly}
          onChange={(e) => onToggleUnacknowledged(e.target.checked)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-gray-700">Unacknowledged Only</span>
      </label>

      {/* Department Filter */}
      <label className="flex items-center space-x-2">
        <span className="text-gray-700">Department:</span>
        <select
          value={selectedDepartment}
          onChange={(e) => onChangeDepartment(e.target.value)}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="All">All Departments</option>
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </label>

      {/* Priority Filter */}
      <label className="flex items-center space-x-2">
        <span className="text-gray-700">Priority:</span>
        <select
          value={selectedPriority}
          onChange={(e) => onChangePriority(e.target.value)}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="All">All Priorities</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </label>

      {/* Sort Order */}
      <label className="flex items-center space-x-2">
        <span className="text-gray-700">Sort:</span>
        <select
          value={sortOrder}
          onChange={(e) => onChangeSort(e.target.value)}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="newest">Newest → Oldest</option>
          <option value="oldest">Oldest → Newest</option>
        </select>
      </label>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => onChangeSearch(e.target.value)}
        className="flex-grow max-w-xs p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}
