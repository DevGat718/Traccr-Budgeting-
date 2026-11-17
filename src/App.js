import React, { useState, useEffect, useMemo, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import Dashboard from './pages/Dashboard.js';
import AuthScreen from './components/AuthScreen.js';
import {
  loadAuthSession,
  loadUserAccountData,
  saveIncomes,
  saveExpenses,
  saveMileageLogs,
  saveGoals,
  saveVehicles,
  saveSettings,
  buildDefaultSettingsForUser,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_MILEAGE,
  INITIAL_GOALS,
  INITIAL_VEHICLES,
} from './utils/dataStorage.js';
import { auth } from './utils/firebaseClient.js';
import {
  loadAccountForFirebaseUser,
  isRegistrationInProgress,
  signOutTraccrUser,
  explainFirebaseError,
} from './utils/firebaseAuth.js';
import { saveCloudAccount } from './utils/cloudSync.js';
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  calculateMonthlySeries,
  getCombinedTransactions,
  filterRecords,
  getCurrentYearMonth,
} from './utils/calculate.js';
import './styles/App.css';

function settingsFromCloud(user, account) {
  return {
    ...buildDefaultSettingsForUser(user),
    ...(account?.settings || {}),
    uid: user.uid,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    email: user.email,
    phone: user.phone,
    photoURL: user.photoURL,
  };
}

