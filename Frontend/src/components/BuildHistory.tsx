import React, { useState } from 'react';
import { SavedBuild } from '../types';
import { Save, Trash2, ArrowRightLeft, FolderHeart, ArrowUpRight } from 'lucide-react';

interface BuildHistoryProps {
  savedBuilds: SavedBuild[];
  onSaveBuild: (name: string) => void;
  onDeleteBuild: (id: string) => void;
  onLoadBuild: (build: SavedBuild) => void;
  t: any;
  lang: 'en' | 'ar';
}

export const BuildHistory: React.FC<BuildHistoryProps> = ({
  savedBuilds,
  onSaveBuild,
  onDeleteBuild,
  onLoadBuild,
  t,
  lang
}) => {
  const [newBuildName, setNewBuildName] = useState('');
  const [selectedBuildIds, setSelectedBuildIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuildName.trim()) return;
    onSaveBuild(newBuildName.trim());
    setNewBuildName('');
  };

  const handleSelectBuild = (id: string) => {
    if (selectedBuildIds.includes(id)) {
      setSelectedBuildIds(selectedBuildIds.filter(bid => bid !== id));
    } else {
      setSelectedBuildIds([...selectedBuildIds, id]);
    }
  };

  const selectedBuilds = savedBuilds.filter(b => selectedBuildIds.includes(b.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Save build form */}
      <div className="neon-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderHeart size={18} style={{ color: 'var(--color-orange)' }} />
          {t.saveBuild}
        </h3>
        <form onSubmit={handleSaveSubmit} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="form-input"
            placeholder={t.buildNamePlaceholder}
            value={newBuildName}
            onChange={(e) => setNewBuildName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={!newBuildName.trim()}>
            <Save size={16} />
            <span>{t.saveBtn}</span>
          </button>
        </form>
      </div>

      {/* Saved builds list */}
      <div className="neon-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t.savedBuilds}</h3>
          
          {selectedBuildIds.length >= 2 && (
            <button
              onClick={() => setIsComparing(!isComparing)}
              className="btn-primary"
              style={{
                background: isComparing ? 'rgba(255, 85, 0, 0.1)' : undefined,
                border: isComparing ? '1px solid var(--color-orange)' : undefined,
                color: isComparing ? 'var(--color-orange)' : undefined,
                boxShadow: isComparing ? 'none' : undefined
              }}
            >
              <ArrowRightLeft size={16} />
              <span>{isComparing ? t.stopCompareBtn : `${t.compareBtn} (${selectedBuildIds.length})`}</span>
            </button>
          )}
        </div>

        {savedBuilds.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0' }}>{t.noSavedBuilds}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {savedBuilds.map((build) => {
              const isChecked = selectedBuildIds.includes(build.id);
              return (
                <div
                  key={build.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${isChecked ? 'var(--color-orange)' : 'var(--border-color)'}`,
                    background: isChecked ? 'rgba(255, 85, 0, 0.02)' : 'rgba(255,255,255,0.01)',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  {/* Select for comparison */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSelectBuild(build.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--color-orange)',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>{build.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {build.weight}kg • {build.drivetrain} • {build.modifications.length} modifications
                      </p>
                    </div>
                  </div>

                  {/* Summary performance stats */}
                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>0-100: </span>
                      <strong style={{ color: 'var(--color-orange)' }}>{build.results.modified.acceleration}s</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Top: </span>
                      <strong style={{ color: 'var(--color-cyan)' }}>{build.results.modified.topSpeed}km/h</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onLoadBuild(build)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      title={t.loadBtn}
                    >
                      <ArrowUpRight size={14} />
                      <span>{t.loadBtn}</span>
                    </button>
                    <button
                      onClick={() => onDeleteBuild(build.id)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'rgba(255, 23, 68, 0.2)', color: 'var(--color-danger)' }}
                      title={t.deleteBtn}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Workspace (Side-by-side comparison) */}
      {isComparing && selectedBuilds.length >= 2 && (
        <div className="neon-card" style={{ padding: '24px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            {t.compareHeader}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>{t.buildDetails}</th>
                {selectedBuilds.map(b => (
                  <th key={b.id} style={{ padding: '12px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-cyan)' }}>
                    {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Weight */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.weight}</td>
                {selectedBuilds.map(b => (
                  <td key={b.id} style={{ padding: '12px' }}>{b.weight} kg</td>
                ))}
              </tr>
              {/* Drivetrain */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.drivetrain}</td>
                {selectedBuilds.map(b => (
                  <td key={b.id} style={{ padding: '12px' }}>{b.drivetrain}</td>
                ))}
              </tr>
              {/* Horsepower */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.horsepower}</td>
                {selectedBuilds.map(b => (
                  <td key={b.id} style={{ padding: '12px' }}>
                    {b.results.modified.horsepower} {t.hpUnit} 
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      (Stock: {b.horsepower})
                    </span>
                  </td>
                ))}
              </tr>
              {/* Torque */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.torque}</td>
                {selectedBuilds.map(b => (
                  <td key={b.id} style={{ padding: '12px' }}>
                    {b.results.modified.torque} {t.nmUnit}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      (Stock: {b.torque})
                    </span>
                  </td>
                ))}
              </tr>
              {/* Modifications */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.perfMods}</td>
                {selectedBuilds.map(b => (
                  <td key={b.id} style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {b.modifications.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      ) : (
                        b.modifications.map(m => (
                          <span
                            key={m}
                            style={{
                              fontSize: '0.7rem',
                              background: 'rgba(0, 240, 255, 0.1)',
                              color: 'var(--color-cyan)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid rgba(0, 240, 255, 0.2)'
                            }}
                          >
                            {t[m]}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Acceleration */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.accel}</td>
                {selectedBuilds.map(b => (
                  <td key={b.id} style={{ padding: '12px', fontWeight: 600, color: 'var(--color-orange)' }}>
                    {b.results.modified.acceleration} {t.seconds}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      (Stock: {b.results.stock.acceleration}s)
                    </span>
                  </td>
                ))}
              </tr>
              {/* Top Speed */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.topSpeed}</td>
                {selectedBuilds.map(b => (
                  <td key={b.id} style={{ padding: '12px', fontWeight: 600, color: 'var(--color-cyan)' }}>
                    {b.results.modified.topSpeed} {t.kmh}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      (Stock: {b.results.stock.topSpeed} km/h)
                    </span>
                  </td>
                ))}
              </tr>
              {/* Fuel Consumption */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.fuel}</td>
                {selectedBuilds.map(b => (
                  <td key={b.id} style={{ padding: '12px', fontWeight: 600, color: 'var(--color-warning)' }}>
                    {b.results.modified.fuelConsumption} {t.fuelUnit}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      (Stock: {b.results.stock.fuelConsumption} L)
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
