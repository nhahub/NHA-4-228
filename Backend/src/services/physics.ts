import { TuningRequest, TuningResponse, PerformanceStats } from '../types';

export function calculatePerformance(req: TuningRequest): TuningResponse {
  const { weight, horsepower, torque, drivetrain, modifications } = req;

  // 1. Calculate stock performance
  const stockStats = calculateBaseStats(weight, horsepower, torque, drivetrain);

  // 2. Apply modifications to core specs
  let modHP = horsepower;
  let modTorque = torque;
  let modWeight = weight;

  const hasTurbo = modifications.includes('turbo');
  const hasEcu = modifications.includes('ecu');
  const hasExhaust = modifications.includes('exhaust');
  const hasIntake = modifications.includes('intake');

  // Multipliers for HP
  if (hasTurbo) modHP *= 1.35; // +35% for Turbo
  if (hasEcu) modHP *= 1.15;   // +15% for ECU Remap
  if (hasExhaust) modHP *= 1.06; // +6% for Exhaust
  if (hasIntake) modHP *= 1.03;  // +3% for Intake

  // Multipliers for Torque
  if (hasTurbo) modTorque *= 1.30;
  if (hasEcu) modTorque *= 1.18;
  if (hasExhaust) modTorque *= 1.04;
  if (hasIntake) modTorque *= 1.02;

  // Weight additions/reductions
  if (hasTurbo) modWeight += 20;     // Intercooler and piping
  if (hasExhaust) modWeight -= 12;   // Lightweight titanium/stainless exhaust
  if (hasIntake) modWeight -= 2;      // Replaced heavy stock airbox

  // Round values
  modHP = Math.round(modHP * 10) / 10;
  modTorque = Math.round(modTorque * 10) / 10;
  modWeight = Math.round(modWeight * 10) / 10;

  // 3. Calculate modified stats based on new specs
  const modifiedStats = calculateBaseStats(modWeight, modHP, modTorque, drivetrain);

  // 4. Adjust modified fuel consumption based on modifications
  let fuelMultiplier = 1.0;
  if (hasTurbo) fuelMultiplier *= 1.12;  // Turbo increases fuel intake under load
  if (hasEcu) fuelMultiplier *= 1.06;    // ECU remap changes fuel maps for power
  if (hasExhaust) fuelMultiplier *= 0.98; // Exhaust reduces backpressure, increases efficiency
  if (hasIntake) fuelMultiplier *= 0.99;  // Intake slightly optimizes air/fuel efficiency

  modifiedStats.fuelConsumption = Math.round(modifiedStats.fuelConsumption * fuelMultiplier * 10) / 10;

  // 4.1 Recalculate Modified Performance Score using final fuel consumption
  const normHP = Math.min(100, Math.max(0, (modHP / 800) * 100));
  const normTorque = Math.min(100, Math.max(0, (modTorque / 800) * 100));
  const normSpeed = Math.min(100, Math.max(0, (modifiedStats.topSpeed / 400) * 100));
  const normAccel = Math.min(100, Math.max(0, ((15 - modifiedStats.acceleration) / 13) * 100));
  const normFuel = Math.min(100, Math.max(0, ((20 - modifiedStats.fuelConsumption) / 16) * 100));
  
  modifiedStats.performanceScore = Math.round((normHP + normTorque + normSpeed + normAccel + normFuel) / 5);
  modifiedStats.performanceRating = getRating(modifiedStats.performanceScore);

  // 5. Calculate differences
  // Acceleration diff: positive is an improvement (e.g. 8.2s -> 6.9s is +1.3s)
  const diffAcceleration = Math.round((stockStats.acceleration - modifiedStats.acceleration) * 100) / 100;
  const diffAccelerationPct = Math.round((diffAcceleration / stockStats.acceleration) * 1000) / 10;

  // Top speed diff: positive is improvement (e.g. 220 -> 245 is +25 km/h)
  const diffTopSpeed = Math.round((modifiedStats.topSpeed - stockStats.topSpeed) * 10) / 10;
  const diffTopSpeedPct = Math.round((diffTopSpeed / stockStats.topSpeed) * 1000) / 10;

  // Fuel consumption diff: positive means it consumes more fuel, negative means less
  const diffFuel = Math.round((modifiedStats.fuelConsumption - stockStats.fuelConsumption) * 10) / 10;
  const diffFuelPct = Math.round((diffFuel / stockStats.fuelConsumption) * 1000) / 10;

  const diffHP = Math.round((modHP - horsepower) * 10) / 10;
  const diffHPPct = Math.round((diffHP / horsepower) * 1000) / 10;

  const diffTorque = Math.round((modTorque - torque) * 10) / 10;
  const diffTorquePct = Math.round((diffTorque / torque) * 1000) / 10;

  const diffScore = modifiedStats.performanceScore - stockStats.performanceScore;
  const diffScorePct = stockStats.performanceScore > 0 
    ? Math.round((diffScore / stockStats.performanceScore) * 1000) / 10
    : 0;

  return {
    stock: stockStats,
    modified: {
      ...modifiedStats,
      horsepower: modHP,
      torque: modTorque
    },
    differences: {
      acceleration: diffAcceleration,
      accelerationPct: diffAccelerationPct,
      topSpeed: diffTopSpeed,
      topSpeedPct: diffTopSpeedPct,
      fuelConsumption: diffFuel,
      fuelConsumptionPct: diffFuelPct,
      horsepower: diffHP,
      horsepowerPct: diffHPPct,
      torque: diffTorque,
      torquePct: diffTorquePct,
      performanceScore: diffScore,
      performanceScorePct: diffScorePct
    }
  };
}