export default function App() {
  const demoSession = useMemo(() => {
    const s = loadAuthSession();
    return s && s.isDemo ? s : null;
  }, []);

  const [authUser, setAuthUser] = useState(demoSession);
  const [booting, setBooting] = useState(!demoSession && Boolean(auth));
  const [cloudReady, setCloudReady] = useState(false);
  const [syncState, setSyncState] = useState({ status: 'idle', error: null });

  const initial = useMemo(() => loadUserAccountData(demoSession), [demoSession]);
  const [incomes, setIncomes] = useState(initial.incomes);
  const [expenses, setExpenses] = useState(initial.expenses);
  const [mileageLogs, setMileageLogs] = useState(initial.mileageLogs);
  const [goals, setGoals] = useState(initial.goals);
  const [vehicles, setVehicles] = useState(initial.vehicles);
  const [settings, setSettings] = useState(initial.settings);

  const handledUidRef = useRef(null);

  const applyCloudAccount = (user, account) => {
    handledUidRef.current = user.uid;
    setAuthUser(user);
    setIncomes(account.incomes || []);
    setExpenses(account.expenses || []);
    setMileageLogs(account.mileageLogs || []);
    setGoals(account.goals || []);
    setVehicles(account.vehicles || []);
    setSettings(settingsFromCloud(user, account));
    setCloudReady(true);
  };

  const resetToSignedOut = () => {
    handledUidRef.current = null;
    setCloudReady(false);
    setAuthUser(null);
    setIncomes([]);
    setExpenses([]);
    setMileageLogs([]);
    setGoals([]);
    setVehicles([]);
    setSettings(buildDefaultSettingsForUser(null));
  };

  // Restore the Firebase session on page load (works on every device)
  useEffect(() => {
    if (!auth || demoSession) {
      setBooting(false);
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (isRegistrationInProgress()) return;
      if (!fbUser) {
        setBooting(false);
        return;
      }
      if (handledUidRef.current === fbUser.uid) {
        setBooting(false);
        return;
      }
      try {
        const { user, account } = await loadAccountForFirebaseUser(fbUser);
        applyCloudAccount(user, account);
      } catch (err) {
        setSyncState({ status: 'error', error: explainFirebaseError(err) });
      } finally {
        setBooting(false);
      }
    });
    return unsub;
  }, [demoSession]);

  // Demo account: persist locally only
  const isDemo = Boolean(authUser?.isDemo);
  const currentUid = authUser?.uid;
  useEffect(() => {
    if (!isDemo || !currentUid) return;
    saveIncomes(currentUid, incomes);
    saveExpenses(currentUid, expenses);
    saveMileageLogs(currentUid, mileageLogs);
    saveGoals(currentUid, goals);
    saveVehicles(currentUid, vehicles);
    saveSettings(currentUid, settings);
  }, [isDemo, currentUid, incomes, expenses, mileageLogs, goals, vehicles, settings]);

  // Real accounts: debounce-save every change to Firestore
  useEffect(() => {
    if (isDemo || !currentUid || !cloudReady) return undefined;
    setSyncState((s) => ({ ...s, status: 'saving' }));
    const t = setTimeout(async () => {
      try {
        await saveCloudAccount(currentUid, auth?.currentUser?.email || authUser.email, {
          profile: {
            firstName: settings.firstName || '',
            lastName: settings.lastName || '',
            userName: settings.userName || '',
            email: settings.email || authUser.email || '',
            phone: settings.phone || '',
            photoURL: settings.photoURL || '',
            userRole: authUser.userRole || 'TRACCR Member • DMG Official',
          },
          incomes,
          expenses,
          mileageLogs,
          goals,
          vehicles,
          settings,
        });
        setSyncState({ status: 'saved', error: null, at: new Date().toISOString() });
      } catch (err) {
        setSyncState({ status: 'error', error: explainFirebaseError(err) });
      }
    }, 700);
    return () => clearTimeout(t);
  }, [isDemo, currentUid, cloudReady, incomes, expenses, mileageLogs, goals, vehicles, settings]);

  const selectedMonth = settings.selectedMonth || getCurrentYearMonth();

  const summary = useMemo(
    () => calculateFinancialSummary(incomes, expenses, mileageLogs, selectedMonth),
    [incomes, expenses, mileageLogs, selectedMonth]
  );
  const monthlySeries = useMemo(
    () => calculateMonthlySeries(incomes, expenses, mileageLogs, 6, selectedMonth),
    [incomes, expenses, mileageLogs, selectedMonth]
  );
  const categoryBreakdown = useMemo(() => {
    const filteredExp = filterRecords(expenses, { month: selectedMonth });
    return calculateCategoryBreakdown(filteredExp);
  }, [expenses, selectedMonth]);
  const combinedTransactions = useMemo(
    () => getCombinedTransactions(incomes, expenses, { month: selectedMonth }),
    [incomes, expenses, selectedMonth]
  );

  /** Called by AuthScreen after login / sign-up / demo. */
  const handleAuthenticated = (result) => {
    if (result && result.account) {
      applyCloudAccount(result.user, result.account);
      return;
    }
    // Demo user
    const data = loadUserAccountData(result);
    handledUidRef.current = result.uid;
    setAuthUser(result);
    setIncomes(data.incomes);
    setExpenses(data.expenses);
    setMileageLogs(data.mileageLogs);
    setGoals(data.goals);
    setVehicles(data.vehicles);
    setSettings(data.settings);
  };

  const handleLogout = async () => {
    await signOutTraccrUser();
    resetToSignedOut();
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    if (authUser) {
      setAuthUser({
        ...authUser,
        firstName: newSettings.firstName,
        lastName: newSettings.lastName,
        userName: newSettings.userName,
        phone: newSettings.phone,
        photoURL: newSettings.photoURL,
      });
    }
  };

  const handleAddIncome = (n) => setIncomes((p) => [n, ...p]);
  const handleDeleteIncome = (id) => setIncomes((p) => p.filter((i) => i.id !== id));
  const handleAddExpense = (n) => setExpenses((p) => [n, ...p]);
  const handleDeleteExpense = (id) => setExpenses((p) => p.filter((i) => i.id !== id));
  const handleAddMileage = (n) => setMileageLogs((p) => [n, ...p]);
  const handleDeleteMileage = (id) => setMileageLogs((p) => p.filter((i) => i.id !== id));
  const handleAddGoal = (g) => setGoals((p) => [...p, g]);
  const handleUpdateGoal = (id, patch) =>
    setGoals((p) => p.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  const handleDeleteGoal = (id) => setGoals((p) => p.filter((g) => g.id !== id));
  const handleAddVehicle = (v) => setVehicles((p) => [...p, v]);
  const handleSetPrimaryVehicle = (vehId) =>
    setVehicles((p) => p.map((v) => ({ ...v, isPrimary: v.id === vehId })));
  const handleDeleteVehicle = (vehId) => setVehicles((p) => p.filter((v) => v.id !== vehId));

  const handleWipeAllData = () => {
    setIncomes([]);
    setExpenses([]);
    setMileageLogs([]);
    setGoals([]);
    setVehicles([]);
  };

  const handleResetDemoData = () => {
    setIncomes(INITIAL_INCOMES);
    setExpenses(INITIAL_EXPENSES);
    setMileageLogs(INITIAL_MILEAGE);
    setGoals(INITIAL_GOALS);
    setVehicles(INITIAL_VEHICLES);
    setSettings((prev) => ({ ...prev, selectedMonth: '2026-10' }));
  };

  if (booting) {
    return (
      <div className="dmg-auth-page dmg-boot-screen">
        <div className="dmg-boot-text">Loading your TRACCR account…</div>
      </div>
    );
  }

  if (!authUser) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <Dashboard
      authUser={authUser}
      syncState={syncState}
      incomes={incomes}
      expenses={expenses}
      mileageLogs={mileageLogs}
      goals={goals}
      vehicles={vehicles}
      settings={settings}
      summary={summary}
      monthlySeries={monthlySeries}
      categoryBreakdown={categoryBreakdown}
      combinedTransactions={combinedTransactions}
      onAddIncome={handleAddIncome}
      onDeleteIncome={handleDeleteIncome}
      onAddExpense={handleAddExpense}
      onDeleteExpense={handleDeleteExpense}
      onAddMileage={handleAddMileage}
      onDeleteMileage={handleDeleteMileage}
      onAddGoal={handleAddGoal}
      onUpdateGoal={handleUpdateGoal}
      onDeleteGoal={handleDeleteGoal}
      onAddVehicle={handleAddVehicle}
      onSetPrimaryVehicle={handleSetPrimaryVehicle}
      onDeleteVehicle={handleDeleteVehicle}
      onUpdateSettings={handleUpdateSettings}
      onWipeAllData={handleWipeAllData}
      onResetDemoData={handleResetDemoData}
      onLogout={handleLogout}
    />
  );
}
