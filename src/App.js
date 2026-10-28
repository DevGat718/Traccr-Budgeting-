import React, { useState, useEffect, useMemo } from 'react';
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
  saveAuthUser,
  wipeUserAccountData,
  resetToDemoData,
} from './utils/dataStorage.js';
import { updateAuthenticatedUserProfile } from './utils/firebaseAuth.js';
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  calculateMonthlySeries,
  getCombinedTransactions,
  filterRecords,
  getCurrentYearMonth,
} from './utils/calculate.js';
import './styles/App.css';

export default function App() {
  const initialUser = useMemo(() => loadAuthSession(), []);
  const initialAccount = useMemo(
    () => loadUserAccountData(initialUser),
    [initialUser]
  );

  const [authUser, setAuthUser] = useState(initialUser);
  const [incomes, setIncomes] = useState(initialAccount.incomes);
  const [expenses, setExpenses] = useState(initialAccount.expenses);
  const [mileageLogs, setMileageLogs] = useState(initialAccount.mileageLogs);
  const [goals, setGoals] = useState(initialAccount.goals);
  const [vehicles, setVehicles] = useState(initialAccount.vehicles);
  const [settings, setSettings] = useState(initialAccount.settings);

  const currentUid = authUser?.uid;

  useEffect(() => {
    if (currentUid) saveIncomes(currentUid, incomes);
  }, [currentUid, incomes]);

  useEffect(() => {
    if (currentUid) saveExpenses(currentUid, expenses);
  }, [currentUid, expenses]);

  useEffect(() => {
    if (currentUid) saveMileageLogs(currentUid, mileageLogs);
  }, [currentUid, mileageLogs]);

  useEffect(() => {
    if (currentUid) saveGoals(currentUid, goals);
  }, [currentUid, goals]);

  useEffect(() => {
    if (currentUid) saveVehicles(currentUid, vehicles);
  }, [currentUid, vehicles]);

  useEffect(() => {
    if (currentUid) saveSettings(currentUid, settings);
  }, [currentUid, settings]);

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

  const handleAuthenticated = (user) => {
    const accountData = loadUserAccountData(user);
    setAuthUser(user);
    setIncomes(accountData.incomes);
    setExpenses(accountData.expenses);
    setMileageLogs(accountData.mileageLogs);
    setGoals(accountData.goals);
    setVehicles(accountData.vehicles);
    setSettings(accountData.settings);
  };

  const handleLogout = () => {
    saveAuthUser(null);
    setAuthUser(null);
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    if (authUser) {
      const updatedUser = {
        ...authUser,
        firstName: newSettings.firstName,
        lastName: newSettings.lastName,
        userName: newSettings.userName,
        email: newSettings.email,
        phone: newSettings.phone,
        photoURL: newSettings.photoURL,
      };
      setAuthUser(updatedUser);
      updateAuthenticatedUserProfile(updatedUser);
    }
  };

  const handleAddIncome = (newInc) => {
    setIncomes((prev) => [newInc, ...prev]);
  };

  const handleDeleteIncome = (id) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddExpense = (newExp) => {
    setExpenses((prev) => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddMileage = (newLog) => {
    setMileageLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteMileage = (id) => {
    setMileageLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddGoal = (newGoal) => {
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateGoal = (id, patch) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  };

  const handleDeleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleAddVehicle = (newVeh) => {
    setVehicles((prev) => [...prev, newVeh]);
  };

  const handleSetPrimaryVehicle = (vehId) => {
    setVehicles((prev) =>
      prev.map((v) => ({
        ...v,
        isPrimary: v.id === vehId,
      }))
    );
  };

  const handleDeleteVehicle = (vehId) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehId));
  };

  const handleWipeAllData = () => {
    if (!authUser) return;
    const wiped = wipeUserAccountData(authUser);
    if (wiped) {
      setIncomes(wiped.incomes);
      setExpenses(wiped.expenses);
      setMileageLogs(wiped.mileageLogs);
      setGoals(wiped.goals);
      setVehicles(wiped.vehicles);
    }
  };

  const handleResetDemoData = () => {
    if (!authUser) return;
    const fresh = resetToDemoData(authUser);
    if (fresh) {
      setIncomes(fresh.incomes);
      setExpenses(fresh.expenses);
      setMileageLogs(fresh.mileageLogs);
      setGoals(fresh.goals);
      setVehicles(fresh.vehicles);
      setSettings((prev) => ({
        ...fresh.settings,
        photoURL: prev.photoURL,
        userName: prev.userName,
        firstName: prev.firstName,
        lastName: prev.lastName,
        email: prev.email,
        phone: prev.phone,
      }));
    }
  };

  if (!authUser) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <Dashboard
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
