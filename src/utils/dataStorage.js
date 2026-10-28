/**
 * TRACCR by DMG Official
 * Per-Account Persistence, Empty-State Initialization for New Users,
 * Demo Account Seed Data, and "Wipe All Data" Support.
 */

import { getCurrentYearMonth } from './calculate.js';

const GLOBAL_KEYS = {
  AUTH_USER: 'traccr_dmg_v3_auth_user',
  USERS_DB: 'traccr_dmg_v3_users_db',
  FIREBASE_CONFIG: 'traccr_dmg_v3_firebase_config',
};

function getUserKey(uid, field) {
  const safeUid = uid || 'guest';
  return `traccr_dmg_v3_user_${safeUid}_${field}`;
}

export const DEMO_USER_UID = 'usr-dmg-official-demo';

export const DEFAULT_USER_PROFILE = {
  uid: DEMO_USER_UID,
  firstName: 'Devin',
  lastName: 'Gatling',
  userName: 'Devin Gatling',
  email: 'devin@dmgofficial.com',
  phone: '(718) 555-0199',
  userRole: 'DMG Official • Founder (Demo)',
  photoURL: '',
  isDemo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const INITIAL_VEHICLES = [
  {
    id: 'veh-1',
    name: '2026 Chrysler 300S Black Edition',
    make: 'Chrysler',
    model: '300S Black Edition',
    year: '2026',
    type: 'Executive Sedan',
    licensePlate: 'DMG-300',
    isPrimary: true,
  },
  {
    id: 'veh-2',
    name: '2026 Cadillac Escalade Sport',
    make: 'Cadillac',
    model: 'Escalade Sport',
    year: '2026',
    type: 'Luxury SUV',
    licensePlate: 'DMG-001',
    isPrimary: false,
  },
];

export const INITIAL_INCOMES = [
  // October 2026 ($4,250.00 total)
  {
    id: 'inc-oct-1',
    title: 'JetBlue Payroll',
    source: 'JetBlue Payroll',
    category: 'Income',
    amount: 2125.00,
    date: '2026-10-26',
    notes: 'Bi-weekly flight ops payroll direct deposit',
    createdAt: 1793000000000,
  },
  {
    id: 'inc-oct-2',
    title: 'JetBlue Payroll',
    source: 'JetBlue Payroll',
    category: 'Income',
    amount: 2125.00,
    date: '2026-10-11',
    notes: 'Mid-month payroll direct deposit',
    createdAt: 1791700000000,
  },
  // September 2026 ($3,795.00 total -> +12% in Oct)
  {
    id: 'inc-sep-1',
    title: 'JetBlue Payroll',
    source: 'JetBlue Payroll',
    category: 'Income',
    amount: 1995.00,
    date: '2026-09-27',
    notes: 'September payroll period 2',
    createdAt: 1790500000000,
  },
  {
    id: 'inc-sep-2',
    title: 'JetBlue Payroll',
    source: 'JetBlue Payroll',
    category: 'Income',
    amount: 1800.00,
    date: '2026-09-13',
    notes: 'September payroll period 1',
    createdAt: 1789300000000,
  },
  // August 2026
  {
    id: 'inc-aug-1',
    title: 'JetBlue Payroll',
    source: 'JetBlue Payroll',
    category: 'Income',
    amount: 3450.00,
    date: '2026-08-25',
    notes: 'August combined payroll & flight differential',
    createdAt: 1787600000000,
  },
  // July 2026
  {
    id: 'inc-jul-1',
    title: 'JetBlue Payroll',
    source: 'JetBlue Payroll',
    category: 'Income',
    amount: 3300.00,
    date: '2026-07-26',
    notes: 'July payroll total',
    createdAt: 1785000000000,
  },
  // June 2026
  {
    id: 'inc-jun-1',
    title: 'JetBlue Payroll',
    source: 'JetBlue Payroll',
    category: 'Income',
    amount: 2850.00,
    date: '2026-06-25',
    notes: 'June payroll total',
    createdAt: 1782400000000,
  },
  // May 2026
  {
    id: 'inc-may-1',
    title: 'JetBlue Payroll',
    source: 'JetBlue Payroll',
    category: 'Income',
    amount: 2150.00,
    date: '2026-05-25',
    notes: 'May payroll total',
    createdAt: 1779700000000,
  },
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp-oct-1',
    title: 'Shell Gas',
    category: 'Car',
    subCategory: 'Vehicle',
    amount: 52.31,
    date: '2026-10-24',
    notes: 'V-Power Nitro+ fill-up near JFK',
    iconType: 'gas',
    createdAt: 1792840000000,
  },
  {
    id: 'exp-oct-2',
    title: 'Chipotle',
    category: 'Food & Drinks',
    subCategory: 'Food & Drinks',
    amount: 14.25,
    date: '2026-10-23',
    notes: 'Post-shift chicken bowl & guac',
    iconType: 'food',
    createdAt: 1792750000000,
  },
  {
    id: 'exp-oct-3',
    title: 'Uber',
    category: 'Travel',
    subCategory: 'Transport',
    amount: 27.40,
    date: '2026-10-22',
    notes: 'Terminal transfer ride',
    iconType: 'uber',
    createdAt: 1792660000000,
  },
  {
    id: 'exp-oct-4',
    title: 'Whole Foods Market',
    category: 'Food & Drinks',
    subCategory: 'Food & Drinks',
    amount: 382.68,
    date: '2026-10-18',
    notes: 'Monthly groceries & meal prep',
    iconType: 'food',
    createdAt: 1792320000000,
  },
  {
    id: 'exp-oct-5',
    title: 'Apple Store & Gear',
    category: 'Shopping',
    subCategory: 'Shopping',
    amount: 218.46,
    date: '2026-10-16',
    notes: 'MagSafe charger & travel accessories',
    iconType: 'shopping',
    createdAt: 1792150000000,
  },
  {
    id: 'exp-oct-6',
    title: 'Chrysler 300 Insurance & Detail',
    category: 'Car',
    subCategory: 'Vehicle',
    amount: 398.99,
    date: '2026-10-15',
    notes: 'Monthly full-coverage auto policy & ceramic wash',
    iconType: 'car',
    createdAt: 1792060000000,
  },
  {
    id: 'exp-oct-7',
    title: 'ConEdison & Fiber Internet',
    category: 'Bills',
    subCategory: 'Bills',
    amount: 192.25,
    date: '2026-10-14',
    notes: 'Electric utility & gigabit home internet',
    iconType: 'bills',
    createdAt: 1791970000000,
  },
  {
    id: 'exp-oct-8',
    title: 'JFK Airport Parking & E-ZPass',
    category: 'Travel',
    subCategory: 'Transport',
    amount: 203.65,
    date: '2026-10-10',
    notes: 'Employee lot pass & Port Authority tolls',
    iconType: 'travel',
    createdAt: 1791630000000,
  },
  {
    id: 'exp-oct-9',
    title: 'Sweetgreen & Crew Dining',
    category: 'Food & Drinks',
    subCategory: 'Food & Drinks',
    amount: 250.00,
    date: '2026-10-08',
    notes: 'Terminal dining & coffee runs',
    iconType: 'food',
    createdAt: 1791460000000,
  },
  {
    id: 'exp-oct-10',
    title: 'Sunoco Premium Fuel',
    category: 'Car',
    subCategory: 'Vehicle',
    amount: 57.00,
    date: '2026-10-06',
    notes: 'Full tank 93 octane',
    iconType: 'gas',
    createdAt: 1791280000000,
  },
  {
    id: 'exp-oct-11',
    title: 'Nike Soho',
    category: 'Shopping',
    subCategory: 'Shopping',
    amount: 105.00,
    date: '2026-10-05',
    notes: 'Running shoes & gym apparel',
    iconType: 'shopping',
    createdAt: 1791200000000,
  },
  {
    id: 'exp-oct-12',
    title: 'T-Mobile Wireless',
    category: 'Bills',
    subCategory: 'Bills',
    amount: 85.00,
    date: '2026-10-03',
    notes: 'Unlimited 5G plan',
    iconType: 'bills',
    createdAt: 1791030000000,
  },
  {
    id: 'exp-oct-13',
    title: 'Equinox & Executive Grooming',
    category: 'Other',
    subCategory: 'General',
    amount: 323.46,
    date: '2026-10-02',
    notes: 'Monthly fitness membership & barber',
    iconType: 'other',
    createdAt: 1790940000000,
  },
  {
    id: 'exp-sep-1',
    title: 'September Living & Auto Expenses',
    category: 'Food & Drinks',
    subCategory: 'Monthly Total',
    amount: 2139.30,
    date: '2026-09-20',
    notes: 'Aggregated September expenses',
    createdAt: 1789900000000,
  },
  {
    id: 'exp-aug-1',
    title: 'August Living & Auto Expenses',
    category: 'Car',
    subCategory: 'Monthly Total',
    amount: 2790.00,
    date: '2026-08-20',
    notes: 'Aggregated August expenses',
    createdAt: 1787200000000,
  },
  {
    id: 'exp-jul-1',
    title: 'July Living & Auto Expenses',
    category: 'Shopping',
    subCategory: 'Monthly Total',
    amount: 1920.00,
    date: '2026-07-20',
    notes: 'Aggregated July expenses',
    createdAt: 1784500000000,
  },
  {
    id: 'exp-jun-1',
    title: 'June Living & Auto Expenses',
    category: 'Bills',
    subCategory: 'Monthly Total',
    amount: 1790.00,
    date: '2026-06-20',
    notes: 'Aggregated June expenses',
    createdAt: 1781900000000,
  },
  {
    id: 'exp-may-1',
    title: 'May Living & Auto Expenses',
    category: 'Travel',
    subCategory: 'Monthly Total',
    amount: 1380.00,
    date: '2026-05-20',
    notes: 'Aggregated May expenses',
    createdAt: 1779200000000,
  },
];

