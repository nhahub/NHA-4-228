export type DrivetrainType = 'FWD' | 'RWD' | 'AWD';

export type ModificationType = 'turbo' | 'exhaust' | 'ecu' | 'intake';

export interface TuningRequest {
  weight: number;         // in kg
  horsepower: number;     // in HP (stock)
  torque: number;         // in Nm (stock)
  drivetrain: DrivetrainType;
  modifications: ModificationType[];
}

export interface PerformanceStats {
  acceleration: number;      // 0-100 km/h in seconds
  topSpeed: number;          // in km/h
  fuelConsumption: number;   // in L/100km
  horsepower: number;        // dynamic status HP
  torque: number;            // dynamic status torque
  performanceScore: number;  // 0-100 score
  performanceRating: string; // Basic, Street, Sport, Track, Race
}

export interface TuningResponse {
  stock: PerformanceStats;
  modified: PerformanceStats;
  differences: {
    acceleration: number;         // Stock - Modified (positive is improvement)
    accelerationPct: number;      // % change
    topSpeed: number;             // Modified - Stock
    topSpeedPct: number;          // % change
    fuelConsumption: number;      // Modified - Stock
    fuelConsumptionPct: number;   // % change
    horsepower: number;
    horsepowerPct: number;
    torque: number;
    torquePct: number;
    performanceScore: number;
    performanceScorePct: number;
  };
}
