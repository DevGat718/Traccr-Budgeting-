/**
 * TRACCR by DMG Official
 * Financial & Analytics Calculation Utilities (Auto-Advancing Multi-Year Calendar)
 */

import { calculateMileageSummary } from './fuelEfficiency.js';

export const CATEGORY_CONFIG = {
  'Food & Drinks': { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)', label: 'Food & Drinks', sublabel: 'Food & Drinks' },
  Car: { color: '#ea580c', bg: 'rgba(234, 88, 12, 0.12)', label: 'Car', sublabel: 'Vehicle' },
  Shopping: { color: '#9333ea', bg: 'rgba(147, 51, 234, 0.12)', label: 'Shopping', sublabel: 'Shopping' },
  Bills: { color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)', label: 'Bills', sublabel: 'Bills & Utilities' },
  Travel: { color: '#0d9488', bg: 'rgba(13, 148, 136, 0.12)', label: 'Travel', sublabel: 'Transport' },
  Other: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', label: 'Other', sublabel: 'General' },
  Groceries: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Groceries', sublabel: 'Groceries' },
  Rent: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', label: 'Rent', sublabel: 'Housing' },
  Entertainment: { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)', label: 'Entertainment', sublabel: 'Leisure' },
};

export const INCOME_SOURCES = [
  'JetBlue Payroll',
  'Salary',
  'Freelance',
  'Side Jobs',
  'Investments',
  'Bonus',
  'Other',
];

export const EXPENSE_CATEGORIES = [
  'Food & Drinks',
  'Car',
  'Shopping',
  'Bills',
  'Travel',
  'Groceries',
  'Rent',
  'Entertainment',
  'Other',
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Returns today's local date in YYYY-MM-DD format automatically.
 */
export function getTodayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the current live YYYY-MM key from the system clock.
 */
export function getCurrentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Formats a YYYY-MM key into metadata ({ value, label, shortLabel, monthAbbr, year }).
 */
export function getMonthMeta(ymKey) {
  if (!ymKey || ymKey === 'all') {
    return {
      value: 'all',
      label: 'All Time (All Dates)',
      shortLabel: 'All Time',
      monthAbbr: 'All',
      year: new Date().getFullYear(),
    };
  }
  if (ymKey.startsWith('year-')) {
    const yr = ymKey.replace('year-', '');
    return {
      value: ymKey,
      label: `Jan 1, ${yr} - Dec 31, ${yr} (Full Year)`,
      shortLabel: `Full Year ${yr}`,
      monthAbbr: yr,
      year: Number(yr),
    };
  }
  const [yStr, mStr] = ymKey.split('-');
  const year = Number(yStr) || new Date().getFullYear();
  const monthIdx = Math.max(0, Math.min(11, (Number(mStr) || 1) - 1));
  const lastDay = new Date(year, monthIdx + 1, 0).getDate();
  const shortM = SHORT_MONTHS[monthIdx];
  const fullM = FULL_MONTHS[monthIdx];

  return {
    value: `${year}-${String(monthIdx + 1).padStart(2, '0')}`,
    label: `${shortM} 1, ${year} - ${shortM} ${lastDay}, ${year}`,
    shortLabel: `${fullM} ${year}`,
    monthAbbr: shortM,
    year,
  };
}

/**
 * Dynamically generates month & multi-year dropdown options based on the live system date
 * plus any years present in user records. Automatically rolls forward every month and year!
 */
export function generateDynamicMonthOptions(records = []) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1..12

  const monthKeys = new Set();

  // Include 6 months ahead, current month, and 36 months back automatically,
  // plus full years from (currentYear - 2) to (currentYear + 2)
  for (let offset = 6; offset >= -36; offset--) {
    const d = new Date(currentYear, currentMonth - 1 + offset, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthKeys.add(ym);
  }

  // Also ensure any date in existing user records is selectable
  records.forEach((r) => {
    if (r?.date && r.date.length >= 7) {
      monthKeys.add(r.date.slice(0, 7));
    }
  });

  const sortedMonths = Array.from(monthKeys).sort((a, b) => b.localeCompare(a));

  const yearsSet = new Set();
  sortedMonths.forEach((ym) => {
    const yr = ym.slice(0, 4);
    if (yr) yearsSet.add(yr);
  });
  const sortedYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));

  const options = [
    getMonthMeta('all'),
    ...sortedYears.map((yr) => getMonthMeta(`year-${yr}`)),
    ...sortedMonths.map((ym) => getMonthMeta(ym)),
  ];

  return options;
}

/**
 * Formats a numeric value as USD currency string.
 */
export function formatCurrency(amount, showCents = true) {
  const num = parseFloat(amount) || 0;
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });
  return num < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into "Oct 26, 2026".
 */
export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns YYYY-MM prefix for a date string.
 */
export function getYearMonth(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 7);
}

/**
 * Filters records by month/year key ('2026-10', 'year-2026', or 'all'), category, vehicle, and search query.
 */
