import React, { useMemo } from 'react';
import {
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  generateDynamicMonthOptions,
  getCurrentYearMonth,
} from '../utils/calculate.js';

/**
 * CategoryFilter Component
 * Dynamically generates multi-year and rolling monthly filter options so
 * new months and years appear automatically as time passes.
 */
export default function CategoryFilter({
  selectedCategory = 'All',
  onSelectCategory,
  selectedMonth = getCurrentYearMonth(),
  onSelectMonth,
  selectedVehicle = 'All',
  onSelectVehicle,
  vehicles = [],
  records = [],
  searchQuery = '',
  onSearchChange,
  filterType = 'expense', // 'expense' | 'income' | 'mileage'
}) {
  const monthOptions = useMemo(() => generateDynamicMonthOptions(records), [records]);

  const categories =
    filterType === 'income'
      ? ['All', ...INCOME_SOURCES]
      : filterType === 'mileage'
      ? ['All', 'Work', 'Personal']
      : ['All', ...EXPENSE_CATEGORIES];

  return (
    <div className="dmg-filter-bar">
      <div className="dmg-category-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`dmg-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory && onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="dmg-filter-controls">
        {filterType === 'mileage' && vehicles.length > 0 && onSelectVehicle && (
          <select
            className="dmg-filter-month-select"
            value={selectedVehicle}
            onChange={(e) => onSelectVehicle(e.target.value)}
            aria-label="Filter by vehicle"
          >
            <option value="All">All Vehicles ({vehicles.length})</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        )}

        {onSearchChange && (
          <input
            type="text"
            className="dmg-filter-search"
            placeholder="Filter records..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        )}

        {onSelectMonth && (
          <select
            className="dmg-filter-month-select"
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.shortLabel}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
