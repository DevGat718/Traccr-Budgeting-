/**
 * TRACCR by DMG Official
 * Fuel Efficiency & Car Mileage Calculation Utilities
 */

const MPG_TO_KML = 0.425144;
const MILES_TO_KM = 1.60934;
const GALLONS_TO_LITERS = 3.78541;
const IRS_MILEAGE_RATE = 0.67; // $0.67 per business mile

/**
 * Calculates fuel efficiency for a single trip or fill-up.
 * @param {number} distance - Distance traveled (miles or km)
 * @param {number} fuelUsed - Fuel consumed (gallons or liters)
 * @param {string} unitSystem - 'imperial' (MPG) or 'metric' (km/L)
 * @returns {number} Calculated efficiency rounded to 1 decimal place
 */
export function calculateTripEfficiency(distance, fuelUsed, unitSystem = 'imperial') {
  const dist = parseFloat(distance) || 0;
  const fuel = parseFloat(fuelUsed) || 0;
  if (dist <= 0 || fuel <= 0) return 0;
  const raw = dist / fuel;
  return Math.round(raw * 10) / 10;
}

/**
 * Converts efficiency between MPG and km/L.
 */
export function formatEfficiency(mpgValue, unitSystem = 'imperial') {
  const val = parseFloat(mpgValue) || 0;
  if (unitSystem === 'metric') {
    return `${(val * MPG_TO_KML).toFixed(1)} km/L`;
  }
  return `${val.toFixed(1)} mpg`;
}

/**
 * Converts distance between miles and kilometers for display.
 */
export function formatDistance(milesValue, unitSystem = 'imperial') {
  const val = parseFloat(milesValue) || 0;
  if (unitSystem === 'metric') {
    return `${Math.round(val * MILES_TO_KM).toLocaleString()} km`;
  }
  return `${Math.round(val).toLocaleString()} mi`;
}

/**
 * Computes comprehensive mileage & fuel statistics across a list of mileage logs.
 * @param {Array} logs - Array of mileage log objects
 * @returns {Object} Aggregated mileage stats
 */
export function calculateMileageSummary(logs = []) {
  if (!logs || logs.length === 0) {
    return {
      totalMiles: 0,
      workMiles: 0,
      personalMiles: 0,
      totalFuelUsed: 0,
      totalFuelCost: 0,
      avgEfficiencyMpg: 0,
      costPerMile: 0,
      estimatedTaxDeduction: 0,
      tripCount: 0,
    };
  }

  let totalMiles = 0;
  let workMiles = 0;
  let personalMiles = 0;
  let totalFuelUsed = 0;
  let totalFuelCost = 0;

  logs.forEach((log) => {
    const dist = parseFloat(log.distance) || 0;
    const fuel = parseFloat(log.fuelUsed) || 0;
    const cost = parseFloat(log.fuelCost) || 0;
    const type = (log.purpose || log.type || 'Work').toLowerCase();

    totalMiles += dist;
    if (type === 'work') {
      workMiles += dist;
    } else {
      personalMiles += dist;
    }
    totalFuelUsed += fuel;
    totalFuelCost += cost;
  });

  const avgEfficiencyMpg =
    totalFuelUsed > 0 ? Math.round((totalMiles / totalFuelUsed) * 10) / 10 : 0;
  const costPerMile =
    totalMiles > 0 ? Math.round((totalFuelCost / totalMiles) * 100) / 100 : 0;
  const estimatedTaxDeduction = Math.round(workMiles * IRS_MILEAGE_RATE * 100) / 100;

  return {
    totalMiles: Math.round(totalMiles * 10) / 10,
    workMiles: Math.round(workMiles * 10) / 10,
    personalMiles: Math.round(personalMiles * 10) / 10,
    totalFuelUsed: Math.round(totalFuelUsed * 100) / 100,
    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
    avgEfficiencyMpg,
    costPerMile,
    estimatedTaxDeduction,
    tripCount: logs.length,
  };
}
