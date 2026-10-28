import React from 'react';
import { formatCurrency, formatDateDisplay } from '../utils/calculate.js';
import { formatDistance, formatEfficiency } from '../utils/fuelEfficiency.js';

/**
 * Custom Executive Black Sedan SVG Illustration
 */
export function ExecutiveSedanGraphic({ className = 'dmg-sedan-svg' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DMG Executive Black Sedan"
    >
      <defs>
        <linearGradient id="carBodyGrad" x1="0" y1="20" x2="310" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2c313a" />
          <stop offset="35%" stopColor="#12151a" />
          <stop offset="70%" stopColor="#090b0e" />
          <stop offset="100%" stopColor="#1e232b" />
        </linearGradient>
        <linearGradient id="cabinGlass" x1="80" y1="22" x2="230" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b4454" />
          <stop offset="50%" stopColor="#151921" />
          <stop offset="100%" stopColor="#0d1015" />
        </linearGradient>
        <linearGradient id="chromeTrim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.48)" />
          <stop offset="75%" stopColor="rgba(0,0,0,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="162" cy="112" rx="145" ry="13" fill="url(#floorShadow)" />

      <path
        d="M24 78 C26 62, 46 55, 82 51 L122 25 C135 19, 205 18, 228 28 L262 50 C285 53, 302 62, 304 77 L302 93 C300 98, 290 100, 276 100 L44 100 C30 100, 22 95, 24 78 Z"
        fill="url(#carBodyGrad)"
        stroke="#333942"
        strokeWidth="1.2"
      />

      <path
        d="M92 49 L126 28 C138 23, 198 22, 220 31 L248 49 Z"
        fill="url(#cabinGlass)"
        stroke="url(#chromeTrim)"
        strokeWidth="1.5"
      />
      <line x1="172" y1="24" x2="168" y2="49" stroke="#111317" strokeWidth="4" />

      <rect x="26" y="65" width="22" height="16" rx="3" fill="#090a0c" stroke="#64748b" strokeWidth="1.2" />
      <path d="M52 64 L76 62 L73 71 L50 71 Z" fill="#e2e8f0" />
      <path d="M53 66 L74 64" stroke="#22c55e" strokeWidth="1.8" />

      <path d="M23 86 L82 86 L78 94 L25 94 Z" fill="#07080a" stroke="#334155" strokeWidth="0.8" />

      <path d="M78 65 L288 61" stroke="url(#chromeTrim)" strokeWidth="1.1" strokeOpacity="0.65" />
      <path d="M105 88 L235 88" stroke="#475569" strokeWidth="1" strokeOpacity="0.5" />

      <g transform="translate(82, 92)">
        <circle cx="0" cy="0" r="21" fill="#0b0d10" stroke="#1e293b" strokeWidth="2" />
        <circle cx="0" cy="0" r="14" fill="#1e232a" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="4" fill="#e2e8f0" />
        <line x1="-13" y1="0" x2="13" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="0" y1="-13" x2="0" y2="13" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="-9" y1="-9" x2="9" y2="9" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="-9" y1="9" x2="9" y2="-9" stroke="#94a3b8" strokeWidth="1.5" />
      </g>

      <g transform="translate(248, 92)">
        <circle cx="0" cy="0" r="21" fill="#0b0d10" stroke="#1e293b" strokeWidth="2" />
        <circle cx="0" cy="0" r="14" fill="#1e232a" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="4" fill="#e2e8f0" />
        <line x1="-13" y1="0" x2="13" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="0" y1="-13" x2="0" y2="13" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="-9" y1="-9" x2="9" y2="9" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="-9" y1="9" x2="9" y2="-9" stroke="#94a3b8" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/**
 * 1. Top 4 KPI Summary Cards (Zero-state aware & mobile responsive)
 */
export default function Summary({
  summary,
  unitSystem = 'imperial',
  showIcons = true,
  onCardClick,
}) {
  const {
    totalIncome = 0,
    totalExpenses = 0,
    netIncome = 0,
    mileageStats = { totalMiles: 0 },
    incomeChangePct = 0,
    expenseChangePct = 0,
    netChangePct = 0,
    mileageChangePct = 0,
  } = summary || {};

  return (
    <div className="dmg-kpi-grid">
      {/* Card 1: Total Income */}
      <div
        className="dmg-card dmg-kpi-card"
        onClick={() => onCardClick && onCardClick('income')}
        style={{ cursor: onCardClick ? 'pointer' : 'default' }}
      >
        <div className="dmg-kpi-top">
          {showIcons && (
            <div className="dmg-kpi-icon-box income-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="8" r="4" />
                <path d="M2 20c0-4 3.6-7 8-7" />
                <circle cx="17.5" cy="16.5" r="4.5" />
                <path d="M17.5 14.5v4M16 16.5h3" />
              </svg>
            </div>
          )}
          <div className="dmg-kpi-info">
            <span className="dmg-kpi-label">Total Income</span>
            <h2 className="dmg-kpi-value">{formatCurrency(totalIncome)}</h2>
          </div>
        </div>
        <div className="dmg-kpi-trend trend-positive">
          <span className="dmg-trend-arrow">^</span>
          <strong>
            {incomeChangePct >= 0 ? `+${incomeChangePct}%` : `${incomeChangePct}%`}
          </strong>{' '}
          from last month
        </div>
      </div>

      {/* Card 2: Total Expenses */}
      <div
        className="dmg-card dmg-kpi-card"
        onClick={() => onCardClick && onCardClick('expenses')}
        style={{ cursor: onCardClick ? 'pointer' : 'default' }}
      >
        <div className="dmg-kpi-top">
          {showIcons && (
            <div className="dmg-kpi-icon-box expense-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10l5-5 5 5" />
                <path d="M17 14l-5 5-5-5" />
              </svg>
            </div>
          )}
          <div className="dmg-kpi-info">
            <span className="dmg-kpi-label">Total Expenses</span>
            <h2 className="dmg-kpi-value">{formatCurrency(totalExpenses)}</h2>
          </div>
        </div>
        <div className="dmg-kpi-trend trend-danger">
          <span className="dmg-trend-arrow">^</span>
          <strong>
            {expenseChangePct >= 0 ? `+${expenseChangePct}%` : `${expenseChangePct}%`}
          </strong>{' '}
          from last month
        </div>
      </div>

      {/* Card 3: Net Income */}
      <div
        className="dmg-card dmg-kpi-card"
        onClick={() => onCardClick && onCardClick('reports')}
        style={{ cursor: onCardClick ? 'pointer' : 'default' }}
      >
        <div className="dmg-kpi-top">
          {showIcons && (
            <div className="dmg-kpi-icon-box net-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="3" />
                <path d="M16 12h2" />
                <path d="M2 10h20" />
              </svg>
            </div>
          )}
          <div className="dmg-kpi-info">
            <span className="dmg-kpi-label">Net Income</span>
            <h2 className="dmg-kpi-value">{formatCurrency(netIncome)}</h2>
          </div>
        </div>
        <div className="dmg-kpi-trend trend-positive">
          <span className="dmg-trend-arrow">^</span>
          <strong>
            {netChangePct >= 0 ? `+${netChangePct}%` : `${netChangePct}%`}
          </strong>{' '}
          from last month
        </div>
      </div>

      {/* Card 4: Total Mileage */}
      <div
        className="dmg-card dmg-kpi-card"
        onClick={() => onCardClick && onCardClick('mileage')}
        style={{ cursor: onCardClick ? 'pointer' : 'default' }}
      >
        <div className="dmg-kpi-top">
          {showIcons && (
            <div className="dmg-kpi-icon-box mileage-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17h14v-5l-2-5H7l-2 5v5z" />
                <circle cx="7.5" cy="17.5" r="1.5" />
                <circle cx="16.5" cy="17.5" r="1.5" />
              </svg>
            </div>
          )}
          <div className="dmg-kpi-info">
            <span className="dmg-kpi-label">Total Mileage</span>
            <h2 className="dmg-kpi-value">
              {formatDistance(mileageStats.totalMiles, unitSystem)}
            </h2>
          </div>
        </div>
        <div className="dmg-kpi-trend trend-info">
          <span className="dmg-trend-arrow">^</span>
          <strong>{mileageChangePct}%</strong> from last month
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Recent Transactions Card (Overlap-free responsive layout)
 */
export function RecentTransactionsCard({
  transactions = [],
  onViewAll,
  onDeleteTransaction,
  limit = 4,
}) {
  const displayed = transactions.slice(0, limit);

  const renderTxBadge = (tx) => {
    const titleLower = (tx.displayTitle || '').toLowerCase();
    if (tx.txType === 'income') {
      return <div className="dmg-tx-avatar tx-avatar-income">$</div>;
    }
    if (titleLower.includes('uber')) {
      return <div className="dmg-tx-avatar tx-avatar-uber">Uber</div>;
    }
    if (titleLower.includes('shell') || titleLower.includes('gas') || tx.category === 'Car') {
      return (
        <div className="dmg-tx-avatar tx-avatar-gas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
            <path d="M15 10h2a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2v-7l-3-3" />
            <line x1="3" y1="22" x2="15" y2="22" />
          </svg>
        </div>
      );
    }
    if (titleLower.includes('chipotle') || tx.category === 'Food & Drinks') {
      return (
        <div className="dmg-tx-avatar tx-avatar-food">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          </svg>
        </div>
      );
    }
    return <div className="dmg-tx-avatar tx-avatar-default">•</div>;
  };

  return (
    <div className="dmg-card dmg-recent-card">
      <div className="dmg-card-header">
        <h3 className="dmg-card-title">Recent Transactions</h3>
        {onViewAll && (
          <button type="button" className="dmg-link-btn" onClick={onViewAll}>
            View All
          </button>
        )}
      </div>

      <div className="dmg-tx-list">
        {displayed.length === 0 ? (
          <div className="dmg-empty-state">
            No transactions recorded yet. Click <strong>+ Add Transaction</strong> to log your first entry.
          </div>
        ) : (
          displayed.map((tx) => {
            const isIncome = tx.txType === 'income';
            const formattedDate = formatDateDisplay(tx.date);
            return (
              <div key={tx.id} className="dmg-tx-row">
                <div className="dmg-tx-left">
                  {renderTxBadge(tx)}
                  <div className="dmg-tx-meta">
                    <div className="dmg-tx-title">{tx.displayTitle}</div>
                    <div className="dmg-tx-subtitle">
                      {tx.displaySubtitle}
                      <span className="dmg-tx-date-inline"> • {formattedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="dmg-tx-date">{formattedDate}</div>

                <div className="dmg-tx-right">
                  <span
                    className={`dmg-tx-amount ${
                      isIncome ? 'amount-positive' : 'amount-negative'
                    }`}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatCurrency(tx.amount)}
                  </span>
                  {onDeleteTransaction && (
                    <button
                      type="button"
                      className="dmg-tx-delete-btn"
                      title="Delete transaction"
                      onClick={() => onDeleteTransaction(tx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * 3. Mileage Overview Card (Zero-state & mobile responsive)
 */
export function MileageOverviewCard({
  mileageStats,
  unitSystem = 'imperial',
  monthShortLabel = 'Oct',
  onLogMileage,
}) {
  const {
    totalMiles = 0,
    workMiles = 0,
    personalMiles = 0,
    avgEfficiencyMpg = 0,
  } = mileageStats || {};

  return (
    <div className="dmg-card dmg-mileage-overview-card">
      <div className="dmg-card-header">
        <h3 className="dmg-card-title">Mileage Overview</h3>
        {onLogMileage && (
          <button type="button" className="dmg-link-btn" onClick={onLogMileage}>
            Log Mileage
          </button>
        )}
      </div>

      <div className="dmg-mileage-hero">
        <div className="dmg-mileage-hero-left">
          <div className="dmg-mileage-big-num">
            {formatDistance(totalMiles, unitSystem)}
          </div>
          <div className="dmg-mileage-big-sub">Total Miles ({monthShortLabel})</div>
        </div>
        <div className="dmg-mileage-hero-car">
          <ExecutiveSedanGraphic />
        </div>
      </div>

      <div className="dmg-mileage-mini-grid">
        <div className="dmg-mileage-mini-box">
          <div className="dmg-mini-val">{formatDistance(workMiles, unitSystem)}</div>
          <div className="dmg-mini-lbl">Work</div>
        </div>
        <div className="dmg-mileage-mini-box">
          <div className="dmg-mini-val">{formatDistance(personalMiles, unitSystem)}</div>
          <div className="dmg-mini-lbl">Personal</div>
        </div>
        <div className="dmg-mileage-mini-box">
          <div className="dmg-mini-val">
            {formatEfficiency(avgEfficiencyMpg, unitSystem)}
          </div>
          <div className="dmg-mini-lbl">Avg. Efficiency</div>
        </div>
      </div>
    </div>
  );
}
