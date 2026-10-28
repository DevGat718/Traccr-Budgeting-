import React, { useState, useRef, useMemo } from 'react';
import Summary, {
  RecentTransactionsCard,
  MileageOverviewCard,
} from '../components/Summary.js';
import {
  IncomeVsExpensesChart,
  ExpenseBreakdownDonut,
  ExpensesHorizontalBars,
  MileageEfficiencyChart,
} from '../components/Chart.js';
import ExpenseForm from '../components/ExpenseForm.js';
import IncomeForm from '../components/IncomeForm.js';
import CarMileageForm from '../components/CarMileageForm.js';
import CategoryFilter from '../components/CategoryFilter.js';
import {
  formatCurrency,
  formatDateDisplay,
  filterRecords,
  generateDynamicMonthOptions,
  getMonthMeta,
  getCurrentYearMonth,
} from '../utils/calculate.js';
import {
  formatDistance,
  formatEfficiency,
  calculateTripEfficiency,
} from '../utils/fuelEfficiency.js';
import {
  exportToCSV,
  processProfileImageFile,
} from '../utils/dataStorage.js';

/**
 * TRACCR by DMG Official Crown Logo Component
 */
export function DmgBrandLogo({ size = 'normal' }) {
  return (
    <div className={`dmg-brand-logo dmg-logo-${size}`} title="TRACCR by DMG Official">
      <div className="dmg-crown-wrap">
        <svg
          className="dmg-crown-svg"
          viewBox="0 0 44 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 20L8 6L16 14L22 2L28 14L36 6L40 20H4Z"
            fill="#22c55e"
          />
          <rect x="5" y="21.5" width="34" height="2" rx="1" fill="#22c55e" />
        </svg>
      </div>
      <div className="dmg-logo-wordmark">TRACCR</div>
      <div className="dmg-logo-sub">BY DMG OFFICIAL</div>
    </div>
  );
}

/**
 * UserAvatar Component
 */
