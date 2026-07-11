import React from 'react';
import { TuningResponse } from '../types';
import { ArrowUp, ArrowDown, Zap, Gauge, Flame, Fuel } from 'lucide-react';

interface DashboardProps {
  results: TuningResponse | null;
  t: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ results, t }) => {
  if (!results) {
    return (
      <div className="neon-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Configure specifications to see simulator dashboard</p>
      </div>
    );
  }

  const { stock, modified, differences } = results;

  // Helper to format values
  const formatDiff = (val: number, pct: number, type: 'accel' | 'speed' | 'fuel' | 'power') => {
    const isImprovement = 
      (type === 'accel' && val > 0) || 
      (type === 'speed' && val > 0) || 
      (type === 'power' && val > 0) ||
      (type === 'fuel' && val < 0); // lower fuel consumption is better

    const isWorse = 
      (type === 'accel' && val < 0) || 
      (type === 'speed' && val < 0) || 
      (type === 'power' && val < 0) ||
      (type === 'fuel' && val > 0);

    const sign = val > 0 ? '+' : '';
    const badgeClass = isImprovement ? 'better' : isWorse ? 'worse' : 'neutral';
    
    // Arabic translations translate "Improved"/"Compromised"
    const statusText = isImprovement ? t.improved : isWorse ? t.compromised : t.noChange;

    return (
      <div className={`diff-badge ${badgeClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {isImprovement ? <ArrowUp size={12} /> : isWorse ? <ArrowDown size={12} /> : null}
        <span>{sign}{val} ({sign}{pct}%)</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>• {statusText}</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="pulsing-dot" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t.resultsDashboard}
          </h2>
        </div>
      </div>

      {/* Main Gauges Row */}
      <div className="metrics-grid">
        {/* Acceleration 0-100 */}
        <div className="metric-card" style={{ borderLeft: '3px solid var(--color-orange)' }}>
          <div className="metric-header">
            <span>{t.accel}</span>
            <Zap size={18} style={{ color: 'var(--color-orange)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="metric-value-container">
                <span className="metric-value" style={{ color: 'var(--color-orange)' }}>{modified.acceleration}</span>
                <span className="metric-unit">{t.seconds}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t.stock}: {stock.acceleration} {t.seconds}
              </span>
            </div>
            {formatDiff(differences.acceleration, differences.accelerationPct, 'accel')}
          </div>
        </div>

        {/* Top Speed */}
        <div className="metric-card" style={{ borderLeft: '3px solid var(--color-cyan)' }}>
          <div className="metric-header">
            <span>{t.topSpeed}</span>
            <Gauge size={18} style={{ color: 'var(--color-cyan)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="metric-value-container">
                <span className="metric-value" style={{ color: 'var(--color-cyan)' }}>{modified.topSpeed}</span>
                <span className="metric-unit">{t.kmh}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t.stock}: {stock.topSpeed} {t.kmh}
              </span>
            </div>
            {formatDiff(differences.topSpeed, differences.topSpeedPct, 'speed')}
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="metric-card" style={{ borderLeft: '3px solid var(--color-warning)' }}>
          <div className="metric-header">
            <span>{t.fuel}</span>
            <Fuel size={18} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="metric-value-container">
                <span className="metric-value" style={{ color: 'var(--color-warning)' }}>{modified.fuelConsumption}</span>
                <span className="metric-unit">{t.fuelUnit}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t.stock}: {stock.fuelConsumption} {t.fuelUnit}
              </span>
            </div>
            {formatDiff(differences.fuelConsumption, differences.fuelConsumptionPct, 'fuel')}
          </div>
        </div>
      </div>

      {/* Tech Spec Cards - HP & Torque details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Horsepower Details */}
        <div className="neon-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t.horsepower}</span>
            <Flame size={16} style={{ color: 'var(--color-orange)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{modified.horsepower}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.hpUnit}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t.stock}: {stock.horsepower} {t.hpUnit}</span>
            <span style={{ color: differences.horsepower >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
              {differences.horsepower >= 0 ? '+' : ''}{differences.horsepower} HP ({differences.horsepowerPct}%)
            </span>
          </div>
        </div>

        {/* Torque Details */}
        <div className="neon-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t.torque}</span>
            <Zap size={16} style={{ color: 'var(--color-cyan)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{modified.torque}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.nmUnit}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t.stock}: {stock.torque} {t.nmUnit}</span>
            <span style={{ color: differences.torque >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
              {differences.torque >= 0 ? '+' : ''}{differences.torque} Nm ({differences.torquePct}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