export const INITIAL_MILEAGE = [
  {
    id: 'mil-oct-1',
    purpose: 'Work',
    startLocation: 'JFK Airport (Terminal 5)',
    endLocation: 'DMG Official Studio / Manhattan',
    distance: 184,
    fuelUsed: 6.9,
    fuelCost: 26.90,
    date: '2026-10-25',
    vehicle: '2026 Chrysler 300S Black Edition',
    notes: 'Airport commuting & client production meetings',
    createdAt: 1792930000000,
  },
  {
    id: 'mil-oct-2',
    purpose: 'Work',
    startLocation: 'Queens Crew Base',
    endLocation: 'JFK Airport & LaGuardia',
    distance: 196,
    fuelUsed: 7.4,
    fuelCost: 28.85,
    date: '2026-10-19',
    vehicle: '2026 Chrysler 300S Black Edition',
    notes: 'Weekly shift commute rotations',
    createdAt: 1792410000000,
  },
  {
    id: 'mil-oct-3',
    purpose: 'Personal',
    startLocation: 'Brooklyn / Queens',
    endLocation: 'Long Island & Hamptons Run',
    distance: 192,
    fuelUsed: 7.3,
    fuelCost: 28.40,
    date: '2026-10-13',
    vehicle: '2026 Cadillac Escalade Sport',
    notes: 'Weekend highway cruise',
    createdAt: 1791890000000,
  },
  {
    id: 'mil-oct-4',
    purpose: 'Work',
    startLocation: 'JFK Airport',
    endLocation: 'Client Site / Newark Tech Hub',
    distance: 144,
    fuelUsed: 5.5,
    fuelCost: 21.45,
    date: '2026-10-07',
    vehicle: '2026 Chrysler 300S Black Edition',
    notes: 'DMG Official brand showcase transport',
    createdAt: 1791370000000,
  },
  {
    id: 'mil-oct-5',
    purpose: 'Personal',
    startLocation: 'Home Garage',
    endLocation: 'SoHo / Gym / Evening Errands',
    distance: 126,
    fuelUsed: 4.79,
    fuelCost: 18.71,
    date: '2026-10-03',
    vehicle: '2026 Chrysler 300S Black Edition',
    notes: 'City & parkway driving',
    createdAt: 1791020000000,
  },
  {
    id: 'mil-sep-1',
    purpose: 'Work',
    startLocation: 'JFK Airport',
    endLocation: 'Metro Commute Routes',
    distance: 468,
    fuelUsed: 18.1,
    fuelCost: 70.50,
    date: '2026-09-24',
    vehicle: '2026 Chrysler 300S Black Edition',
    notes: 'September work mileage log',
    createdAt: 1790250000000,
  },
  {
    id: 'mil-sep-2',
    purpose: 'Personal',
    startLocation: 'NYC Metro',
    endLocation: 'Upstate Hudson Valley',
    distance: 270,
    fuelUsed: 10.4,
    fuelCost: 40.50,
    date: '2026-09-12',
    vehicle: '2026 Cadillac Escalade Sport',
    notes: 'September personal mileage log',
    createdAt: 1789210000000,
  },
];

