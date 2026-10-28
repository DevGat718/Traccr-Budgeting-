import React, { useState } from 'react';
import { EXPENSE_CATEGORIES, getTodayISO } from '../utils/calculate.js';

/**
 * ExpenseForm Component (Auto-advances default date to today)
 */
export default function ExpenseForm({
  onAddExpense,
  onSwitchToIncome,
  onClose,
  defaultDate,
  isModal = false,
}) {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food & Drinks');
  const [date, setDate] = useState(() => defaultDate || getTodayISO());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid expense amount greater than $0.');
      return;
    }

    const defaultTitles = {
      'Food & Drinks': 'Chipotle / Dining',
      Car: 'Shell Gas',
      Shopping: 'Retail Purchase',
      Bills: 'Monthly Utility Bill',
      Travel: 'Uber / Transit',
      Groceries: 'Whole Foods Market',
      Rent: 'Monthly Rent',
      Entertainment: 'Entertainment',
      Other: 'General Expense',
    };

    onAddExpense({
      id: `exp-${Date.now()}`,
      title: title.trim() || defaultTitles[category] || category,
      category,
      subCategory: category === 'Car' ? 'Vehicle' : category === 'Travel' ? 'Transport' : category,
      amount: Math.round(numAmount * 100) / 100,
      date: date || getTodayISO(),
      notes: notes.trim(),
      createdAt: Date.now(),
    });

    setAmount('');
    setTitle('');
    setNotes('');
    setError('');
    if (onClose) onClose();
  };

  return (
    <div className={`dmg-form-card ${isModal ? 'dmg-form-modal' : ''}`}>
      <div className="dmg-form-header">
        {onClose && (
          <button type="button" className="dmg-back-btn" onClick={onClose} aria-label="Close">
            ‹
          </button>
        )}
        <h3 className="dmg-form-title">Add Expense</h3>
        <span className="dmg-form-spacer" />
      </div>

      {onSwitchToIncome && (
        <div className="dmg-toggle-Segmented">
          <button type="button" className="dmg-seg-btn active">
            Expense
          </button>
          <button type="button" className="dmg-seg-btn" onClick={onSwitchToIncome}>
            Income
          </button>
        </div>
      )}

      {error && <div className="dmg-form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="dmg-form-body">
        <div className="dmg-field">
          <label>Amount</label>
          <div className="dmg-amount-input-wrap">
            <span className="dmg-currency-prefix">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="dmg-field">
          <label>Merchant / Description</label>
          <input
            type="text"
            className="dmg-input"
            placeholder="e.g., Shell Gas, Chipotle, Uber..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="dmg-field">
          <label>Category</label>
          <div className="dmg-select-wrap">
            <select
              className="dmg-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dmg-field">
          <label>Date</label>
          <input
            type="date"
            className="dmg-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="dmg-field">
          <label>Notes (optional)</label>
          <textarea
            className="dmg-textarea"
            rows={2}
            placeholder="Add a note..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" className="dmg-submit-green">
          Save Expense
        </button>
      </form>
    </div>
  );
}
