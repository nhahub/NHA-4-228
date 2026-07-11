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
  };
}

export interface SavedBuild {
  id: string;
  name: string;
  weight: number;
  horsepower: number;
  torque: number;
  drivetrain: DrivetrainType;
  modifications: ModificationType[];
  results: TuningResponse;
  createdAt: string;
}