function getRating(score: number): string {
  if (score <= 40) return 'Basic';
  if (score <= 60) return 'Street';
  if (score <= 80) return 'Sport';
  if (score <= 90) return 'Track';
  return 'Race';
}

function calculateBaseStats(
  weight: number,
  hp: number,
  torque: number,
  drivetrain: 'FWD' | 'RWD' | 'AWD'
): PerformanceStats {
  // --- 0-100 km/h acceleration time ---
  // Base acceleration depends on HP/Weight and Torque/Weight ratio
  const powerFactor = hp * 0.8 + torque * 0.1;
  const accelBase = weight / powerFactor;

  // Drivetrain factor scales traction off the line, especially with higher power
  // FWD suffers from weight transfer, RWD is moderate, AWD handles launches excellently
  let drivetrainFactor = 1.0;
  if (drivetrain === 'FWD') {
    drivetrainFactor = 1.08 + 0.12 * (hp / 300);
  } else if (drivetrain === 'RWD') {
    drivetrainFactor = 1.02 + 0.04 * (hp / 300);
  } else { // AWD
    drivetrainFactor = 0.94 + 0.01 * (hp / 300);
  }

  let acceleration = accelBase * drivetrainFactor;

  // Apply real-world physical limits (tyre adhesion friction circle limits 0-100 to about 1.8s)
  const physicalFloor = drivetrain === 'AWD' ? 1.9 : drivetrain === 'RWD' ? 2.3 : 2.8;
  if (acceleration < physicalFloor) {
    // Smooth compression curve
    acceleration = physicalFloor + (acceleration - physicalFloor) * 0.2;
  }

  // --- Top Speed (km/h) ---
  // Standard aerodynamic drag requires power proportional to v^3
  // So top speed scales with the cube root of horsepower, plus gear/torque leverage
  const aerotopSpeed = 38.2 * Math.pow(hp, 0.3333);
  const mechanicalLeverage = 15.0 * (torque / weight);
  let topSpeed = aerotopSpeed + mechanicalLeverage;

  // Caps / sanity check based on physics limits
  if (topSpeed < 80) topSpeed = 80;
  if (topSpeed > 500) topSpeed = 500; // bugatti speeds

  // --- Fuel Consumption (L/100km) ---
  // Base consumption scales with weight (rolling resistance) and engine capacity/power
  let fuelConsumption = 3.5 + (weight * 0.0012) + (hp * 0.006) + (torque * 0.003);

  // --- 0-100 Performance Score Calculation ---
  const normHP = Math.min(100, Math.max(0, (hp / 800) * 100));
  const normTorque = Math.min(100, Math.max(0, (torque / 800) * 100));
  const normSpeed = Math.min(100, Math.max(0, (topSpeed / 400) * 100));
  const normAccel = Math.min(100, Math.max(0, ((15 - acceleration) / 13) * 100));
  const normFuel = Math.min(100, Math.max(0, ((20 - fuelConsumption) / 16) * 100));

  const score = Math.round((normHP + normTorque + normSpeed + normAccel + normFuel) / 5);

  return {
    acceleration: Math.round(acceleration * 100) / 100,
    topSpeed: Math.round(topSpeed),
    fuelConsumption: Math.round(fuelConsumption * 10) / 10,
    horsepower: hp,
    torque: torque,
    performanceScore: score,
    performanceRating: getRating(score)
  };
}