export function UserAvatar({ size = 34, photoURL = '', name = 'User', onClick }) {
  return (
    <div
      className="dmg-avatar-circle"
      style={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
      title={name}
      onClick={onClick}
    >
      {photoURL ? (
        <img
          src={photoURL}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="20" fill="#1e293b" />
          <circle cx="20" cy="15" r="6.5" fill="#d97706" />
          <path
            d="M8 36C8 29.5 13 25 20 25C27 25 32 29.5 32 36"
            fill="#0f172a"
          />
          <path
            d="M15 25L20 31L25 25"
            stroke="#f8fafc"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </div>
  );
}

export default function Dashboard({
  incomes,
  expenses,
  mileageLogs,
  goals,
  vehicles,
  settings,
  summary,
  monthlySeries,
  categoryBreakdown,
  combinedTransactions,
  onAddIncome,
  onDeleteIncome,
  onAddExpense,
  onDeleteExpense,
  onAddMileage,
  onDeleteMileage,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddVehicle,
  onSetPrimaryVehicle,
  onDeleteVehicle,
  onUpdateSettings,
  onWipeAllData,
  onResetDemoData,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportSubTab, setReportSubTab] = useState('Overview');
  const [modalMode, setModalMode] = useState(null); // 'expense' | 'income' | 'mileage' | 'goal' | 'vehicle' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobilePreviewMode, setMobilePreviewMode] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');

  // New Goal modal state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState('$');

  // New Vehicle form state
  const [vehYear, setVehYear] = useState(() => String(new Date().getFullYear()));
  const [vehMakeModel, setVehMakeModel] = useState('');
  const [vehType, setVehType] = useState('Executive Sedan');
  const [vehPlate, setVehPlate] = useState('');

  const profileFileInputRef = useRef(null);

  const selectedMonth = settings.selectedMonth || getCurrentYearMonth();
  const unitSystem = settings.unitSystem || 'imperial';

  const allRecords = useMemo(
    () => [...incomes, ...expenses, ...mileageLogs],
    [incomes, expenses, mileageLogs]
  );

  const dynamicMonthOptions = useMemo(
    () => generateDynamicMonthOptions(allRecords),
    [allRecords]
  );

  const currentMonthMeta = useMemo(
    () => getMonthMeta(selectedMonth),
    [selectedMonth]
  );

  const handleMonthChange = (newMonth) => {
    onUpdateSettings({ ...settings, selectedMonth: newMonth });
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processProfileImageFile(file);
      onUpdateSettings({ ...settings, photoURL: dataUrl });
    } catch (err) {
      console.warn('Error processing profile picture:', err);
    }
  };

  const handleCreateVehicle = (e) => {
    e.preventDefault();
    if (!vehMakeModel.trim()) return;
    const fullName = `${vehYear.trim() ? vehYear.trim() + ' ' : ''}${vehMakeModel.trim()}`;
    onAddVehicle({
      id: `veh-${Date.now()}`,
      name: fullName,
      year: vehYear.trim() || String(new Date().getFullYear()),
      type: vehType,
      licensePlate: vehPlate.trim().toUpperCase(),
      isPrimary: vehicles.length === 0,
    });
    setVehMakeModel('');
    setVehPlate('');
    if (modalMode === 'vehicle') setModalMode(null);
  };

  const handleConfirmWipeAll = () => {
    if (onWipeAllData) {
      onWipeAllData();
      setConfirmWipe(false);
      setStatusBanner('All account data has been wiped clean ($0.00 / 0 mi).');
      setTimeout(() => setStatusBanner(''), 4000);
    }
  };

  const handleExportCSV = () => {
    if (reportSubTab === 'Income') {
      const rows = filterRecords(incomes, { month: selectedMonth }).map((i) => [
        i.date,
        i.title,
        i.source,
        i.amount,
        i.notes || '',
      ]);
      exportToCSV(`TRACCR_Income_${selectedMonth}.csv`, ['Date', 'Title', 'Source', 'Amount ($)', 'Notes'], rows);
    } else if (reportSubTab === 'Mileage') {
      const rows = filterRecords(mileageLogs, { month: selectedMonth }).map((m) => [
        m.date,
        m.vehicle || '',
        m.purpose,
        m.startLocation,
        m.endLocation,
        m.distance,
        m.fuelUsed,
        m.fuelCost,
        calculateTripEfficiency(m.distance, m.fuelUsed, unitSystem),
      ]);
      exportToCSV(
        `TRACCR_Mileage_${selectedMonth}.csv`,
        ['Date', 'Vehicle', 'Purpose', 'Start Location', 'End Location', 'Distance', 'Fuel Used', 'Fuel Cost ($)', 'Efficiency'],
        rows
      );
    } else {
      const rows = combinedTransactions.map((tx) => [
        tx.date,
        tx.txType.toUpperCase(),
        tx.displayTitle,
        tx.displaySubtitle,
        tx.txType === 'income' ? tx.amount : -tx.amount,
        tx.notes || '',
      ]);
      exportToCSV(
        `TRACCR_Financial_Report_${selectedMonth}.csv`,
        ['Date', 'Type', 'Description', 'Category/Source', 'Amount ($)', 'Notes'],
        rows
      );
    }
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!goalTitle.trim() || !parseFloat(goalTarget)) return;
    onAddGoal({
      id: `goal-${Date.now()}`,
      title: goalTitle.trim(),
      type: 'custom',
      current: parseFloat(goalCurrent) || 0,
      target: parseFloat(goalTarget),
      unit: goalUnit,
      icon: goalUnit === 'mi' ? 'speedometer' : 'piggy',
      color: '#22c55e',
    });
    setGoalTitle('');
    setGoalCurrent('');
    setGoalTarget('');
    setModalMode(null);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'income', label: 'Income', icon: 'income' },
    { id: 'expenses', label: 'Expenses', icon: 'expenses' },
    { id: 'mileage', label: 'Mileage', icon: 'car' },
    { id: 'reports', label: 'Reports', icon: 'chart' },
    { id: 'goals', label: 'Goals', icon: 'target' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const renderNavIcon = (iconName) => {
    switch (iconName) {
      case 'grid':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
        );
      case 'income':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
        );
      case 'expenses':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        );
      case 'car':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 17h14v-5l-2-5H7l-2 5v5z" />
            <circle cx="7.5" cy="17.5" r="1.5" />
            <circle cx="16.5" cy="17.5" r="1.5" />
          </svg>
        );
      case 'chart':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case 'target':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.5" />
          </svg>
        );
      case 'settings':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`dmg-app-shell ${settings.darkMode ? 'dmg-theme-dark' : 'dmg-theme-hybrid'}`}>
      <input
        ref={profileFileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleProfilePhotoChange}
      />

      {/* LEFT DARK SIDEBAR */}
      <aside className="dmg-sidebar">
        <div className="dmg-sidebar-top">
          <div
            className="dmg-sidebar-brand"
            onClick={() => setActiveTab('dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <DmgBrandLogo />
          </div>

          <nav className="dmg-sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`dmg-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedCategory('All');
                }}
              >
                <span className="dmg-nav-icon">{renderNavIcon(item.icon)}</span>
                <span className="dmg-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="dmg-sidebar-bottom">
          <div className="dmg-tagline-mini">
            <span className="dmg-neon-text">TRACK TODAY.</span>
            <span className="dmg-neon-text">BUILD TOMORROW.</span>
          </div>

          <div
            className="dmg-sidebar-profile"
            onClick={() => setActiveTab('settings')}
          >
            <UserAvatar
              size={38}
              photoURL={settings.photoURL}
              name={settings.userName}
            />
            <div className="dmg-profile-text">
              <div className="dmg-profile-name">{settings.userName}</div>
              <div className="dmg-profile-link">Account Profile</div>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              className="dmg-sidebar-logout-btn"
              onClick={onLogout}
            >
              Log Out
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="dmg-main-area">
        {/* TOP UTILITY BAR */}
        <header className="dmg-topbar">
          <div className="dmg-topbar-left">
            <div
              className="dmg-mobile-brand"
              onClick={() => setActiveTab('dashboard')}
            >
              <DmgBrandLogo size="small" />
            </div>

            <button
              type="button"
              className="dmg-collapse-btn"
              onClick={() => setActiveTab('dashboard')}
              title="Dashboard Home"
            >
              ‹
            </button>
            <div className="dmg-search-box">
              <svg
                className="dmg-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="dmg-clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="dmg-topbar-right">
            {/* Mobile Phone Companion Toggle */}
            <button
              type="button"
              className={`dmg-preview-toggle-btn ${mobilePreviewMode ? 'active' : ''}`}
              onClick={() => setMobilePreviewMode(!mobilePreviewMode)}
              title="Toggle iPhone Dark Companion View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>{mobilePreviewMode ? 'Hide Mobile Twin' : 'Mobile View'}</span>
            </button>

            {/* Dynamic Auto-Advancing Multi-Year / Month Picker Pill */}
            <div className="dmg-date-range-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                aria-label="Select date range"
              >
                {dynamicMonthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Bell */}
            <div className="dmg-notif-wrapper">
              <button
                type="button"
                className="dmg-notif-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {allRecords.length > 0 && <span className="dmg-notif-dot" />}
              </button>

              {showNotifications && (
                <div className="dmg-notif-popover">
                  <div className="dmg-notif-head">
                    <strong>TRACCR Insights</strong>
                    <button type="button" onClick={() => setShowNotifications(false)}>
                      ×
                    </button>
                  </div>
                  {allRecords.length === 0 ? (
                    <div className="dmg-empty-state" style={{ padding: '10px 0' }}>
                      Your account is fresh and ready! Add your first income, expense, or mileage log to see insights here.
                    </div>
                  ) : (
                    <>
                      <div className="dmg-notif-item">
                        <span className="notif-badge green">Net</span>
                        <div>
                          <strong>Net Income Status</strong>
                          <p>Net balance is {formatCurrency(summary.netIncome)} for {currentMonthMeta.shortLabel}.</p>
                        </div>
                      </div>
                      <div className="dmg-notif-item">
                        <span className="notif-badge blue">MPG</span>
                        <div>
                          <strong>Fuel Efficiency</strong>
                          <p>
                            Averaging {summary.mileageStats.avgEfficiencyMpg || 0} MPG across{' '}
                            {summary.mileageStats.totalMiles || 0} miles.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div
              className="dmg-topbar-avatar"
              onClick={() => setActiveTab('settings')}
              style={{ cursor: 'pointer' }}
            >
              <UserAvatar
                size={34}
                photoURL={settings.photoURL}
                name={settings.userName}
              />
            </div>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <div className={`dmg-workspace-split ${mobilePreviewMode ? 'with-mobile-twin' : ''}`}>
          <main className="dmg-content-canvas">
            {statusBanner && (
              <div className="dmg-status-banner">
                <span>✓ {statusBanner}</span>
                <button type="button" onClick={() => setStatusBanner('')}>
                  ×
                </button>
              </div>
            )}

            {/* ==================== 1. DASHBOARD VIEW ==================== */}
            {activeTab === 'dashboard' && (
              <>
                <div className="dmg-page-header">
                  <div>
                    <h1 className="dmg-page-title">Dashboard</h1>
                    <p className="dmg-page-subtitle">
                      Here&apos;s your financial overview for {currentMonthMeta.shortLabel}.
                    </p>
                  </div>

                  <div className="dmg-header-actions">
                    <button
                      type="button"
                      className="dmg-btn-primary-dark"
                      onClick={() => setModalMode('expense')}
                    >
                      <span>+</span> Add Transaction
                    </button>
                    <button
                      type="button"
                      className="dmg-btn-secondary-light"
                      onClick={() => setModalMode('mileage')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 17h14v-5l-2-5H7l-2 5v5z" />
                        <circle cx="7.5" cy="17.5" r="1.5" />
                        <circle cx="16.5" cy="17.5" r="1.5" />
                      </svg>
                      Log Mileage
                    </button>
                  </div>
                </div>

                {/* Row 1: 4 Summary KPI Cards */}
                <Summary
                  summary={summary}
                  unitSystem={unitSystem}
                  onCardClick={(tab) => setActiveTab(tab)}
                />

                {/* Row 2: Income vs Expenses Bar Chart + Expense Breakdown Donut */}
                <div className="dmg-charts-row">
                  <IncomeVsExpensesChart series={monthlySeries} />
                  <ExpenseBreakdownDonut
                    breakdown={categoryBreakdown}
                    periodLabel={selectedMonth === 'all' ? 'All Time' : 'This Month'}
                    onPeriodChange={(val) =>
                      handleMonthChange(val === 'All Time' ? 'all' : getCurrentYearMonth())
                    }
                  />
                </div>

                {/* Row 3: Recent Transactions + Mileage Overview */}
                <div className="dmg-bottom-row">
                  <RecentTransactionsCard
                    transactions={combinedTransactions}
                    limit={4}
                    onViewAll={() => setActiveTab('expenses')}
                  />
                  <MileageOverviewCard
                    mileageStats={summary.mileageStats}
                    unitSystem={unitSystem}
                    monthShortLabel={currentMonthMeta.monthAbbr}
                    onLogMileage={() => setModalMode('mileage')}
                  />
                </div>
              </>
            )}

            {/* ==================== 2. INCOME VIEW ==================== */}
            {activeTab === 'income' && (
              <>
                <div className="dmg-page-header">
                  <div>
                    <h1 className="dmg-page-title">Income Sources</h1>
                    <p className="dmg-page-subtitle">
                      All your income sources in one place ({currentMonthMeta.shortLabel}).
                    </p>
                  </div>
                  <div className="dmg-header-actions">
                    <button
                      type="button"
                      className="dmg-btn-primary-dark"
                      onClick={() => setModalMode('income')}
                    >
                      + Add Income
                    </button>
                  </div>
                </div>

                <Summary summary={summary} unitSystem={unitSystem} />

                <CategoryFilter
                  filterType="income"
                  records={allRecords}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  selectedMonth={selectedMonth}
                  onSelectMonth={handleMonthChange}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                <div className="dmg-split-section">
                  <div className="dmg-split-form-col">
                    <IncomeForm
                      onAddIncome={onAddIncome}
                      onSwitchToExpense={() => setActiveTab('expenses')}
                    />
                  </div>

                  <div className="dmg-split-table-col">
                    <div className="dmg-card">
                      <div className="dmg-card-header">
                        <h3 className="dmg-card-title">Recorded Income Entries</h3>
                        <span className="dmg-badge-green">
                          Total: {formatCurrency(summary.totalIncome)}
                        </span>
                      </div>

                      <div className="dmg-tx-list">
                        {filterRecords(incomes, {
                          month: selectedMonth,
                          category: selectedCategory,
                          search: searchQuery,
                        }).length === 0 ? (
                          <div className="dmg-empty-state">
                            No income entries recorded for this period yet.
                          </div>
                        ) : (
                          filterRecords(incomes, {
                            month: selectedMonth,
                            category: selectedCategory,
                            search: searchQuery,
                          }).map((inc) => (
                            <div key={inc.id} className="dmg-tx-row">
                              <div className="dmg-tx-left">
                                <div className="dmg-tx-avatar tx-avatar-income">$</div>
                                <div className="dmg-tx-meta">
                                  <div className="dmg-tx-title">{inc.title}</div>
                                  <div className="dmg-tx-subtitle">
                                    {inc.source} {inc.notes ? `• ${inc.notes}` : ''}
                                    <span className="dmg-tx-date-inline"> • {formatDateDisplay(inc.date)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="dmg-tx-date">{formatDateDisplay(inc.date)}</div>
                              <div className="dmg-tx-right">
                                <span className="dmg-tx-amount amount-positive">
                                  + {formatCurrency(inc.amount)}
                                </span>
                                <button
                                  type="button"
                                  className="dmg-tx-delete-btn"
                                  onClick={() => onDeleteIncome(inc.id)}
                                  title="Delete income"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ==================== 3. EXPENSES VIEW ==================== */}
            {activeTab === 'expenses' && (
              <>
                <div className="dmg-page-header">
                  <div>
                    <h1 className="dmg-page-title">Track Expenses</h1>
                    <p className="dmg-page-subtitle">
                      Categorize spending and stay in control ({currentMonthMeta.shortLabel}).
                    </p>
                  </div>
                  <div className="dmg-header-actions">
                    <button
                      type="button"
                      className="dmg-btn-primary-dark"
                      onClick={() => setModalMode('expense')}
                    >
                      + Add Expense
                    </button>
                  </div>
                </div>

                <CategoryFilter
                  filterType="expense"
                  records={allRecords}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  selectedMonth={selectedMonth}
                  onSelectMonth={handleMonthChange}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                <div className="dmg-split-section">
                  <div className="dmg-split-form-col">
                    <ExpenseForm
                      onAddExpense={onAddExpense}
                      onSwitchToIncome={() => setActiveTab('income')}
                    />
                  </div>

                  <div className="dmg-split-table-col">
                    <ExpenseBreakdownDonut breakdown={categoryBreakdown} />

                    <div className="dmg-card" style={{ marginTop: '18px' }}>
                      <div className="dmg-card-header">
                        <h3 className="dmg-card-title">
                          Expense Transactions ({selectedCategory})
                        </h3>
                        <span className="dmg-badge-red">
                          Total: {formatCurrency(summary.totalExpenses)}
                        </span>
                      </div>

                      <RecentTransactionsCard
                        transactions={filterRecords(expenses, {
                          month: selectedMonth,
                          category: selectedCategory,
                          search: searchQuery,
                        }).map((e) => ({
                          ...e,
                          txType: 'expense',
                          displayTitle: e.title,
                          displaySubtitle: `${e.category}${e.notes ? ` • ${e.notes}` : ''}`,
                        }))}
                        limit={50}
                        onDeleteTransaction={(tx) => onDeleteExpense(tx.id)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ==================== 4. MILEAGE & MULTI-VEHICLE GARAGE VIEW ==================== */}
            {activeTab === 'mileage' && (
              <>
                <div className="dmg-page-header">
                  <div>
                    <h1 className="dmg-page-title">Car Mileage &amp; Multi-Vehicle Tracker</h1>
                    <p className="dmg-page-subtitle">
                      Track work or personal miles across your vehicles in {currentMonthMeta.shortLabel}.
                    </p>
                  </div>
                  <div className="dmg-header-actions">
                    <button
                      type="button"
                      className="dmg-btn-secondary-light"
                      onClick={() => setModalMode('vehicle')}
                    >
                      + Add Vehicle
                    </button>
                    <button
                      type="button"
                      className="dmg-btn-primary-dark"
                      onClick={() => setModalMode('mileage')}
                    >
                      + Log Mileage
                    </button>
                  </div>
                </div>

                {/* Multi-Vehicle Garage Bar */}
                <div className="dmg-garage-strip">
                  {vehicles.map((veh) => {
                    const isSelected = selectedVehicleFilter === veh.name;
                    return (
                      <div
                        key={veh.id}
                        className={`dmg-vehicle-chip ${isSelected ? 'active' : ''}`}
                        onClick={() =>
                          setSelectedVehicleFilter(isSelected ? 'All' : veh.name)
                        }
                      >
                        <div className="dmg-veh-chip-icon">🚗</div>
                        <div className="dmg-veh-chip-info">
                          <div className="dmg-veh-chip-name">
                            {veh.name}
                            {veh.isPrimary && (
                              <span className="dmg-primary-tag">Primary</span>
                            )}
                          </div>
                          <div className="dmg-veh-chip-sub">
                            {veh.type || 'Vehicle'} {veh.licensePlate ? `• ${veh.licensePlate}` : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="dmg-add-vehicle-chip"
                    onClick={() => setModalMode('vehicle')}
                  >
                    + Add Vehicle to Garage
                  </button>
                </div>

                {/* Mileage KPI Strip */}
                <div className="dmg-kpi-grid">
                  <div className="dmg-card dmg-kpi-card">
                    <span className="dmg-kpi-label">Total Distance</span>
                    <h2 className="dmg-kpi-value">
                      {formatDistance(summary.mileageStats.totalMiles, unitSystem)}
                    </h2>
                    <div className="dmg-kpi-trend trend-info">
                      Work: {formatDistance(summary.mileageStats.workMiles, unitSystem)} • Personal:{' '}
                      {formatDistance(summary.mileageStats.personalMiles, unitSystem)}
                    </div>
                  </div>

                  <div className="dmg-card dmg-kpi-card">
                    <span className="dmg-kpi-label">Avg. Fuel Efficiency</span>
                    <h2 className="dmg-kpi-value">
                      {formatEfficiency(summary.mileageStats.avgEfficiencyMpg, unitSystem)}
                    </h2>
                    <div className="dmg-kpi-trend trend-positive">
                      Fuel Used: {summary.mileageStats.totalFuelUsed} gal
                    </div>
                  </div>

                  <div className="dmg-card dmg-kpi-card">
                    <span className="dmg-kpi-label">Total Fuel Cost</span>
                    <h2 className="dmg-kpi-value">
                      {formatCurrency(summary.mileageStats.totalFuelCost)}
                    </h2>
                    <div className="dmg-kpi-trend">
                      Avg {formatCurrency(summary.mileageStats.costPerMile)} / mile
                    </div>
                  </div>

                  <div className="dmg-card dmg-kpi-card">
                    <span className="dmg-kpi-label">Est. Work Deduction</span>
                    <h2 className="dmg-kpi-value">
                      {formatCurrency(summary.mileageStats.estimatedTaxDeduction)}
                    </h2>
                    <div className="dmg-kpi-trend trend-positive">
                      IRS Rate ($0.67/mi on Work trips)
                    </div>
                  </div>
                </div>

                <CategoryFilter
                  filterType="mileage"
                  records={allRecords}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  selectedVehicle={selectedVehicleFilter}
                  onSelectVehicle={setSelectedVehicleFilter}
                  vehicles={vehicles}
                  selectedMonth={selectedMonth}
                  onSelectMonth={handleMonthChange}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                <div className="dmg-split-section">
                  <div className="dmg-split-form-col">
                    <CarMileageForm
                      onAddMileage={onAddMileage}
                      vehicles={vehicles}
                      onAddVehicle={onAddVehicle}
                      unitSystem={unitSystem}
                    />
                  </div>

                  <div className="dmg-split-table-col">
                    <MileageOverviewCard
                      mileageStats={summary.mileageStats}
                      unitSystem={unitSystem}
                      monthShortLabel={currentMonthMeta.monthAbbr}
                    />

                    <div style={{ marginTop: '18px' }}>
                      <MileageEfficiencyChart
                        series={monthlySeries}
                        unitSystem={unitSystem}
                      />
                    </div>

                    <div className="dmg-card" style={{ marginTop: '18px' }}>
                      <div className="dmg-card-header">
                        <h3 className="dmg-card-title">
                          Logged Mileage Trips ({selectedVehicleFilter})
                        </h3>
                        <span className="dmg-badge-pill">
                          {summary.mileageStats.tripCount} Trips
                        </span>
                      </div>

                      <div className="dmg-tx-list">
                        {filterRecords(mileageLogs, {
                          month: selectedMonth,
                          category: selectedCategory,
                          vehicle: selectedVehicleFilter,
                          search: searchQuery,
                        }).length === 0 ? (
                          <div className="dmg-empty-state">
                            No mileage trips logged for this period yet.
                          </div>
                        ) : (
                          filterRecords(mileageLogs, {
                            month: selectedMonth,
                            category: selectedCategory,
                            vehicle: selectedVehicleFilter,
                            search: searchQuery,
                          }).map((log) => {
                            const eff = calculateTripEfficiency(
                              log.distance,
                              log.fuelUsed,
                              unitSystem
                            );
                            return (
                              <div key={log.id} className="dmg-tx-row">
                                <div className="dmg-tx-left">
                                  <div
                                    className={`dmg-tx-avatar ${
                                      log.purpose === 'Work'
                                        ? 'tx-avatar-income'
                                        : 'tx-avatar-uber'
                                    }`}
                                  >
                                    {log.purpose === 'Work' ? 'W' : 'P'}
                                  </div>
                                  <div className="dmg-tx-meta">
                                    <div className="dmg-tx-title">
                                      {log.startLocation} → {log.endLocation}
                                    </div>
                                    <div className="dmg-tx-subtitle">
                                      <strong>{log.vehicle || 'Vehicle'}</strong> •{' '}
                                      {log.purpose} • {eff} mpg
                                      <span className="dmg-tx-date-inline"> • {formatDateDisplay(log.date)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="dmg-tx-date">{formatDateDisplay(log.date)}</div>

                                <div className="dmg-tx-right">
                                  <span className="dmg-tx-amount amount-neutral">
                                    {formatDistance(log.distance, unitSystem)}
                                  </span>
                                  <button
                                    type="button"
                                    className="dmg-tx-delete-btn"
                                    onClick={() => onDeleteMileage(log.id)}
                                    title="Delete mileage log"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ==================== 5. REPORTS VIEW ==================== */}
            {activeTab === 'reports' && (
              <div className="dmg-reports-showcase">
                <div className="dmg-reports-dark-banner">
                  <h1 className="dmg-reports-banner-title">
                    Reports ({currentMonthMeta.shortLabel})
                  </h1>
                </div>

                <div className="dmg-reports-subbar">
                  <div className="dmg-reports-tabs">
                    {['Overview', 'Income', 'Expenses', 'Mileage'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={`dmg-report-tab ${reportSubTab === tab ? 'active' : ''}`}
                        onClick={() => setReportSubTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="dmg-btn-primary-dark dmg-export-btn"
                    onClick={handleExportCSV}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export
                  </button>
                </div>

                <div className="dmg-reports-kpi-row">
                  <div className="dmg-report-kpi-box">
                    <span className="dmg-rk-label">Total Income</span>
                    <strong className="dmg-rk-val">{formatCurrency(summary.totalIncome)}</strong>
                  </div>
                  <div className="dmg-report-kpi-box">
                    <span className="dmg-rk-label">Total Expenses</span>
                    <strong className="dmg-rk-val">{formatCurrency(summary.totalExpenses)}</strong>
                  </div>
                  <div className="dmg-report-kpi-box">
                    <span className="dmg-rk-label">Net Income</span>
                    <strong className="dmg-rk-val">{formatCurrency(summary.netIncome)}</strong>
                  </div>
                  <div className="dmg-report-kpi-box">
                    <span className="dmg-rk-label">Total Mileage</span>
                    <strong className="dmg-rk-val">
                      {formatDistance(summary.mileageStats.totalMiles, unitSystem)}
                    </strong>
                  </div>
                </div>

                {reportSubTab === 'Overview' && (
                  <>
                    <ExpensesHorizontalBars breakdown={categoryBreakdown} />
                    <div className="dmg-charts-row" style={{ marginTop: '20px' }}>
                      <IncomeVsExpensesChart series={monthlySeries} />
                      <MileageEfficiencyChart series={monthlySeries} unitSystem={unitSystem} />
                    </div>
                  </>
                )}

                {reportSubTab === 'Income' && (
                  <div className="dmg-card" style={{ marginTop: '18px' }}>
                    <h3 className="dmg-card-title" style={{ marginBottom: '14px' }}>
                      Income Breakdown ({currentMonthMeta.shortLabel})
                    </h3>
                    <RecentTransactionsCard
                      transactions={combinedTransactions.filter((t) => t.txType === 'income')}
                      limit={25}
                    />
                  </div>
                )}

                {reportSubTab === 'Expenses' && (
                  <>
                    <ExpensesHorizontalBars breakdown={categoryBreakdown} />
                    <div style={{ marginTop: '18px' }}>
                      <RecentTransactionsCard
                        transactions={combinedTransactions.filter((t) => t.txType === 'expense')}
                        limit={25}
                      />
                    </div>
                  </>
                )}

                {reportSubTab === 'Mileage' && (
                  <div className="dmg-charts-row" style={{ marginTop: '18px' }}>
                    <MileageOverviewCard
                      mileageStats={summary.mileageStats}
                      unitSystem={unitSystem}
                      monthShortLabel={currentMonthMeta.monthAbbr}
                    />
                    <MileageEfficiencyChart series={monthlySeries} unitSystem={unitSystem} />
                  </div>
                )}
              </div>
            )}

            {/* ==================== 6. GOALS VIEW ==================== */}
            {activeTab === 'goals' && (
              <div className="dmg-goals-showcase">
                <div className="dmg-goals-header-bar">
                  <div>
                    <h1 className="dmg-page-title">Goals</h1>
                    <p className="dmg-page-subtitle">
                      Financial &amp; mileage milestones tracked in real time.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="dmg-btn-primary-dark"
                    onClick={() => setModalMode('goal')}
                  >
                    + Add Goal
                  </button>
                </div>

                {goals.length === 0 ? (
                  <div className="dmg-card dmg-empty-state" style={{ padding: '40px 24px', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '8px', color: 'var(--dmg-text-main)' }}>
                      No Goals Created Yet
                    </h3>
                    <p style={{ marginBottom: '16px' }}>
                      Set savings targets, monthly expense limits, or mileage goals to track your progress.
                    </p>
                    <button
                      type="button"
                      className="dmg-btn-primary-dark"
                      onClick={() => setModalMode('goal')}
                    >
                      + Create Your First Goal
                    </button>
                  </div>
                ) : (
                  <div className="dmg-goals-grid">
                    {goals.map((goal) => {
                      const pct =
                        goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
                      const isOverCap = goal.type === 'expense_cap' && pct > 100;
                      const barColor = isOverCap ? '#ef4444' : goal.color || '#22c55e';
                      const fillWidth = Math.min(100, pct);

                      const formatGoalVal = (v) =>
                        goal.unit === '$'
                          ? `$${Number(v).toLocaleString()}`
                          : `${Number(v).toLocaleString()} ${goal.unit}`;

                      return (
                        <div key={goal.id} className="dmg-card dmg-goal-card">
                          <div className="dmg-goal-top">
                            <div className="dmg-goal-left">
                              <div
                                className={`dmg-goal-icon ${
                                  isOverCap ? 'goal-icon-danger' : 'goal-icon-dark'
                                }`}
                              >
                                {isOverCap ? '$' : goal.unit === 'mi' ? '⏱' : '🏦'}
                              </div>
                              <div>
                                <h3 className="dmg-goal-title">{goal.title}</h3>
                                <div className="dmg-goal-sub">
                                  {formatGoalVal(goal.current)} / {formatGoalVal(goal.target)}
                                </div>
                              </div>
                            </div>

                            <div className="dmg-goal-right">
                              <span
                                className={`dmg-goal-pct ${isOverCap ? 'pct-danger' : ''}`}
                              >
                                {pct}%
                              </span>
                            </div>
                          </div>

                          <div className="dmg-goal-progress-track">
                            <div
                              className="dmg-goal-progress-fill"
                              style={{
                                width: `${fillWidth}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>

                          <div className="dmg-goal-actions">
                            <span className="dmg-goal-note">{goal.notes || 'Milestone active'}</span>
                            <div className="dmg-goal-step-btns">
                              <button
                                type="button"
                                className="dmg-step-btn"
                                onClick={() =>
                                  onUpdateGoal(goal.id, {
                                    current: Math.max(
                                      0,
                                      goal.current - (goal.unit === 'mi' ? 25 : 250)
                                    ),
                                  })
                                }
                              >
                                - {goal.unit === 'mi' ? '25 mi' : '$250'}
                              </button>
                              <button
                                type="button"
                                className="dmg-step-btn"
                                onClick={() =>
                                  onUpdateGoal(goal.id, {
                                    current: goal.current + (goal.unit === 'mi' ? 25 : 250),
                                  })
                                }
                              >
                                + {goal.unit === 'mi' ? '25 mi' : '$250'}
                              </button>
                              <button
                                type="button"
                                className="dmg-step-btn danger"
                                onClick={() => onDeleteGoal(goal.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==================== 7. SETTINGS VIEW ("Account Profile") ==================== */}
            {activeTab === 'settings' && (
              <div className="dmg-settings-page">
                <div className="dmg-page-header">
                  <div>
                    <h1 className="dmg-page-title">Account Profile</h1>
                    <p className="dmg-page-subtitle">
                      Manage your TRACCR account details, profile picture, vehicles, and data.
                    </p>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      className="dmg-btn-secondary-light"
                      onClick={onLogout}
                    >
                      Log Out of Account
                    </button>
                  )}
                </div>

                <div className="dmg-settings-grid">
                  {/* CARD 1: ACCOUNT PROFILE */}
                  <div className="dmg-card">
                    <h3 className="dmg-card-title" style={{ marginBottom: '16px' }}>
                      Account Profile
                    </h3>

                    <div className="dmg-profile-hero">
                      <div
                        className="dmg-avatar-upload-wrap"
                        onClick={() => profileFileInputRef.current?.click()}
                        title="Click to upload profile picture"
                      >
                        <UserAvatar
                          size={68}
                          photoURL={settings.photoURL}
                          name={settings.userName}
                        />
                        <span className="dmg-avatar-cam-badge">📷</span>
                      </div>

                      <div className="dmg-profile-hero-info">
                        <h4>{settings.userName}</h4>
                        <p>{settings.email || 'No email set'}</p>
                        <div className="dmg-photo-btn-group">
                          <button
                            type="button"
                            className="dmg-btn-upload-photo"
                            onClick={() => profileFileInputRef.current?.click()}
                          >
                            Upload Profile Picture
                          </button>
                          {settings.photoURL && (
                            <button
                              type="button"
                              className="dmg-btn-remove-photo"
                              onClick={() =>
                                onUpdateSettings({ ...settings, photoURL: '' })
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="dmg-field-row" style={{ marginTop: '18px' }}>
                      <div className="dmg-field">
                        <label>First Name</label>
                        <input
                          type="text"
                          className="dmg-input-light"
                          value={settings.firstName || ''}
                          onChange={(e) => {
                            const fn = e.target.value;
                            const ln = settings.lastName || '';
                            onUpdateSettings({
                              ...settings,
                              firstName: fn,
                              userName: `${fn} ${ln}`.trim(),
                            });
                          }}
                        />
                      </div>

                      <div className="dmg-field">
                        <label>Last Name</label>
                        <input
                          type="text"
                          className="dmg-input-light"
                          value={settings.lastName || ''}
                          onChange={(e) => {
                            const ln = e.target.value;
                            const fn = settings.firstName || '';
                            onUpdateSettings({
                              ...settings,
                              lastName: ln,
                              userName: `${fn} ${ln}`.trim(),
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div className="dmg-field-row" style={{ marginTop: '12px' }}>
                      <div className="dmg-field">
                        <label>Email Address</label>
                        <input
                          type="email"
                          className="dmg-input-light"
                          value={settings.email || ''}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, email: e.target.value })
                          }
                        />
                      </div>

                      <div className="dmg-field">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          className="dmg-input-light"
                          value={settings.phone || ''}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: MULTI-VEHICLE GARAGE MANAGER */}
                  <div className="dmg-card">
                    <div className="dmg-card-header">
                      <h3 className="dmg-card-title">My Vehicles ({vehicles.length})</h3>
                      <button
                        type="button"
                        className="dmg-btn-primary-dark"
                        style={{ padding: '7px 12px', fontSize: '12.5px' }}
                        onClick={() => setModalMode('vehicle')}
                      >
                        + Add Vehicle
                      </button>
                    </div>

                    <div className="dmg-vehicles-list">
                      {vehicles.length === 0 ? (
                        <div className="dmg-empty-state" style={{ padding: '8px 0' }}>
                          No vehicles in your garage yet. Add your first vehicle below!
                        </div>
                      ) : (
                        vehicles.map((v) => (
                          <div key={v.id} className="dmg-vehicle-row-item">
                            <div>
                              <div className="dmg-veh-row-title">
                                <strong>{v.name}</strong>
                                {v.isPrimary && (
                                  <span className="dmg-primary-tag">Primary</span>
                                )}
                              </div>
                              <div className="dmg-veh-row-sub">
                                {v.type || 'Vehicle'}{' '}
                                {v.licensePlate ? `• Plate: ${v.licensePlate}` : ''}
                              </div>
                            </div>

                            <div className="dmg-veh-row-actions">
                              {!v.isPrimary && (
                                <button
                                  type="button"
                                  className="dmg-step-btn"
                                  onClick={() => onSetPrimaryVehicle(v.id)}
                                >
                                  Set Primary
                                </button>
                              )}
                              <button
                                type="button"
                                className="dmg-step-btn danger"
                                onClick={() => onDeleteVehicle(v.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Inline Add Vehicle Form */}
                    <form
                      onSubmit={handleCreateVehicle}
                      className="dmg-inline-vehicle-form"
                    >
                      <div className="dmg-sub-heading" style={{ marginBottom: '10px' }}>
                        Quick Add Vehicle
                      </div>
                      <div className="dmg-field-row">
                        <input
                          type="text"
                          className="dmg-input-light"
                          placeholder="Year (e.g. 2026)"
                          value={vehYear}
                          onChange={(e) => setVehYear(e.target.value)}
                        />
                        <input
                          type="text"
                          className="dmg-input-light"
                          placeholder="Make & Model (e.g. Porsche 911)"
                          value={vehMakeModel}
                          onChange={(e) => setVehMakeModel(e.target.value)}
                          required
                        />
                      </div>
                      <div className="dmg-field-row" style={{ marginTop: '8px' }}>
                        <select
                          className="dmg-input-light"
                          value={vehType}
                          onChange={(e) => setVehType(e.target.value)}
                        >
                          <option value="Executive Sedan">Executive Sedan</option>
                          <option value="Luxury SUV">Luxury SUV</option>
                          <option value="Sports Coupe">Sports Coupe</option>
                          <option value="Truck / Fleet">Truck / Fleet</option>
                          <option value="EV / Hybrid">EV / Hybrid</option>
                        </select>
                        <button type="submit" className="dmg-btn-primary-dark">
                          + Save Vehicle
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* CARD 3: DATA RESET ("Wipe All Data") & PREFERENCES */}
                  <div className="dmg-card">
                    <h3 className="dmg-card-title" style={{ marginBottom: '16px' }}>
                      Data Control &amp; Preferences
                    </h3>

                    <div className="dmg-setting-row">
                      <div>
                        <strong style={{ color: '#dc2626' }}>
                          Wipe All Data (Start From Scratch)
                        </strong>
                        <p>
                          Erase all income, expenses, mileage, goals, and vehicles in this account back to zero ($0.00).
                        </p>
                      </div>
                      {!confirmWipe ? (
                        <button
                          type="button"
                          className="dmg-btn-wipe-danger"
                          onClick={() => setConfirmWipe(true)}
                        >
                          Wipe All Data
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="dmg-btn-wipe-danger confirm"
                            onClick={handleConfirmWipeAll}
                          >
                            Confirm Wipe
                          </button>
                          <button
                            type="button"
                            className="dmg-btn-secondary-light"
                            style={{ padding: '7px 10px', fontSize: '12px' }}
                            onClick={() => setConfirmWipe(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="dmg-setting-row">
                      <div>
                        <strong>Load Demo Showcase Data</strong>
                        <p>Populate account with the DMG Official October 2026 showcase dataset</p>
                      </div>
                      <button
                        type="button"
                        className="dmg-btn-primary-dark"
                        onClick={() => {
                          onResetDemoData();
                          setStatusBanner('Loaded DMG Official October 2026 showcase dataset.');
                          setTimeout(() => setStatusBanner(''), 4000);
                        }}
                      >
                        Load Demo Data
                      </button>
                    </div>

                    <div className="dmg-setting-row">
                      <div>
                        <strong>Distance &amp; Fuel Efficiency Units</strong>
                        <p>Switch between Miles / MPG and Kilometers / km/L</p>
                      </div>
                      <select
                        className="dmg-filter-month-select"
                        value={settings.unitSystem}
                        onChange={(e) =>
                          onUpdateSettings({ ...settings, unitSystem: e.target.value })
                        }
                      >
                        <option value="imperial">Imperial (mi / MPG)</option>
                        <option value="metric">Metric (km / km/L)</option>
                      </select>
                    </div>

                    <div className="dmg-setting-row">
                      <div>
                        <strong>Full Dark Mode Canvas</strong>
                        <p>Switch main workspace between Light and Stealth Dark</p>
                      </div>
                      <button
                        type="button"
                        className={`dmg-btn-secondary-light ${settings.darkMode ? 'active' : ''}`}
                        onClick={() =>
                          onUpdateSettings({ ...settings, darkMode: !settings.darkMode })
                        }
                      >
                        {settings.darkMode ? 'Dark Canvas Active' : 'Switch to Dark Canvas'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* ==================== OPTIONAL RIGHT-SIDE IPHONE DARK MOCKUP TWIN ==================== */}
          {mobilePreviewMode && (
            <aside className="dmg-iphone-companion" aria-label="Mobile Dark UI Companion">
              <div className="dmg-iphone-frame">
                <div className="dmg-iphone-statusbar">
                  <span>9:41</span>
                  <div className="dmg-iphone-notch" />
                  <span>5G 100%</span>
                </div>

                <div className="dmg-iphone-header">
                  <DmgBrandLogo size="small" />
                  <div className="dmg-iphone-user">
                    <UserAvatar
                      size={28}
                      photoURL={settings.photoURL}
                      name={settings.userName}
                    />
                  </div>
                </div>

                <div className="dmg-iphone-net-card">
                  <div>
                    <div className="dmg-iphone-net-lbl">Net Income</div>
                    <div className="dmg-iphone-net-val">
                      {formatCurrency(summary.netIncome)}
                    </div>
                    <div className="dmg-iphone-net-trend">
                      ^ {summary.netChangePct}% from last month
                    </div>
                  </div>
                  <div className="dmg-iphone-mini-bars">
                    <span style={{ height: '35%' }} />
                    <span style={{ height: '55%' }} />
                    <span style={{ height: '75%' }} />
                    <span className="neon" style={{ height: '100%' }} />
                  </div>
                </div>

                <div className="dmg-iphone-quick-btns">
                  <button
                    type="button"
                    className="iphone-qbtn active"
                    onClick={() => setModalMode('income')}
                  >
                    + Income
                  </button>
                  <button
                    type="button"
                    className="iphone-qbtn"
                    onClick={() => setModalMode('expense')}
                  >
                    + Expense
                  </button>
                  <button
                    type="button"
                    className="iphone-qbtn"
                    onClick={() => setModalMode('mileage')}
                  >
                    + Mileage
                  </button>
                </div>

                <div className="dmg-iphone-section-head">
                  <span>{currentMonthMeta.shortLabel} ▾</span>
                  <button type="button" onClick={() => setActiveTab('reports')}>
                    See All
                  </button>
                </div>

                <div className="dmg-iphone-summary-rows">
                  <div className="dmg-iphone-srow">
                    <span className="sdot green">+</span>
                    <span className="slbl">Income</span>
                    <strong className="sval green">{formatCurrency(summary.totalIncome)}</strong>
                  </div>
                  <div className="dmg-iphone-srow">
                    <span className="sdot red">↑</span>
                    <span className="slbl">Expenses</span>
                    <strong className="sval red">{formatCurrency(summary.totalExpenses)}</strong>
                  </div>
                  <div className="dmg-iphone-srow">
                    <span className="sdot blue">🚗</span>
                    <span className="slbl">Mileage</span>
                    <strong className="sval blue">
                      {formatDistance(summary.mileageStats.totalMiles, unitSystem)}
                    </strong>
                  </div>
                </div>

                <div className="dmg-iphone-donut-box">
                  <ExpenseBreakdownDonut breakdown={categoryBreakdown} compact />
                </div>

                <div className="dmg-iphone-tabbar">
                  {['dashboard', 'income', 'expenses', 'mileage', 'goals'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={activeTab === t ? 'active' : ''}
                      onClick={() => setActiveTab(t)}
                    >
                      {t === 'dashboard' ? 'Home' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="dmg-mobile-bottom-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dmg-mnav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {renderNavIcon(item.icon)}
              <span>{item.id === 'dashboard' ? 'Home' : item.id === 'settings' ? 'Profile' : item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ==================== DARK MODALS ==================== */}
      {modalMode && (
        <div
          className="dmg-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalMode(null);
          }}
        >
          {modalMode === 'expense' && (
            <ExpenseForm
              isModal
              onAddExpense={onAddExpense}
              onSwitchToIncome={() => setModalMode('income')}
              onClose={() => setModalMode(null)}
            />
          )}

          {modalMode === 'income' && (
            <IncomeForm
              isModal
              onAddIncome={onAddIncome}
              onSwitchToExpense={() => setModalMode('expense')}
              onClose={() => setModalMode(null)}
            />
          )}

          {modalMode === 'mileage' && (
            <CarMileageForm
              isModal
              unitSystem={unitSystem}
              vehicles={vehicles}
              onAddVehicle={onAddVehicle}
              onAddMileage={onAddMileage}
              onClose={() => setModalMode(null)}
            />
          )}

          {modalMode === 'vehicle' && (
            <div className="dmg-form-card dmg-form-modal">
              <div className="dmg-form-header">
                <button
                  type="button"
                  className="dmg-back-btn"
                  onClick={() => setModalMode(null)}
                >
                  ‹
                </button>
                <h3 className="dmg-form-title">Add Vehicle</h3>
                <span className="dmg-form-spacer" />
              </div>

              <form onSubmit={handleCreateVehicle} className="dmg-form-body">
                <div className="dmg-field-row">
                  <div className="dmg-field">
                    <label>Year</label>
                    <input
                      type="text"
                      className="dmg-input"
                      placeholder="2026"
                      value={vehYear}
                      onChange={(e) => setVehYear(e.target.value)}
                    />
                  </div>
                  <div className="dmg-field">
                    <label>Type</label>
                    <select
                      className="dmg-select"
                      value={vehType}
                      onChange={(e) => setVehType(e.target.value)}
                    >
                      <option value="Executive Sedan">Executive Sedan</option>
                      <option value="Luxury SUV">Luxury SUV</option>
                      <option value="Sports Coupe">Sports Coupe</option>
                      <option value="Truck / Fleet">Truck / Fleet</option>
                      <option value="EV / Hybrid">EV / Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="dmg-field">
                  <label>Make &amp; Model *</label>
                  <input
                    type="text"
                    className="dmg-input"
                    placeholder="e.g., Chrysler 300S, BMW M5, Mercedes G63..."
                    value={vehMakeModel}
                    onChange={(e) => setVehMakeModel(e.target.value)}
                    required
                  />
                </div>

                <div className="dmg-field">
                  <label>License Plate / Tag (optional)</label>
                  <input
                    type="text"
                    className="dmg-input"
                    placeholder="DMG-001"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value)}
                  />
                </div>

                <button type="submit" className="dmg-submit-green">
                  Save Vehicle to Garage
                </button>
              </form>
            </div>
          )}

          {modalMode === 'goal' && (
            <div className="dmg-form-card dmg-form-modal">
              <div className="dmg-form-header">
                <button
                  type="button"
                  className="dmg-back-btn"
                  onClick={() => setModalMode(null)}
                >
                  ‹
                </button>
                <h3 className="dmg-form-title">Add Goal</h3>
                <span className="dmg-form-spacer" />
              </div>

              <form onSubmit={handleCreateGoal} className="dmg-form-body">
                <div className="dmg-field">
                  <label>Goal Title</label>
                  <input
                    type="text"
                    className="dmg-input"
                    placeholder="e.g., Save $10,000, New Car Downpayment..."
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="dmg-field-row">
                  <div className="dmg-field">
                    <label>Current Progress</label>
                    <input
                      type="number"
                      className="dmg-input"
                      placeholder="0"
                      value={goalCurrent}
                      onChange={(e) => setGoalCurrent(e.target.value)}
                    />
                  </div>
                  <div className="dmg-field">
                    <label>Target Goal</label>
                    <input
                      type="number"
                      className="dmg-input"
                      placeholder="5000"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="dmg-field">
                  <label>Unit Type</label>
                  <select
                    className="dmg-select"
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                  >
                    <option value="$">Currency ($)</option>
                    <option value="mi">Mileage (mi)</option>
                  </select>
                </div>

                <button type="submit" className="dmg-submit-green">
                  Save Goal
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
