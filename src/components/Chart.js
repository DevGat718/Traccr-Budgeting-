import React, { useState } from 'react';
import { formatCurrency } from '../utils/calculate.js';

/**
 * 1. Income vs Expenses Bar Chart (Zero-state aware & dynamic year)
 */
export function IncomeVsExpensesChart({ series = [] }) {
  const [rangeMonths, setRangeMonths] = useState(6);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const visibleSeries = series.slice(-rangeMonths);
  const maxVal = Math.max(
    4500,
    ...visibleSeries.map((d) => Math.max(d.income || 0, d.expenses || 0))
  );

  const yTicks = [4500, 3000, 2000, 1000, 0];

  return (
    <div className="dmg-card dmg-chart-card">
      <div className="dmg-card-header">
        <h3 className="dmg-card-title">Income vs Expenses</h3>
        <select
          className="dmg-mini-select"
          value={rangeMonths}
          onChange={(e) => setRangeMonths(Number(e.target.value))}
          aria-label="Select month range"
        >
          <option value={6}>6 Months</option>
          <option value={4}>4 Months</option>
          <option value={3}>3 Months</option>
        </select>
      </div>

      <div className="dmg-bar-legend">
        <span className="dmg-legend-item">
          <span className="dmg-legend-dot income-dot" />
          Income
        </span>
        <span className="dmg-legend-item">
          <span className="dmg-legend-dot expense-dot" />
          Expenses
        </span>
      </div>

      <div className="dmg-bar-chart-area">
        <div className="dmg-y-axis">
          {yTicks.map((tick) => (
            <span key={tick} className="dmg-y-tick">
              {tick === 0 ? '0' : tick.toLocaleString()}
            </span>
          ))}
        </div>

        <div className="dmg-bars-stage">
          <div className="dmg-grid-lines">
            {yTicks.map((tick) => (
              <div key={tick} className="dmg-grid-line" />
            ))}
          </div>

          <div className="dmg-bars-columns">
            {visibleSeries.map((item, idx) => {
              const incHeight = item.income > 0 ? Math.min(100, Math.max(5, Math.round((item.income / maxVal) * 100))) : 1;
              const expHeight = item.expenses > 0 ? Math.min(100, Math.max(5, Math.round((item.expenses / maxVal) * 100))) : 1;
              const shadowHeight = item.income > 0 ? Math.min(100, Math.max(4, Math.round(((item.income * 0.82) / maxVal) * 100))) : 1;

              return (
                <div
                  key={item.monthKey}
                  className="dmg-bar-group-col"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {hoveredIdx === idx && (
                    <div className="dmg-bar-tooltip">
                      <div className="dmg-tt-title">
                        {item.label} {item.year || ''}
                      </div>
                      <div className="dmg-tt-row inc">
                        Income: <strong>{formatCurrency(item.income)}</strong>
                      </div>
                      <div className="dmg-tt-row exp">
                        Expenses: <strong>{formatCurrency(item.expenses)}</strong>
                      </div>
                    </div>
                  )}

                  <div className="dmg-bars-trio">
                    <div
                      className="dmg-bar dmg-bar-income"
                      style={{ height: `${incHeight}%`, opacity: item.income > 0 ? 1 : 0.25 }}
                    />
                    <div
                      className="dmg-bar dmg-bar-shadow"
                      style={{ height: `${shadowHeight}%`, opacity: item.income > 0 ? 1 : 0.15 }}
                    />
                    <div
                      className="dmg-bar dmg-bar-expense"
                      style={{ height: `${expHeight}%`, opacity: item.expenses > 0 ? 1 : 0.25 }}
                    />
                  </div>
                  <span className="dmg-x-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Expense Breakdown Donut Chart (Zero-state aware)
 */
export function ExpenseBreakdownDonut({
  breakdown = { total: 0, items: [] },
  periodLabel = 'This Month',
  onPeriodChange,
  compact = false,
}) {
  const [hoveredCat, setHoveredCat] = useState(null);

  const size = compact ? 148 : 176;
  const strokeWidth = compact ? 24 : 28;
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const activeItem =
    hoveredCat && breakdown.items.find((i) => i.category === hoveredCat);

  return (
    <div className={`dmg-card dmg-chart-card ${compact ? 'dmg-donut-compact' : ''}`}>
      <div className="dmg-card-header">
        <h3 className="dmg-card-title">Expense Breakdown</h3>
        {!compact && onPeriodChange && (
          <select
            className="dmg-mini-select"
            value={periodLabel}
            onChange={(e) => onPeriodChange(e.target.value)}
            aria-label="Expense Breakdown Period"
          >
            <option value="This Month">Selected Period</option>
            <option value="All Time">All Time</option>
          </select>
        )}
      </div>

      <div className="dmg-donut-layout">
        <div className="dmg-donut-svg-wrap">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth={strokeWidth}
            />
            {breakdown.items.map((item) => {
              const pct = item.percentage / 100;
              const dashArray = `${pct * circumference} ${circumference}`;
              const dashOffset = -cumulativePercent * circumference;
              cumulativePercent += pct;
              const isHovered = hoveredCat === item.category;

              return (
                <circle
                  key={item.category}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${center} ${center})`}
                  style={{ transition: 'all 0.25s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredCat(item.category)}
                  onMouseLeave={() => setHoveredCat(null)}
                />
              );
            })}
          </svg>
          <div className="dmg-donut-center">
            <div className="dmg-donut-total">
              {activeItem
                ? formatCurrency(activeItem.amount, false)
                : formatCurrency(breakdown.total, false)}
            </div>
            <div className="dmg-donut-sub">
              {activeItem ? activeItem.category : 'Total Expenses'}
            </div>
          </div>
        </div>

        <div className="dmg-donut-legend">
          {breakdown.items.length === 0 ? (
            <div className="dmg-empty-state" style={{ padding: '12px 0' }}>
              No expenses logged for this period yet.
            </div>
          ) : (
            breakdown.items.map((item) => (
              <div
                key={item.category}
                className={`dmg-donut-legend-row ${
                  hoveredCat === item.category ? 'highlighted' : ''
                }`}
                onMouseEnter={() => setHoveredCat(item.category)}
                onMouseLeave={() => setHoveredCat(null)}
              >
                <div className="dmg-donut-legend-left">
                  <span
                    className="dmg-donut-dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="dmg-donut-cat-name">{item.category}</span>
                </div>
                <span className="dmg-donut-cat-pct">{item.percentage}%</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Horizontal Category Bars
 */
export function ExpensesHorizontalBars({ breakdown = { total: 0, items: [] } }) {
  return (
    <div className="dmg-horiz-bars-card">
      <h4 className="dmg-sub-heading">Expenses by Category</h4>
      {breakdown.items.length === 0 ? (
        <div className="dmg-empty-state">No categorized expenses recorded for this period yet.</div>
      ) : (
        <div className="dmg-horiz-bars-list">
          {breakdown.items.map((item) => {
            const barWidth = Math.min(100, Math.max(12, item.percentage * 2.5));
            return (
              <div key={item.category} className="dmg-horiz-row">
                <div className="dmg-horiz-label">{item.category}</div>
                <div className="dmg-horiz-track">
                  <div
                    className="dmg-horiz-fill"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: item.color,
                    }}
                  >
                    <span className="dmg-horiz-end-dot" />
                  </div>
                </div>
                <div className="dmg-horiz-amount">{formatCurrency(item.amount)}</div>
                <div className="dmg-horiz-pct">{item.percentage}%</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 4. Mileage & Fuel Efficiency Trend Chart (Zero-state aware)
 */
export function MileageEfficiencyChart({ series = [], unitSystem = 'imperial' }) {
  const effLabel = unitSystem === 'metric' ? 'km/L' : 'MPG';
  const distLabel = unitSystem === 'metric' ? 'km' : 'mi';

  const activeMpgs = series.filter((s) => s.mpg > 0).map((s) => s.mpg);
  const overallAvgMpg =
    activeMpgs.length > 0
      ? (activeMpgs.reduce((a, b) => a + b, 0) / activeMpgs.length).toFixed(1)
      : '0.0';

  return (
    <div className="dmg-card dmg-chart-card">
      <div className="dmg-card-header">
        <h3 className="dmg-card-title">Monthly Mileage &amp; Fuel Efficiency ({effLabel})</h3>
        <span className="dmg-badge-pill">
          Avg: {overallAvgMpg} {effLabel}
        </span>
      </div>

      <div className="dmg-mileage-trend-grid">
        {series.map((item) => {
          const milesVal = item.miles || 0;
          const mpgVal = item.mpg || 0;
          const heightPct =
            milesVal > 0 ? Math.min(100, Math.max(14, Math.round((milesVal / 950) * 100))) : 2;
          return (
            <div key={item.monthKey} className="dmg-mileage-col">
              <div className="dmg-mileage-col-mpg">
                {mpgVal} {effLabel}
              </div>
              <div className="dmg-mileage-bar-wrap">
                <div
                  className="dmg-mileage-bar-fill"
                  style={{ height: `${heightPct}%`, opacity: milesVal > 0 ? 1 : 0.2 }}
                  title={`${milesVal} ${distLabel}`}
                />
              </div>
              <div className="dmg-mileage-col-val">
                {milesVal} {distLabel}
              </div>
              <div className="dmg-x-label">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IncomeVsExpensesChart;
