import React from 'react';
import { SimHistoryEntry } from '../types';
import { History, RotateCcw, Trash2, Fuel, Gauge, Zap, Sparkles } from 'lucide-react';

interface SimulationHistoryProps {
  simHistory: SimHistoryEntry[];
  onReloadSim: (entry: SimHistoryEntry) => void;
  onClearHistory: () => void;
  t: any;
  lang: 'en' | 'ar';
}

export const SimulationHistory: React.FC<SimulationHistoryProps> = ({
  simHistory,
  onReloadSim,
  onClearHistory,
  t,
  lang
}) => {
  return (
    <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={20} style={{ color: 'var(--color-cyan)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            {t.simHistory}
          </h3>
        </div>
        {simHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="btn-secondary"
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.8rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              color: 'var(--color-danger)',
              borderColor: 'rgba(255, 23, 68, 0.2)',
              background: 'rgba(255, 23, 68, 0.02)'
            }}
          >
            <Trash2 size={12} />
            <span>{lang === 'ar' ? 'مسح السجل' : 'Clear Log'}</span>
          </button>
        )}
      </div>

      {/* History List */}
      {simHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p>{t.historyEmpty}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
          {simHistory.map((entry) => {
            const modsText = entry.modifications.map(m => t[m] || m).join(', ');
            
            return (
              <div 
                key={entry.id} 
                className="history-entry-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {/* Meta details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ⏱️ {entry.timestamp}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ⚙️ {entry.weight} kg | {entry.drivetrain}
                  </span>
                  <button
                    onClick={() => onReloadSim(entry)}
                    className="btn-secondary"
                    style={{ 
                      padding: '4px 10px', 
                      fontSize: '0.75rem', 
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderColor: 'rgba(0, 240, 255, 0.2)'
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>{t.reload}</span>
                  </button>
                </div>

                {/* Specs overview */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                  <strong style={{ color: 'var(--color-orange)' }}>{lang === 'ar' ? 'المواصفات:' : 'Specs:'}</strong>{' '}
                  {entry.horsepower} HP / {entry.torque} Nm
                  {entry.modifications.length > 0 && (
                    <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--color-cyan)' }}>
                      <strong>{t.recommendedMods}:</strong> {modsText}
                    </div>
                  )}
                </div>

                {/* Results Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} style={{ color: 'var(--color-warning)' }} />
                    {t.perfScore}: <strong style={{ color: 'var(--text-primary)' }}>{entry.results.modified.performanceScore}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} style={{ color: 'var(--color-orange)' }} />
                    {t.accel}: <strong style={{ color: 'var(--text-primary)' }}>{entry.results.modified.acceleration}s</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Gauge size={12} style={{ color: 'var(--color-cyan)' }} />
                    {t.topSpeed}: <strong style={{ color: 'var(--text-primary)' }}>{entry.results.modified.topSpeed} km/h</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Fuel size={12} style={{ color: 'var(--color-warning)' }} />
                    {t.fuel}: <strong style={{ color: 'var(--text-primary)' }}>{entry.results.modified.fuelConsumption}L</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
