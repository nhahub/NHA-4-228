import React, { useState } from 'react';
import { TuningResponse, ModificationType } from '../types';
import { CAR_PRESETS } from './ConfigPanel';
import { ArrowUp, ArrowDown, Zap, Gauge, Flame, Fuel, AlertCircle, CheckCircle2, Award } from 'lucide-react';

interface DashboardProps {
  results: TuningResponse | null;
  t: any;
  selectedPreset: string;
  modifications: ModificationType[];
  setModifications: (m: ModificationType[]) => void;
  lang: 'en' | 'ar';
}

export const Dashboard: React.FC<DashboardProps> = ({
  results,
  t,
  selectedPreset,
  modifications,
  setModifications,
  lang
}) => {
  const [activeGoal, setActiveGoal] = useState<'economy' | 'balanced' | 'maximum' | ''>('');

  if (!results) {
    return (
      <div className="neon-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Configure specifications to see simulator dashboard</p>
      </div>
    );
  }

  const { stock, modified, differences } = results;

  // 1. Image Preview Mappings
  const activeCarPreset = CAR_PRESETS.find(c => c.id === selectedPreset);

  // 2. Cost calculations
  const priceMap: Record<ModificationType, number> = {
    turbo: 2500,
    exhaust: 800,
    ecu: 500,
    intake: 300
  };

  const totalModCost = modifications.reduce((sum, m) => sum + priceMap[m], 0);

  // 3. Goal-based assistant maps
  const goalRecommendations = {
    economy: {
      mods: ['intake'] as ModificationType[],
      desc: lang === 'ar' ? 'ترقية فلتر الهواء الرياضي البارد لتحسين كفاءة استهلاك الوقود ودخول الهواء.' : 'Upgrades the Cold Air Intake to maximize oxygen density and reduce fuel consumption.'
    },
    balanced: {
      mods: ['ecu', 'exhaust'] as ModificationType[],
      desc: lang === 'ar' ? 'دمج ريـماب كمبيوتر المحرك الفاخر مع نظام العادم لرفع الأحصنة دون إجهاد المحرك.' : 'Combines ECU recalibration with a high-flow exhaust system for optimized daily performance.'
    },
    maximum: {
      mods: ['turbo', 'ecu', 'exhaust'] as ModificationType[],
      desc: lang === 'ar' ? 'تجهيز الشاحن التوربيني المتكامل لرفع نسبة ضغط الهواء والعادم ونظام الوقود إلى حد الأداء الأقصى.' : 'Deploys turbocharger upgrades, custom ECU fuel maps, and backpressure reduction.'
    }
  };

  const handleApplyGoal = (goal: 'economy' | 'balanced' | 'maximum') => {
    setActiveGoal(goal);
    setModifications(goalRecommendations[goal].mods);
  };

  // Helper to format values
  const formatDiff = (val: number, pct: number, type: 'accel' | 'speed' | 'fuel' | 'power' | 'score') => {
    const isImprovement = 
      (type === 'accel' && val > 0) || 
      (type === 'speed' && val > 0) || 
      (type === 'power' && val > 0) ||
      (type === 'score' && val > 0) ||
      (type === 'fuel' && val < 0); // lower fuel consumption is better

    const isWorse = 
      (type === 'accel' && val < 0) || 
      (type === 'speed' && val < 0) || 
      (type === 'power' && val < 0) ||
      (type === 'score' && val < 0) ||
      (type === 'fuel' && val > 0);

    const sign = val > 0 ? '+' : '';
    const badgeClass = isImprovement ? 'better' : isWorse ? 'worse' : 'neutral';
    const statusText = isImprovement ? t.improved : isWorse ? t.compromised : t.noChange;

    return (
      <div className={`diff-badge ${badgeClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {isImprovement ? <ArrowUp size={12} /> : isWorse ? <ArrowDown size={12} /> : null}
        <span>{sign}{val} ({sign}{pct}%)</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>• {statusText}</span>
      </div>
    );
  };

  // Circular gauge setup
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (modified.performanceScore / 100) * circumference;

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

      {/* Row 1: Vehicle Image Preview & Performance Score Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Vehicle Image Preview Card */}
        <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '220px', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            🚘 {lang === 'ar' ? 'معاينة السيارة النشطة' : 'Active Vehicle Preview'}
          </h3>
          
          {activeCarPreset ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
              <img 
                src={activeCarPreset.image} 
                alt={t[activeCarPreset.nameKey]} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '110px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(255, 85, 0, 0.2))',
                  borderRadius: '6px'
                }} 
              />
              <strong style={{ color: 'var(--color-orange)', fontSize: '1rem' }}>
                {t[activeCarPreset.nameKey]}
              </strong>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', background: 'rgba(0,0,0,0.1)' }}>
              <div 
                style={{ 
                  width: '100%', 
                  height: '70px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
                  border: '1px solid rgba(255,255,255,0.03)',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px' }}>
                  [ {lang === 'ar' ? 'مخطط مخصص' : 'BLUEPRINT GRID'} ]
                </span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t.customCar}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
                {lang === 'ar' ? 'مواصفات مدخلة يدوياً. اختر سيارة جاهزة لتفعيل الصور.' : 'Manually entered values. Select a vehicle preset for visual model.'}
              </span>
            </div>
          )}
        </div>

        {/* Performance Score Dial Card */}
        <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '220px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            ✨ {t.perfScore}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1 }}>
            
            {/* SVG Circular Dial */}
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background path */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Foreground path */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="var(--color-cyan)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              {/* Score text in center */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-cyan)', lineHeight: 1 }}>
                  {modified.performanceScore}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                  / 100
                </span>
              </div>
            </div>

            {/* Rating Category and stock compare details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.scoreRatingLabel}:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Award size={16} style={{ color: 'var(--color-warning)' }} />
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-warning)' }}>
                    {t[`rating_${modified.performanceRating}`]}
                  </strong>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t.stock}: {stock.performanceScore} pts
                </div>
                <div style={{ marginTop: '4px' }}>
                  {formatDiff(differences.performanceScore, differences.performanceScorePct, 'score')}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Row 2: Metrics Grid (Original parameters) */}
      <div className="metrics-grid">
        
        {/* Horsepower */}
        <div className="metric-card" style={{ borderLeft: '3px solid var(--color-orange)' }}>
          <div className="metric-header">
            <span>{t.horsepower}</span>
            <Flame size={18} style={{ color: 'var(--color-orange)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="metric-value-container">
                <span className="metric-value" style={{ color: 'var(--color-orange)' }}>{modified.horsepower}</span>
                <span className="metric-unit">{t.hpUnit}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t.stock}: {stock.horsepower} {t.hpUnit}
              </span>
            </div>
            {formatDiff(differences.horsepower, differences.horsepowerPct, 'power')}
          </div>
        </div>

        {/* Torque */}
        <div className="metric-card" style={{ borderLeft: '3px solid var(--color-cyan)' }}>
          <div className="metric-header">
            <span>{t.torque}</span>
            <Zap size={18} style={{ color: 'var(--color-cyan)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="metric-value-container">
                <span className="metric-value" style={{ color: 'var(--color-cyan)' }}>{modified.torque}</span>
                <span className="metric-unit">{t.nmUnit}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t.stock}: {stock.torque} {t.nmUnit}
              </span>
            </div>
            {formatDiff(differences.torque, differences.torquePct, 'power')}
          </div>
        </div>

        {/* Acceleration */}
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

        {/* Fuel consumption */}
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

      {/* Row 3: Modification Cost Summary & Tuning Goal Assistant Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Cost Summary Card */}
        <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            💰 {t.costSummary}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
            {(Object.keys(priceMap) as ModificationType[]).map((key) => {
              const isActive = modifications.includes(key);
              return (
                <div 
                  key={key} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontSize: '0.85rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: isActive ? 'rgba(0, 240, 255, 0.02)' : 'transparent'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    <CheckCircle2 size={14} style={{ color: isActive ? 'var(--color-success)' : 'rgba(255,255,255,0.1)' }} />
                    {t[key]}
                  </span>
                  <span style={{ fontWeight: 600, color: isActive ? 'var(--color-cyan)' : 'var(--text-muted)' }}>
                    ${priceMap[key]}
                  </span>
                </div>
              );
            })}

            <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0', paddingTop: '4px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 85, 0, 0.05)', border: '1px solid rgba(255, 85, 0, 0.1)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-orange)' }}>{t.totalCost}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-orange)' }}>
                ${totalModCost}
              </span>
            </div>
          </div>
        </div>

        {/* recommended Build Goal Assistant Card */}
        <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            🛠️ {t.buildAssistant}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
            {/* Goal selectors buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['economy', 'balanced', 'maximum'] as const).map((goal) => {
                const isActive = activeGoal === goal;
                return (
                  <button
                    key={goal}
                    onClick={() => handleApplyGoal(goal)}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      fontSize: '0.75rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      textAlign: 'center',
                      borderColor: isActive ? 'var(--color-cyan)' : 'rgba(255,255,255,0.05)',
                      background: isActive ? 'rgba(0, 240, 255, 0.05)' : 'rgba(0,0,0,0.1)',
                      color: isActive ? 'var(--color-cyan)' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 0 10px rgba(0, 240, 255, 0.1)' : 'none'
                    }}
                  >
                    {goal === 'economy' ? t.goal_economy : goal === 'balanced' ? t.goal_balanced : t.goal_maximum}
                  </button>
                );
              })}
            </div>

            {/* Goal recommendation details display */}
            {activeGoal ? (
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {t.recommendedMods}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-cyan)' }}>
                    {goalRecommendations[activeGoal].mods.map(m => t[m]).join(' + ')}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.35, margin: 0 }}>
                  {goalRecommendations[activeGoal].desc}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', flex: 1, justifyContent: 'center' }}>
                <AlertCircle size={14} />
                <span>{t.selectGoal}</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
