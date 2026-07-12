import React from 'react';
import { DrivetrainType, ModificationType } from '../types';
import { Gauge, ShieldAlert } from 'lucide-react';

export interface CarPreset {
  id: string;
  nameKey: string;
  weight: number;
  horsepower: number;
  torque: number;
  drivetrain: DrivetrainType;
  image: string;
}

export const CAR_PRESETS: CarPreset[] = [
  { id: 'bmw_m3', nameKey: 'bmw_m3_preset', weight: 1730, horsepower: 503, torque: 650, drivetrain: 'RWD', image: '/images/bmw_m3.png' },
  { id: 'supra', nameKey: 'supra_preset', weight: 1500, horsepower: 382, torque: 500, drivetrain: 'RWD', image: '/images/supra.png' },
  { id: 'gtr', nameKey: 'gtr_preset', weight: 1750, horsepower: 565, torque: 633, drivetrain: 'AWD', image: '/images/gtr.png' },
  { id: 'civic', nameKey: 'civic_preset', weight: 1430, horsepower: 315, torque: 400, drivetrain: 'FWD', image: '/images/civic.png' },
  { id: 'mustang', nameKey: 'mustang_preset', weight: 1680, horsepower: 450, torque: 556, drivetrain: 'RWD', image: '/images/mustang.png' }
];

interface ConfigPanelProps {
  weight: number;
  setWeight: (w: number) => void;
  horsepower: number;
  setHorsepower: (hp: number) => void;
  torque: number;
  setTorque: (t: number) => void;
  drivetrain: DrivetrainType;
  setDrivetrain: (d: DrivetrainType) => void;
  modifications: ModificationType[];
  setModifications: (m: ModificationType[]) => void;
  t: any;
  selectedPreset: string;
  setSelectedPreset: (p: string) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  weight,
  setWeight,
  horsepower,
  setHorsepower,
  torque,
  setTorque,
  drivetrain,
  setDrivetrain,
  modifications,
  setModifications,
  t,
  selectedPreset,
  setSelectedPreset
}) => {
  // Input validations
  const isWeightValid = weight >= 300 && weight <= 8000;
  const isHpValid = horsepower >= 20 && horsepower <= 4000;
  const isTorqueValid = torque >= 20 && torque <= 4000;

  const handleCarSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    if (presetId === '') return;

    const car = CAR_PRESETS.find(c => c.id === presetId);
    if (car) {
      setWeight(car.weight);
      setHorsepower(car.horsepower);
      setTorque(car.torque);
      setDrivetrain(car.drivetrain);
    }
  };

  const handleModToggle = (mod: ModificationType) => {
    if (modifications.includes(mod)) {
      setModifications(modifications.filter(m => m !== mod));
    } else {
      setModifications([...modifications, mod]);
    }
  };

  const modsList: { id: ModificationType; nameKey: string; descKey: string }[] = [
    { id: 'turbo', nameKey: 'turbo', descKey: 'turboDesc' },
    { id: 'ecu', nameKey: 'ecu', descKey: 'ecuDesc' },
    { id: 'exhaust', nameKey: 'exhaust', descKey: 'exhaustDesc' },
    { id: 'intake', nameKey: 'intake', descKey: 'intakeDesc' }
  ];

  return (
    <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Gauge size={24} className="brand-icon" style={{ color: 'var(--color-orange)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.vehicleSpecs}</h2>
      </div>

      {/* Predefined Vehicle Presets */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t.selectCar}
        </label>
        <select
          className="form-input"
          value={selectedPreset}
          onChange={(e) => handleCarSelect(e.target.value)}
          style={{ background: '#13131c' }}
        >
          <option value="">{t.customCar}</option>
          {CAR_PRESETS.map((car) => (
            <option key={car.id} value={car.id}>
              {t[car.nameKey]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

      {/* Weight Input */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t.weight}
        </label>
        <input
          type="number"
          className="form-input"
          value={weight || ''}
          onChange={(e) => {
            setSelectedPreset('');
            setWeight(Math.max(0, parseInt(e.target.value) || 0));
          }}
          style={{ borderColor: !isWeightValid ? 'var(--color-danger)' : undefined }}
        />
        {!isWeightValid && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '6px' }}>
            <ShieldAlert size={14} />
            <span>{t.errorWeight}</span>
          </div>
        )}
      </div>

      {/* Horsepower Input */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t.horsepower}
        </label>
        <input
          type="number"
          className="form-input"
          value={horsepower || ''}
          onChange={(e) => {
            setSelectedPreset('');
            setHorsepower(Math.max(0, parseInt(e.target.value) || 0));
          }}
          style={{ borderColor: !isHpValid ? 'var(--color-danger)' : undefined }}
        />
        {!isHpValid && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '6px' }}>
            <ShieldAlert size={14} />
            <span>{t.errorHp}</span>
          </div>
        )}
      </div>

      {/* Torque Input */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t.torque}
        </label>
        <input
          type="number"
          className="form-input"
          value={torque || ''}
          onChange={(e) => {
            setSelectedPreset('');
            setTorque(Math.max(0, parseInt(e.target.value) || 0));
          }}
          style={{ borderColor: !isTorqueValid ? 'var(--color-danger)' : undefined }}
        />
        {!isTorqueValid && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '6px' }}>
            <ShieldAlert size={14} />
            <span>{t.errorTorque}</span>
          </div>
        )}
      </div>

      {/* Drivetrain Selection */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t.drivetrain}
        </label>
        <div className="radio-group">
          {(['FWD', 'RWD', 'AWD'] as DrivetrainType[]).map((drive) => (
            <div
              key={drive}
              className={`radio-label ${drivetrain === drive ? 'active' : ''}`}
              onClick={() => {
                setSelectedPreset('');
                setDrivetrain(drive);
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{drive}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>
                {drive === 'FWD' ? 'Front' : drive === 'RWD' ? 'Rear' : 'All-Whl'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

      {/* Performance Modifications */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>{t.perfMods}</h3>
        <div>
          {modsList.map((mod) => {
            const isActive = modifications.includes(mod.id);
            return (
              <div
                key={mod.id}
                className={`mod-card ${isActive ? 'active' : ''}`}
                onClick={() => handleModToggle(mod.id)}
              >
                <div className="mod-checkbox">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: isActive ? 'var(--color-cyan)' : 'var(--text-primary)' }}>
                    {t[mod.nameKey]}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {t[mod.descKey]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
