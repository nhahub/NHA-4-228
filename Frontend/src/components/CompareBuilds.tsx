import React, { useState } from 'react';
import { SavedBuild } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';
import { Scale, ArrowRightLeft, Flame, Gauge, Zap, Fuel, Sparkles, AlertCircle } from 'lucide-react';

interface CompareBuildsProps {
  savedBuilds: SavedBuild[];
  t: any;
  lang: 'en' | 'ar';
}

export const CompareBuilds: React.FC<CompareBuildsProps> = ({ savedBuilds, t, lang }) => {
  const [buildIdA, setBuildIdA] = useState<string>('');
  const [buildIdB, setBuildIdB] = useState<string>('');

  if (savedBuilds.length < 2) {
    return (
      <div className="neon-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Scale size={32} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{lang === 'ar' ? 'مقارنة التعديلات' : 'Compare Saved Builds'}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
          {lang === 'ar' 
            ? 'يرجى حفظ تعديلين على الأقل لتفعيل ميزة المقارنة المتقدمة.' 
            : 'Please save at least 2 builds to unlock the side-by-side comparison workspace.'}
        </p>
      </div>
    );
  }

  const buildA = savedBuilds.find(b => b.id === buildIdA);
  const buildB = savedBuilds.find(b => b.id === buildIdB);

  // Normalization logic for comparing values (0 - 100 rating)
  const normHP = (hp: number) => Math.min(100, Math.max(0, (hp / 800) * 100));
  const normTorque = (trq: number) => Math.min(100, Math.max(0, (trq / 800) * 100));
  const normSpeed = (spd: number) => Math.min(100, Math.max(0, (spd / 400) * 100));
  const normAccel = (acc: number) => Math.min(100, Math.max(0, ((15 - acc) / 13) * 100));
  const normFuel = (fl: number) => Math.min(100, Math.max(0, ((20 - fl) / 16) * 100));

  // Build comparison charts data
  const comparisonChartData = (buildA && buildB) ? [
    {
      name: t.horsepower,
      [buildA.name]: Math.round(normHP(buildA.results.modified.horsepower)),
      [buildB.name]: Math.round(normHP(buildB.results.modified.horsepower))
    },
    {
      name: t.torque,
      [buildA.name]: Math.round(normTorque(buildA.results.modified.torque)),
      [buildB.name]: Math.round(normTorque(buildB.results.modified.torque))
    },
    {
      name: lang === 'ar' ? 'تقييم التسارع' : 'Acceleration Rating',
      [buildA.name]: Math.round(normAccel(buildA.results.modified.acceleration)),
      [buildB.name]: Math.round(normAccel(buildB.results.modified.acceleration))
    },
    {
      name: lang === 'ar' ? 'تقييم السرعة' : 'Speed Rating',
      [buildA.name]: Math.round(normSpeed(buildA.results.modified.topSpeed)),
      [buildB.name]: Math.round(normSpeed(buildB.results.modified.topSpeed))
    },
    {
      name: lang === 'ar' ? 'تقييم كفاءة الوقود' : 'Fuel Efficiency Rating',
      [buildA.name]: Math.round(normFuel(buildA.results.modified.fuelConsumption)),
      [buildB.name]: Math.round(normFuel(buildB.results.modified.fuelConsumption))
    },
    {
      name: lang === 'ar' ? 'تقييم الأداء العام' : 'Overall Score',
      [buildA.name]: buildA.results.modified.performanceScore,
      [buildB.name]: buildB.results.modified.performanceScore
    }
  ] : [];

  // Comparison evaluation helpers
  const compareStats = (key: 'hp' | 'torque' | 'accel' | 'speed' | 'fuel' | 'score') => {
    if (!buildA || !buildB) return { better: null };
    const valA = 
      key === 'hp' ? buildA.results.modified.horsepower :
      key === 'torque' ? buildA.results.modified.torque :
      key === 'accel' ? buildA.results.modified.acceleration :
      key === 'speed' ? buildA.results.modified.topSpeed :
      key === 'fuel' ? buildA.results.modified.fuelConsumption :
      buildA.results.modified.performanceScore;

    const valB = 
      key === 'hp' ? buildB.results.modified.horsepower :
      key === 'torque' ? buildB.results.modified.torque :
      key === 'accel' ? buildB.results.modified.acceleration :
      key === 'speed' ? buildB.results.modified.topSpeed :
      key === 'fuel' ? buildB.results.modified.fuelConsumption :
      buildB.results.modified.performanceScore;

    if (valA === valB) return { better: 'draw' };

    const isABetter = 
      (key === 'accel' || key === 'fuel') ? valA < valB : valA > valB; // lower is better for acceleration/fuel

    return { better: isABetter ? 'A' : 'B' };
  };

  const renderDiffBadge = (valA: number, valB: number, type: 'accel' | 'speed' | 'fuel' | 'power' | 'score', unit: string) => {
    const rawDiff = valB - valA;
    const isImprovement = 
      (type === 'accel' && rawDiff < 0) || 
      (type === 'fuel' && rawDiff < 0) || 
      ((type === 'power' || type === 'speed' || type === 'score') && rawDiff > 0);

    const isWorse = 
      (type === 'accel' && rawDiff > 0) || 
      (type === 'fuel' && rawDiff > 0) || 
      ((type === 'power' || type === 'speed' || type === 'score') && rawDiff < 0);

    const sign = rawDiff > 0 ? '+' : '';
    const diffText = `${sign}${Math.round(rawDiff * 10) / 10} ${unit}`;
    
    let badgeClass = 'neutral';
    if (isImprovement) badgeClass = 'better';
    if (isWorse) badgeClass = 'worse';

    return (
      <span className={`diff-badge ${badgeClass}`} style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px' }}>
        {rawDiff === 0 ? '=' : diffText}
      </span>
    );
  };

  return (
    <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
        <ArrowRightLeft size={22} style={{ color: 'var(--color-cyan)' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5px' }}>
          {lang === 'ar' ? 'مقارنة التعديلات المتقدمة' : 'Advanced Build Comparison Workspace'}
        </h3>
      </div>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {lang === 'ar' ? 'اختر التعديل أ' : 'Select Build A'}
          </label>
          <select
            className="form-input"
            value={buildIdA}
            onChange={(e) => setBuildIdA(e.target.value)}
            style={{ background: '#13131c' }}
          >
            <option value="">-- {lang === 'ar' ? 'اختر' : 'Choose Build'} --</option>
            {savedBuilds.map(b => (
              <option key={b.id} value={b.id} disabled={b.id === buildIdB}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {lang === 'ar' ? 'اختر التعديل ب' : 'Select Build B'}
          </label>
          <select
            className="form-input"
            value={buildIdB}
            onChange={(e) => setBuildIdB(e.target.value)}
            style={{ background: '#13131c' }}
          >
            <option value="">-- {lang === 'ar' ? 'اختر' : 'Choose Build'} --</option>
            {savedBuilds.map(b => (
              <option key={b.id} value={b.id} disabled={b.id === buildIdA}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert if not selected */}
      {(!buildA || !buildB) ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          justifyContent: 'center'
        }}>
          <AlertCircle size={18} />
          <span>{lang === 'ar' ? 'الرجاء اختيار تعديلين من القوائم للمقارنة التفاعلية.' : 'Select two builds from the dropdown menus to compare details and charts.'}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Side-by-side Card layouts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Build A Card */}
            <div 
              className="neon-card" 
              style={{ 
                background: 'rgba(255, 85, 0, 0.03)',
                borderColor: compareStats('score').better === 'A' ? 'var(--color-success)' : 'rgba(255, 85, 0, 0.2)',
                boxShadow: compareStats('score').better === 'A' ? '0 0 16px rgba(0, 230, 118, 0.15)' : 'none',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-orange)' }}>{buildA.name}</h4>
                {compareStats('score').better === 'A' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, border: '1px solid var(--color-success)', padding: '2px 8px', borderRadius: '12px' }}>
                    🏆 {lang === 'ar' ? 'الخيار الأفضل' : 'Overall Better'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Score */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} style={{ color: 'var(--color-warning)' }} />
                    {t.perfScore}
                  </span>
                  <strong style={{ color: compareStats('score').better === 'A' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildA.results.modified.performanceScore} / 100 ({t[`rating_${buildA.results.modified.performanceRating}`]})
                  </strong>
                </div>

                {/* HP */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={14} style={{ color: 'var(--color-orange)' }} />
                    {t.horsepower}
                  </span>
                  <strong style={{ color: compareStats('hp').better === 'A' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildA.results.modified.horsepower} {t.hpUnit}
                  </strong>
                </div>

                {/* Torque */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} style={{ color: 'var(--color-cyan)' }} />
                    {t.torque}
                  </span>
                  <strong style={{ color: compareStats('torque').better === 'A' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildA.results.modified.torque} {t.nmUnit}
                  </strong>
                </div>

                {/* Accel */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} style={{ color: 'var(--color-orange)' }} />
                    {t.accel}
                  </span>
                  <strong style={{ color: compareStats('accel').better === 'A' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildA.results.modified.acceleration} {t.seconds}
                  </strong>
                </div>

                {/* Speed */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Gauge size={14} style={{ color: 'var(--color-cyan)' }} />
                    {t.topSpeed}
                  </span>
                  <strong style={{ color: compareStats('speed').better === 'A' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildA.results.modified.topSpeed} {t.kmh}
                  </strong>
                </div>

                {/* Fuel */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Fuel size={14} style={{ color: 'var(--color-warning)' }} />
                    {t.fuel}
                  </span>
                  <strong style={{ color: compareStats('fuel').better === 'A' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildA.results.modified.fuelConsumption} {t.fuelUnit}
                  </strong>
                </div>
              </div>
            </div>

            {/* Build B Card */}
            <div 
              className="neon-card" 
              style={{ 
                background: 'rgba(0, 240, 255, 0.02)',
                borderColor: compareStats('score').better === 'B' ? 'var(--color-success)' : 'rgba(0, 240, 255, 0.2)',
                boxShadow: compareStats('score').better === 'B' ? '0 0 16px rgba(0, 230, 118, 0.15)' : 'none',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-cyan)' }}>{buildB.name}</h4>
                {compareStats('score').better === 'B' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, border: '1px solid var(--color-success)', padding: '2px 8px', borderRadius: '12px' }}>
                    🏆 {lang === 'ar' ? 'الخيار الأفضل' : 'Overall Better'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Score */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} style={{ color: 'var(--color-warning)' }} />
                    {t.perfScore}
                  </span>
                  <strong style={{ color: compareStats('score').better === 'B' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildB.results.modified.performanceScore} / 100 ({t[`rating_${buildB.results.modified.performanceRating}`]})
                  </strong>
                </div>

                {/* HP */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={14} style={{ color: 'var(--color-orange)' }} />
                    {t.horsepower}
                  </span>
                  <strong style={{ color: compareStats('hp').better === 'B' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildB.results.modified.horsepower} {t.hpUnit}
                  </strong>
                </div>

                {/* Torque */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} style={{ color: 'var(--color-cyan)' }} />
                    {t.torque}
                  </span>
                  <strong style={{ color: compareStats('torque').better === 'B' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildB.results.modified.torque} {t.nmUnit}
                  </strong>
                </div>

                {/* Accel */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} style={{ color: 'var(--color-orange)' }} />
                    {t.accel}
                  </span>
                  <strong style={{ color: compareStats('accel').better === 'B' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildB.results.modified.acceleration} {t.seconds}
                  </strong>
                </div>

                {/* Speed */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Gauge size={14} style={{ color: 'var(--color-cyan)' }} />
                    {t.topSpeed}
                  </span>
                  <strong style={{ color: compareStats('speed').better === 'B' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildB.results.modified.topSpeed} {t.kmh}
                  </strong>
                </div>

                {/* Fuel */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Fuel size={14} style={{ color: 'var(--color-warning)' }} />
                    {t.fuel}
                  </span>
                  <strong style={{ color: compareStats('fuel').better === 'B' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                    {buildB.results.modified.fuelConsumption} {t.fuelUnit}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Details Table Comparison */}
          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px' }}>{t.buildDetails}</th>
                  <th style={{ padding: '10px' }}>{buildA.name}</th>
                  <th style={{ padding: '10px' }}>{buildB.name}</th>
                  <th style={{ padding: '10px' }}>{t.difference} (A ➔ B)</th>
                </tr>
              </thead>
              <tbody>
                {/* Performance Score */}
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--color-orange)' }}>{t.perfScore}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 600 }}>{buildA.results.modified.performanceScore} ({t[`rating_${buildA.results.modified.performanceRating}`]})</td>
                  <td style={{ padding: '12px 10px', fontWeight: 600 }}>{buildB.results.modified.performanceScore} ({t[`rating_${buildB.results.modified.performanceRating}`]})</td>
                  <td style={{ padding: '12px 10px' }}>
                    {renderDiffBadge(buildA.results.modified.performanceScore, buildB.results.modified.performanceScore, 'score', 'pts')}
                  </td>
                </tr>
                {/* Weight */}
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 500 }}>{lang === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'}</td>
                  <td style={{ padding: '12px 10px' }}>{buildA.weight} kg</td>
                  <td style={{ padding: '12px 10px' }}>{buildB.weight} kg</td>
                  <td style={{ padding: '12px 10px' }}>
                    {renderDiffBadge(buildA.weight, buildB.weight, 'accel', 'kg')}
                  </td>
                </tr>
                {/* Horsepower */}
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 500 }}>{t.horsepower}</td>
                  <td style={{ padding: '12px 10px' }}>{buildA.results.modified.horsepower} HP</td>
                  <td style={{ padding: '12px 10px' }}>{buildB.results.modified.horsepower} HP</td>
                  <td style={{ padding: '12px 10px' }}>
                    {renderDiffBadge(buildA.results.modified.horsepower, buildB.results.modified.horsepower, 'power', 'HP')}
                  </td>
                </tr>
                {/* Torque */}
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 500 }}>{t.torque}</td>
                  <td style={{ padding: '12px 10px' }}>{buildA.results.modified.torque} Nm</td>
                  <td style={{ padding: '12px 10px' }}>{buildB.results.modified.torque} Nm</td>
                  <td style={{ padding: '12px 10px' }}>
                    {renderDiffBadge(buildA.results.modified.torque, buildB.results.modified.torque, 'power', 'Nm')}
                  </td>
                </tr>
                {/* Acceleration */}
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 500 }}>{t.accel}</td>
                  <td style={{ padding: '12px 10px' }}>{buildA.results.modified.acceleration} s</td>
                  <td style={{ padding: '12px 10px' }}>{buildB.results.modified.acceleration} s</td>
                  <td style={{ padding: '12px 10px' }}>
                    {renderDiffBadge(buildA.results.modified.acceleration, buildB.results.modified.acceleration, 'accel', 's')}
                  </td>
                </tr>
                {/* Top Speed */}
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 500 }}>{t.topSpeed}</td>
                  <td style={{ padding: '12px 10px' }}>{buildA.results.modified.topSpeed} km/h</td>
                  <td style={{ padding: '12px 10px' }}>{buildB.results.modified.topSpeed} km/h</td>
                  <td style={{ padding: '12px 10px' }}>
                    {renderDiffBadge(buildA.results.modified.topSpeed, buildB.results.modified.topSpeed, 'speed', 'km/h')}
                  </td>
                </tr>
                {/* Fuel Consumption */}
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 500 }}>{t.fuel}</td>
                  <td style={{ padding: '12px 10px' }}>{buildA.results.modified.fuelConsumption} L</td>
                  <td style={{ padding: '12px 10px' }}>{buildB.results.modified.fuelConsumption} L</td>
                  <td style={{ padding: '12px 10px' }}>
                    {renderDiffBadge(buildA.results.modified.fuelConsumption, buildB.results.modified.fuelConsumption, 'fuel', 'L')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recharts Grouped Comparison Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              {lang === 'ar' ? 'مقارنة تقييم الأداء العام (٠-١٠٠)' : 'Performance Index Comparison (Scale 0-100)'}
            </h4>
            <div style={{ width: '100%', height: '320px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonChartData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ea0a8"
                    tick={{ fill: '#9ea0a8', fontSize: 11, fontFamily: lang === 'ar' ? 'Cairo' : 'Outfit' }}
                  />
                  <YAxis 
                    stroke="#9ea0a8"
                    tick={{ fill: '#9ea0a8', fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#13131c',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#f5f5f7',
                      fontFamily: lang === 'ar' ? 'Cairo' : 'Outfit',
                      borderRadius: '8px'
                    }}
                  />
                  <RechartsLegend 
                    wrapperStyle={{
                      paddingTop: 10,
                      fontSize: 12,
                      fontFamily: lang === 'ar' ? 'Cairo' : 'Outfit'
                    }}
                  />
                  <Bar dataKey={buildA.name} fill="#ff5500" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={buildB.name} fill="#00f0ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};
