import React from 'react';
import { DrivetrainType, ModificationType } from '../types';
import { Gauge, ShieldAlert } from 'lucide-react';

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
  t
}) => {
  // Input validations
  const isWeightValid = weight >= 300 && weight <= 8000;
  const isHpValid = horsepower >= 20 && horsepower <= 4000;
  const isTorqueValid = torque >= 20 && torque <= 4000;

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

      {/* Weight Input */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t.weight}
        </label>
        <input
          type="number"
          className="form-input"
          value={weight || ''}
          onChange={(e) => setWeight(Math.max(0, parseInt(e.target.value) || 0))}
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
          onChange={(e) => setHorsepower(Math.max(0, parseInt(e.target.value) || 0))}
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
          onChange={(e) => setTorque(Math.max(0, parseInt(e.target.value) || 0))}
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
              onClick={() => setDrivetrain(drive)}
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
