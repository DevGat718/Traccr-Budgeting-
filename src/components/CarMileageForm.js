import React, { useState } from 'react';
import { calculateTripEfficiency } from '../utils/fuelEfficiency.js';
import { getTodayISO } from '../utils/calculate.js';

/**
 * CarMileageForm Component (Auto-advances date & supports empty garage or multi-vehicle)
 */
export default function CarMileageForm({
  onAddMileage,
  vehicles = [],
  onAddVehicle,
  onClose,
  unitSystem = 'imperial',
  defaultDate,
  isModal = false,
}) {
  const primaryVehicleName =
    vehicles.find((v) => v.isPrimary)?.name ||
    vehicles[0]?.name ||
    '';

  const [purpose, setPurpose] = useState('Work');
  const [selectedVehicle, setSelectedVehicle] = useState(primaryVehicleName);
  const [showQuickAddVehicle, setShowQuickAddVehicle] = useState(vehicles.length === 0);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [fuelUsed, setFuelUsed] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [date, setDate] = useState(() => defaultDate || getTodayISO());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const distUnit = unitSystem === 'metric' ? 'km' : 'mi';
  const fuelUnit = unitSystem === 'metric' ? 'L' : 'gal';
  const effUnit = unitSystem === 'metric' ? 'km/L' : 'MPG';

  const effectiveFuel =
    parseFloat(fuelUsed) > 0
      ? parseFloat(fuelUsed)
      : parseFloat(distance) > 0
      ? Math.round((parseFloat(distance) / 26.4) * 100) / 100
      : 0;

  const liveEfficiency = calculateTripEfficiency(distance, effectiveFuel, unitSystem);

  const handleQuickCreateVehicle = () => {
    const clean = newVehicleName.trim();
    if (!clean) return;
    if (onAddVehicle) {
      onAddVehicle({
        id: `veh-${Date.now()}`,
        name: clean,
        type: 'Custom Vehicle',
        year: String(new Date().getFullYear()),
        isPrimary: vehicles.length === 0,
      });
    }
    setSelectedVehicle(clean);
    setNewVehicleName('');
    setShowQuickAddVehicle(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numDist = parseFloat(distance);
    if (!numDist || numDist <= 0) {
      setError(`Please enter a valid distance in ${distUnit}.`);
      return;
    }

    let chosenVehicle = selectedVehicle || primaryVehicleName;
    if (!chosenVehicle && newVehicleName.trim()) {
      chosenVehicle = newVehicleName.trim();
      if (onAddVehicle) {
        onAddVehicle({
          id: `veh-${Date.now()}`,
          name: chosenVehicle,
          type: 'Custom Vehicle',
          year: String(new Date().getFullYear()),
          isPrimary: true,
        });
      }
    }

    const finalFuel =
      parseFloat(fuelUsed) > 0
        ? parseFloat(fuelUsed)
        : Math.round((numDist / 26.4) * 100) / 100;

    const finalCost =
      parseFloat(fuelCost) > 0
        ? parseFloat(fuelCost)
        : Math.round(finalFuel * 3.89 * 100) / 100;

    onAddMileage({
      id: `mil-${Date.now()}`,
      purpose,
      startLocation: startLocation.trim() || 'Start Location',
      endLocation: endLocation.trim() || 'Destination',
      distance: Math.round(numDist * 10) / 10,
      fuelUsed: Math.round(finalFuel * 100) / 100,
      fuelCost: Math.round(finalCost * 100) / 100,
      efficiency: calculateTripEfficiency(numDist, finalFuel, unitSystem),
      date: date || getTodayISO(),
      vehicle: chosenVehicle || 'My Vehicle',
      notes: notes.trim(),
      createdAt: Date.now(),
    });

    setDistance('');
    setFuelUsed('');
    setFuelCost('');
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
        <h3 className="dmg-form-title">Log Mileage</h3>
        <span className="dmg-form-spacer" />
      </div>

      <div className="dmg-toggle-Segmented">
        <button
          type="button"
          className={`dmg-seg-btn ${purpose === 'Work' ? 'active' : ''}`}
          onClick={() => setPurpose('Work')}
        >
          Work
        </button>
        <button
          type="button"
          className={`dmg-seg-btn ${purpose === 'Personal' ? 'active' : ''}`}
          onClick={() => setPurpose('Personal')}
        >
          Personal
        </button>
      </div>

      {error && <div className="dmg-form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="dmg-form-body">
        {/* Multi-Vehicle Selector */}
        <div className="dmg-field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Vehicle</label>
            {vehicles.length > 0 && (
              <button
                type="button"
                className="dmg-inline-add-link"
                onClick={() => setShowQuickAddVehicle(!showQuickAddVehicle)}
              >
                {showQuickAddVehicle ? 'Select Existing' : '+ Add Vehicle'}
              </button>
            )}
          </div>

          {showQuickAddVehicle || vehicles.length === 0 ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="dmg-input"
                placeholder="e.g., 2026 Chrysler 300S, BMW M5..."
                value={newVehicleName}
                onChange={(e) => setNewVehicleName(e.target.value)}
              />
              {newVehicleName.trim() && (
                <button
                  type="button"
                  className="dmg-mini-save-veh"
                  onClick={handleQuickCreateVehicle}
                >
                  Save
                </button>
              )}
            </div>
          ) : (
            <select
              className="dmg-select"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name} {v.isPrimary ? '(Primary)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="dmg-field">
          <label>Start Location</label>
          <input
            type="text"
            className="dmg-input"
            placeholder="e.g., JFK Airport"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            required
          />
        </div>

        <div className="dmg-field">
          <label>End Location</label>
          <input
            type="text"
            className="dmg-input"
            placeholder="e.g., Client Site / Location"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            required
          />
        </div>

        <div className="dmg-field-row">
          <div className="dmg-field">
            <label>Mileage ({distUnit})</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="dmg-input"
              placeholder={`0.0 ${distUnit}`}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
            />
          </div>

          <div className="dmg-field">
            <label>Fuel Used ({fuelUnit})</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="dmg-input"
              placeholder={effectiveFuel ? `${effectiveFuel} (est)` : `0.0 ${fuelUnit}`}
              value={fuelUsed}
              onChange={(e) => setFuelUsed(e.target.value)}
            />
          </div>
        </div>

        <div className="dmg-field-row">
          <div className="dmg-field">
            <label>Fuel Cost ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="dmg-input"
              placeholder="$ 0.00"
              value={fuelCost}
              onChange={(e) => setFuelCost(e.target.value)}
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
        </div>

        <div className="dmg-efficiency-preview">
          <span>Calculated Fuel Efficiency:</span>
          <strong>
            {liveEfficiency > 0 ? `${liveEfficiency} ${effUnit}` : `0.0 ${effUnit}`}
          </strong>
        </div>

        <button type="submit" className="dmg-submit-green">
          Save Mileage
        </button>
      </form>
    </div>
  );
}