export const INITIAL_GOALS = [
  {
    id: 'goal-1',
    title: 'Save $10,000',
    type: 'savings',
    current: 4200,
    target: 10000,
    unit: '$',
    icon: 'piggy',
    color: '#22c55e',
    notes: 'Emergency & investment reserve target',
  },
  {
    id: 'goal-2',
    title: 'Reduce Monthly Expenses',
    type: 'expense_cap',
    current: 2310,
    target: 2000,
    unit: '$',
    icon: 'dollar-alert',
    color: '#ef4444',
    notes: 'Keep monthly burn rate under $2,000',
  },
  {
    id: 'goal-3',
    title: 'Drive Less (Personal Miles)',
    type: 'mileage_cap',
    current: 318,
    target: 500,
    unit: 'mi',
    icon: 'speedometer',
    color: '#22c55e',
    notes: 'Keep personal leisure driving under 500 mi/month',
  },
  {
    id: 'goal-4',
    title: 'Vacation Fund',
    type: 'savings',
    current: 1150,
    target: 3000,
    unit: '$',
    icon: 'luggage',
    color: '#22c55e',
    notes: '2026 international trip fund',
  },
];

export function buildDefaultSettingsForUser(user) {
  const isDemo = Boolean(user?.isDemo || user?.uid === DEMO_USER_UID);
  return {
    uid: user?.uid || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    userName:
      user?.userName ||
      `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
      'TRACCR User',
    email: user?.email || '',
    phone: user?.phone || '',
    userRole: user?.userRole || (isDemo ? 'DMG Official • Founder' : 'TRACCR Member'),
    photoURL: user?.photoURL || '',
    vehicleName: isDemo ? '2026 Chrysler 300S Black Edition' : '',
    unitSystem: 'imperial',
    darkMode: false,
    selectedMonth: getCurrentYearMonth(),
  };
}

function safeGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('LocalStorage read error:', err);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage write error:', err);
  }
}

export function loadAuthSession() {
  return safeGet(GLOBAL_KEYS.AUTH_USER, null);
}

/**
 * Loads data for a specific user account.
 * - Demo user (`usr-dmg-official-demo`) gets the pre-populated DMG Official showcase data on first load.
 * - Every newly created / regular user account starts 100% empty (zero income, zero expenses, zero mileage, zero goals, zero vehicles).
 */
export function loadUserAccountData(user) {
  if (!user || !user.uid) {
    return {
      incomes: [],
      expenses: [],
      mileageLogs: [],
      goals: [],
      vehicles: [],
      settings: buildDefaultSettingsForUser(null),
    };
  }

  const uid = user.uid;
  const isDemo = Boolean(user.isDemo || uid === DEMO_USER_UID);

  const storedIncomes = safeGet(getUserKey(uid, 'incomes'), null);
  const storedExpenses = safeGet(getUserKey(uid, 'expenses'), null);
  const storedMileage = safeGet(getUserKey(uid, 'mileage'), null);
  const storedGoals = safeGet(getUserKey(uid, 'goals'), null);
  const storedVehicles = safeGet(getUserKey(uid, 'vehicles'), null);
  const storedSettings = safeGet(getUserKey(uid, 'settings'), null);

  const incomes = storedIncomes !== null ? storedIncomes : isDemo ? INITIAL_INCOMES : [];
  const expenses = storedExpenses !== null ? storedExpenses : isDemo ? INITIAL_EXPENSES : [];
  const mileageLogs = storedMileage !== null ? storedMileage : isDemo ? INITIAL_MILEAGE : [];
  const goals = storedGoals !== null ? storedGoals : isDemo ? INITIAL_GOALS : [];
  const vehicles = storedVehicles !== null ? storedVehicles : isDemo ? INITIAL_VEHICLES : [];

  const defaultSettings = buildDefaultSettingsForUser(user);
  const settings = {
    ...defaultSettings,
    ...(storedSettings || {}),
    uid: user.uid,
    firstName: user.firstName ?? storedSettings?.firstName ?? defaultSettings.firstName,
    lastName: user.lastName ?? storedSettings?.lastName ?? defaultSettings.lastName,
    userName: user.userName || storedSettings?.userName || defaultSettings.userName,
    email: user.email || storedSettings?.email || defaultSettings.email,
    phone: user.phone || storedSettings?.phone || defaultSettings.phone,
    photoURL: user.photoURL !== undefined ? user.photoURL : storedSettings?.photoURL || '',
  };

  return { incomes, expenses, mileageLogs, goals, vehicles, settings };
}

export function saveIncomes(uid, incomes) {
  if (!uid) return;
  safeSet(getUserKey(uid, 'incomes'), incomes);
}

export function saveExpenses(uid, expenses) {
  if (!uid) return;
  safeSet(getUserKey(uid, 'expenses'), expenses);
}

export function saveMileageLogs(uid, mileageLogs) {
  if (!uid) return;
  safeSet(getUserKey(uid, 'mileage'), mileageLogs);
}

export function saveGoals(uid, goals) {
  if (!uid) return;
  safeSet(getUserKey(uid, 'goals'), goals);
}

export function saveVehicles(uid, vehicles) {
  if (!uid) return;
  safeSet(getUserKey(uid, 'vehicles'), vehicles);
}

export function saveSettings(uid, settings) {
  if (!uid) return;
  safeSet(getUserKey(uid, 'settings'), settings);
}

/**
 * Completely wipes all data for the specified user account so they start from zero / blank.
 */
export function wipeUserAccountData(user) {
  const uid = user?.uid;
  if (!uid) return null;
  safeSet(getUserKey(uid, 'incomes'), []);
  safeSet(getUserKey(uid, 'expenses'), []);
  safeSet(getUserKey(uid, 'mileage'), []);
  safeSet(getUserKey(uid, 'goals'), []);
  safeSet(getUserKey(uid, 'vehicles'), []);
  const freshSettings = {
    ...buildDefaultSettingsForUser(user),
    selectedMonth: getCurrentYearMonth(),
  };
  safeSet(getUserKey(uid, 'settings'), freshSettings);
  return {
    incomes: [],
    expenses: [],
    mileageLogs: [],
    goals: [],
    vehicles: [],
    settings: freshSettings,
  };
}

/**
 * Loads/Restores the October 2026 DMG Official Showcase dataset into the current account.
 */
export function resetToDemoData(user) {
  const uid = user?.uid;
  if (!uid) return null;
  safeSet(getUserKey(uid, 'incomes'), INITIAL_INCOMES);
  safeSet(getUserKey(uid, 'expenses'), INITIAL_EXPENSES);
  safeSet(getUserKey(uid, 'mileage'), INITIAL_MILEAGE);
  safeSet(getUserKey(uid, 'goals'), INITIAL_GOALS);
  safeSet(getUserKey(uid, 'vehicles'), INITIAL_VEHICLES);
  const demoSettings = {
    ...buildDefaultSettingsForUser(user),
    selectedMonth: '2026-10',
  };
  safeSet(getUserKey(uid, 'settings'), demoSettings);
  return {
    incomes: INITIAL_INCOMES,
    expenses: INITIAL_EXPENSES,
    mileageLogs: INITIAL_MILEAGE,
    goals: INITIAL_GOALS,
    vehicles: INITIAL_VEHICLES,
    settings: demoSettings,
  };
}

export function saveAuthUser(user) {
  if (!user) {
    window.localStorage.removeItem(GLOBAL_KEYS.AUTH_USER);
  } else {
    safeSet(GLOBAL_KEYS.AUTH_USER, user);
  }
}

export function getRegisteredUsers() {
  const existing = safeGet(GLOBAL_KEYS.USERS_DB, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  const seedUsers = [{ ...DEFAULT_USER_PROFILE }];
  safeSet(GLOBAL_KEYS.USERS_DB, seedUsers);
  return seedUsers;
}

export function saveRegisteredUsers(users) {
  safeSet(GLOBAL_KEYS.USERS_DB, users);
}

export function getFirebaseConfig() {
  return safeGet(GLOBAL_KEYS.FIREBASE_CONFIG, {
    apiKey: '',
    authDomain: '',
    projectId: '',
  });
}

export function saveFirebaseConfig(cfg) {
  safeSet(GLOBAL_KEYS.FIREBASE_CONFIG, cfg);
}

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB max

/**
 * Reads an image File object, validates MIME type & size, and scales it down
 * to a crisp 256x256 JPEG DataURL so it stores cleanly in LocalStorage / Firebase User Profile.
 */
export function processProfileImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
      return reject(new Error('Please upload a valid PNG, JPG, WEBP, or GIF image.'));
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return reject(new Error('Image size must be under 5 MB.'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Exports rows of data to a downloadable CSV file with CSV Formula Injection protection.
 */
export function exportToCSV(filename, headers, rows) {
  const escapeCell = (val) => {
    let str = String(val ?? '');
    // Prevent CSV Formula Injection in spreadsheet apps while allowing negative numbers
    if (/^[=+\t\r@]/.test(str) || (/^-/.test(str) && isNaN(Number(str)))) {
      str = `'${str}`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
