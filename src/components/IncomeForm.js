import React, { useState } from 'react';
import { INCOME_SOURCES, getTodayISO } from '../utils/calculate.js';

/**
 * IncomeForm Component (Auto-advances default date to today)
 */
export default function IncomeForm({
  onAddIncome,
  onSwitchToExpense,
  onClose,
  defaultDate,
  isModal = false,
}) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('JetBlue Payroll');
  const [customTitle, setCustomTitle] = useState('');
  const [date, setDate] = useState(() => defaultDate || getTodayISO());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid income amount greater than $0.');
      return;
    }

    onAddIncome({
      id: `inc-${Date.now()}`,
      title: customTitle.trim() || source,
      source,
      category: 'Income',
      amount: Math.round(numAmount * 100) / 100,
      date: date || getTodayISO(),
      notes: notes.trim(),
      createdAt: Date.now(),
    });

    setAmount('');
    setCustomTitle('');
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
        <h3 className="dmg-form-title">Add Income</h3>
        <span className="dmg-form-spacer" />
      </div>

      {onSwitchToExpense && (
        <div className="dmg-toggle-Segmented">
          <button type="button" className="dmg-seg-btn" onClick={onSwitchToExpense}>
            Expense
          </button>
          <button type="button" className="dmg-seg-btn active">
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
          <label>Source</label>
          <div className="dmg-select-wrap">
            <select
              className="dmg-select"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {INCOME_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dmg-field">
          <label>Custom Label (optional)</label>
          <input
            type="text"
            className="dmg-input"
            placeholder="e.g., JetBlue Payroll, Brand Deal..."
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
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
          Save Income
        </button>
      </form>
    </div>
  );
}