export function filterRecords(
  records = [],
  { month = getCurrentYearMonth(), category = 'All', vehicle = 'All', search = '' } = {}
) {
  const q = (search || '').trim().toLowerCase();
  return records.filter((item) => {
    if (month && month !== 'all') {
      if (month.startsWith('year-')) {
        const yr = month.replace('year-', '');
        if (!(item.date || '').startsWith(yr)) return false;
      } else {
        if (getYearMonth(item.date) !== month) return false;
      }
    }
    if (category && category !== 'All') {
      const itemCat = item.category || item.source || item.purpose || '';
      if (itemCat.toLowerCase() !== category.toLowerCase()) return false;
    }
    if (vehicle && vehicle !== 'All') {
      if ((item.vehicle || '').toLowerCase() !== vehicle.toLowerCase()) return false;
    }
    if (q) {
      const hay = `${item.title || ''} ${item.category || ''} ${item.source || ''} ${item.notes || ''} ${item.startLocation || ''} ${item.endLocation || ''} ${item.vehicle || ''} ${item.amount || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Calculates total income, total expenses, net income, and percentage changes vs previous month.
 * Returns 0% change when an account has no data.
 */
export function calculateFinancialSummary(
  incomes = [],
  expenses = [],
  mileageLogs = [],
  selectedMonth = getCurrentYearMonth()
) {
  const currentIncomes = filterRecords(incomes, { month: selectedMonth });
  const currentExpenses = filterRecords(expenses, { month: selectedMonth });
  const currentMileage = filterRecords(mileageLogs, { month: selectedMonth });

  const totalIncome = currentIncomes.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
  const totalExpenses = currentExpenses.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
  const netIncome = totalIncome - totalExpenses;
  const mileageStats = calculateMileageSummary(currentMileage);

  // Previous month comparison
  let prevMonth = '';
  if (selectedMonth && !selectedMonth.startsWith('year-') && selectedMonth !== 'all' && selectedMonth.includes('-')) {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  }

  const prevIncomes = prevMonth ? filterRecords(incomes, { month: prevMonth }) : [];
  const prevExpenses = prevMonth ? filterRecords(expenses, { month: prevMonth }) : [];
  const prevMileage = prevMonth ? filterRecords(mileageLogs, { month: prevMonth }) : [];

  const prevTotalIncome = prevIncomes.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
  const prevTotalExpenses = prevExpenses.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
  const prevNetIncome = prevTotalIncome - prevTotalExpenses;
  const prevMileageStats = calculateMileageSummary(prevMileage);

  const calcPctChange = (curr, prev) => {
    if (curr === 0 && prev === 0) return 0;
    if (prev <= 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netIncome: Math.round(netIncome * 100) / 100,
    mileageStats,
    incomeChangePct: calcPctChange(totalIncome, prevTotalIncome),
    expenseChangePct: calcPctChange(totalExpenses, prevTotalExpenses),
    netChangePct: calcPctChange(netIncome, prevNetIncome),
    mileageChangePct: calcPctChange(mileageStats.totalMiles, prevMileageStats.totalMiles),
  };
}

/**
 * Calculates expense breakdown by category with amounts, percentages, and colors.
 */
export function calculateCategoryBreakdown(expenses = []) {
  const total = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const byCategory = {};

  expenses.forEach((e) => {
    const cat = e.category || 'Other';
    byCategory[cat] = (byCategory[cat] || 0) + (parseFloat(e.amount) || 0);
  });

  const preferredOrder = ['Food & Drinks', 'Car', 'Shopping', 'Bills', 'Travel', 'Other', 'Groceries', 'Rent', 'Entertainment'];

  const items = Object.keys(byCategory)
    .sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return byCategory[b] - byCategory[a];
    })
    .map((category) => {
      const amount = Math.round(byCategory[category] * 100) / 100;
      const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
      const cfg = CATEGORY_CONFIG[category] || { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: category };
      return {
        category,
        amount,
        percentage,
        color: cfg.color,
        bg: cfg.bg,
      };
    });

  return {
    total: Math.round(total * 100) / 100,
    items,
  };
}

/**
 * Builds monthly Income vs Expenses series dynamically anchored to the active month/year!
 * Automatically rolls forward as real-world months pass.
 */
export function calculateMonthlySeries(
  incomes = [],
  expenses = [],
  mileageLogs = [],
  monthCount = 6,
  anchorMonth = getCurrentYearMonth()
) {
  let baseYear = new Date().getFullYear();
  let baseMonthIdx = new Date().getMonth(); // 0..11

  if (anchorMonth && anchorMonth.includes('-') && !anchorMonth.startsWith('year-')) {
    const [y, m] = anchorMonth.split('-').map(Number);
    if (y && m) {
      baseYear = y;
      baseMonthIdx = m - 1;
    }
  } else if (anchorMonth && anchorMonth.startsWith('year-')) {
    baseYear = Number(anchorMonth.replace('year-', '')) || baseYear;
    baseMonthIdx = 9; // Oct
  }

  const monthsMeta = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(baseYear, baseMonthIdx - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = SHORT_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    monthsMeta.push({ key, label, year });
  }

  return monthsMeta.map((m) => {
    const mIncomes = filterRecords(incomes, { month: m.key });
    const mExpenses = filterRecords(expenses, { month: m.key });
    const mMileage = filterRecords(mileageLogs, { month: m.key });
    const inc = mIncomes.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const exp = mExpenses.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const miStats = calculateMileageSummary(mMileage);
    return {
      monthKey: m.key,
      label: m.label,
      year: m.year,
      income: Math.round(inc * 100) / 100,
      expenses: Math.round(exp * 100) / 100,
      net: Math.round((inc - exp) * 100) / 100,
      miles: miStats.totalMiles,
      mpg: miStats.avgEfficiencyMpg,
    };
  });
}

/**
 * Combines incomes and expenses into a unified chronological transactions feed.
 */
export function getCombinedTransactions(incomes = [], expenses = [], filterOpts = {}) {
  const filteredInc = filterRecords(incomes, filterOpts).map((i) => ({
    ...i,
    txType: 'income',
    displayTitle: i.title || i.source || 'Income',
    displaySubtitle: i.category || 'Income',
  }));

  const filteredExp = filterRecords(expenses, filterOpts).map((e) => ({
    ...e,
    txType: 'expense',
    displayTitle: e.title || e.category || 'Expense',
    displaySubtitle: e.subCategory || (CATEGORY_CONFIG[e.category]?.sublabel) || e.category || 'Expense',
  }));

  return [...filteredInc, ...filteredExp].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}
