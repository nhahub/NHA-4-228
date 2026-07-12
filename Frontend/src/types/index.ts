export type DrivetrainType = 'FWD' | 'RWD' | 'AWD';

export type ModificationType = 'turbo' | 'exhaust' | 'ecu' | 'intake';

export interface TuningRequest {
  weight: number;
  horsepower: number;
  torque: number;
  drivetrain: DrivetrainType;
  modifications: ModificationType[];
}

export interface PerformanceStats {
  acceleration: number;      // 0-100 km/h in seconds
  topSpeed: number;          // in km/h
  fuelConsumption: number;   // in L/100km
  horsepower: number;        // modified horsepower
  torque: number;            // modified torque
  performanceScore: number;  // 0-100 score
  performanceRating: string; // Basic, Street, Sport, Track, Race
}

export interface TuningResponse {
  stock: PerformanceStats;
  modified: PerformanceStats;
  differences: {
    acceleration: number;
    accelerationPct: number;
    topSpeed: number;
    topSpeedPct: number;
    fuelConsumption: number;
    fuelConsumptionPct: number;
    horsepower: number;
    horsepowerPct: number;
    torque: number;
    torquePct: number;
    performanceScore: number;
    performanceScorePct: number;
  };
}

export interface SavedBuild {
  id: string;
  name: string;
  username: string;
  weight: number;
  horsepower: number;
  torque: number;
  drivetrain: DrivetrainType;
  modifications: ModificationType[];
  results: TuningResponse;
  createdAt: string;
}

export interface SimHistoryEntry {
  id: string;
  weight: number;
  horsepower: number;
  torque: number;
  drivetrain: DrivetrainType;
  modifications: ModificationType[];
  results: TuningResponse;
  timestamp: string;
}

