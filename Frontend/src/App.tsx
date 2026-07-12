import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DrivetrainType, ModificationType, TuningResponse, SavedBuild, SimHistoryEntry } from './types';
import { translations, Language } from './i18n/translations';
import { ConfigPanel, CAR_PRESETS } from './components/ConfigPanel';
import { Dashboard } from './components/Dashboard';
import { Charts } from './components/Charts';
import { BuildHistory } from './components/BuildHistory';
import { PDFExport } from './components/PDFExport';
import { CompareBuilds } from './components/CompareBuilds';
import { AuthPortal } from './components/AuthPortal';
import { SimulationHistory } from './components/SimulationHistory';
import { Wrench, Globe, ShieldAlert } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/calculate';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // Config State
  const [weight, setWeight] = useState<number>(1400);
  const [horsepower, setHorsepower] = useState<number>(180);
  const [torque, setTorque] = useState<number>(220);
  const [drivetrain, setDrivetrain] = useState<DrivetrainType>('FWD');
  const [modifications, setModifications] = useState<ModificationType[]>([]);

  // App logic state
  const [results, setResults] = useState<TuningResponse | null>(null);
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [simHistory, setSimHistory] = useState<SimHistoryEntry[]>([]);

  // Load user and associated builds from local storage on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('tuning_lab_current_user');
    if (cachedUser) {
      setCurrentUser(cachedUser);
      
      const cachedBuilds = localStorage.getItem('tuning_lab_builds');
      if (cachedBuilds) {
        try {
          const allBuilds: SavedBuild[] = JSON.parse(cachedBuilds);
          setSavedBuilds(allBuilds.filter(b => b.username === cachedUser));
        } catch (err) {
          console.error('Failed to parse cached builds', err);
        }
      }

      const cachedSims = localStorage.getItem(`tuning_sim_history_${cachedUser}`);
      if (cachedSims) {
        try {
          setSimHistory(JSON.parse(cachedSims));
        } catch (err) {
          console.error('Failed to parse sim history', err);
        }
      }
    }
  }, []);

  // Update HTML body direction when language changes
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Real-time calculations effect
  useEffect(() => {
    const isWeightValid = weight >= 300 && weight <= 8000;
    const isHpValid = horsepower >= 20 && horsepower <= 4000;
    const isTorqueValid = torque >= 20 && torque <= 4000;

    if (!isWeightValid || !isHpValid || !isTorqueValid) {
      setResults(null);
      return;
    }

    const calculate = async () => {
      setError(null);
      try {
        const response = await axios.post<TuningResponse>(API_URL, {
          weight,
          horsepower,
          torque,
          drivetrain,
          modifications
        });
        setResults(response.data);
      } catch (err: any) {
        console.warn('Backend server calculation failed. Running local physics fallback estimation...', err);
        setError(t.serverError);
        // Fallback calculations directly on client if backend server is not running
        const simulatedResults = localPhysicsFallback(weight, horsepower, torque, drivetrain, modifications);
        setResults(simulatedResults);
      }
    };

    const debounceTimeout = setTimeout(calculate, 250); // 250ms debounce
    return () => clearTimeout(debounceTimeout);
  }, [weight, horsepower, torque, drivetrain, modifications, lang]);

  // Local physical formula fallback if server is offline
  const localPhysicsFallback = (
    w: number,
    hp: number,
    tq: number,
    drive: DrivetrainType,
    mods: ModificationType[]
  ): TuningResponse => {
    const getRating = (score: number) => {
      if (score <= 40) return 'Basic';
      if (score <= 60) return 'Street';
      if (score <= 80) return 'Sport';
      if (score <= 90) return 'Track';
      return 'Race';
    };

    const getScore = (hpVal: number, torqueVal: number, accel: number, speed: number, fuel: number) => {
      const normHP = Math.min(100, Math.max(0, (hpVal / 800) * 100));
      const normTorque = Math.min(100, Math.max(0, (torqueVal / 800) * 100));
      const normSpeed = Math.min(100, Math.max(0, (speed / 400) * 100));
      const normAccel = Math.min(100, Math.max(0, ((15 - accel) / 13) * 100));
      const normFuel = Math.min(100, Math.max(0, ((20 - fuel) / 16) * 100));
      return Math.round((normHP + normTorque + normSpeed + normAccel + normFuel) / 5);
    };

    const calculateStats = (weightVal: number, hpVal: number, torqueVal: number): any => {
      const powerFactor = hpVal * 0.8 + torqueVal * 0.1;
      const accelBase = weightVal / powerFactor;
      
      let driveFactor = 1.0;
      if (drive === 'FWD') driveFactor = 1.08 + 0.12 * (hpVal / 300);
      else if (drive === 'RWD') driveFactor = 1.02 + 0.04 * (hpVal / 300);
      else driveFactor = 0.94 + 0.01 * (hpVal / 300);

      let acceleration = accelBase * driveFactor;
      const floor = drive === 'AWD' ? 1.9 : drive === 'RWD' ? 2.3 : 2.8;
      if (acceleration < floor) {
        acceleration = floor + (acceleration - floor) * 0.2;
      }

      const topSpeed = 38.2 * Math.pow(hpVal, 0.3333) + 15 * (torqueVal / weightVal);
      const fuelConsumption = 3.5 + (weightVal * 0.0012) + (hpVal * 0.006) + (torqueVal * 0.003);

      const scoreVal = getScore(hpVal, torqueVal, acceleration, topSpeed, fuelConsumption);

      return {
        acceleration: Math.round(acceleration * 100) / 100,
        topSpeed: Math.round(topSpeed),
        fuelConsumption: Math.round(fuelConsumption * 10) / 10,
        horsepower: hpVal,
        torque: torqueVal,
        performanceScore: scoreVal,
        performanceRating: getRating(scoreVal)
      };
    };

    // Stock stats
    const stock = calculateStats(w, hp, tq);

    // Apply mods
    let modHP = hp;
    let modTorque = tq;
    let modWeight = w;

    if (mods.includes('turbo')) { modHP *= 1.35; modTorque *= 1.30; modWeight += 20; }
    if (mods.includes('ecu')) { modHP *= 1.15; modTorque *= 1.18; }
    if (mods.includes('exhaust')) { modHP *= 1.06; modTorque *= 1.04; modWeight -= 12; }
    if (mods.includes('intake')) { modHP *= 1.03; modTorque *= 1.02; modWeight -= 2; }

    modHP = Math.round(modHP * 10) / 10;
    modTorque = Math.round(modTorque * 10) / 10;
    modWeight = Math.round(modWeight * 10) / 10;

    const modified = calculateStats(modWeight, modHP, modTorque);

    let fuelMult = 1.0;
    if (mods.includes('turbo')) fuelMult *= 1.12;
    if (mods.includes('ecu')) fuelMult *= 1.06;
    if (mods.includes('exhaust')) fuelMult *= 0.98;
    if (mods.includes('intake')) fuelMult *= 0.99;
    modified.fuelConsumption = Math.round(modified.fuelConsumption * fuelMult * 10) / 10;

    const modScoreVal = getScore(modHP, modTorque, modified.acceleration, modified.topSpeed, modified.fuelConsumption);
    modified.performanceScore = modScoreVal;
    modified.performanceRating = getRating(modScoreVal);

    const diffAccel = Math.round((stock.acceleration - modified.acceleration) * 100) / 100;
    const diffAccelPct = Math.round((diffAccel / stock.acceleration) * 1000) / 10;

    const diffTopSpeed = Math.round((modified.topSpeed - stock.topSpeed) * 10) / 10;
    const diffTopSpeedPct = Math.round((diffTopSpeed / stock.topSpeed) * 1000) / 10;

    const diffFuel = Math.round((modified.fuelConsumption - stock.fuelConsumption) * 10) / 10;
    const diffFuelPct = Math.round((diffFuel / stock.fuelConsumption) * 1000) / 10;

    const diffHP = Math.round((modHP - hp) * 10) / 10;
    const diffHPPct = Math.round((diffHP / hp) * 1000) / 10;

    const diffTorque = Math.round((modTorque - tq) * 10) / 10;
    const diffTorquePct = Math.round((diffTorque / tq) * 1000) / 10;

    const diffScore = modified.performanceScore - stock.performanceScore;
    const diffScorePct = stock.performanceScore > 0 ? Math.round((diffScore / stock.performanceScore) * 1000) / 10 : 0;

    return {
      stock,
      modified: { ...modified, horsepower: modHP, torque: modTorque },
      differences: {
        acceleration: diffAccel,
        accelerationPct: diffAccelPct,
        topSpeed: diffTopSpeed,
        topSpeedPct: diffTopSpeedPct,
        fuelConsumption: diffFuel,
        fuelConsumptionPct: diffFuelPct,
        horsepower: diffHP,
        horsepowerPct: diffHPPct,
        torque: diffTorque,
        torquePct: diffTorquePct,
        performanceScore: diffScore,
        performanceScorePct: diffScorePct
      }
    };
  };

  // Build History Actions
  const handleSaveBuild = (name: string) => {
    if (!results || !currentUser) return;
    const newBuild: SavedBuild = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      username: currentUser,
      weight,
      horsepower,
      torque,
      drivetrain,
      modifications,
      results,
      createdAt: new Date().toISOString()
    };

    const cached = localStorage.getItem('tuning_lab_builds');
    const allBuilds: SavedBuild[] = cached ? JSON.parse(cached) : [];
    const updatedFull = [newBuild, ...allBuilds];
    
    localStorage.setItem('tuning_lab_builds', JSON.stringify(updatedFull));
    setSavedBuilds(updatedFull.filter(b => b.username === currentUser));
  };

  const handleDeleteBuild = (id: string) => {
    if (!currentUser) return;
    const cached = localStorage.getItem('tuning_lab_builds');
    const allBuilds: SavedBuild[] = cached ? JSON.parse(cached) : [];
    const updatedFull = allBuilds.filter(b => b.id !== id);

    localStorage.setItem('tuning_lab_builds', JSON.stringify(updatedFull));
    setSavedBuilds(updatedFull.filter(b => b.username === currentUser));
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('tuning_lab_current_user', username);
    
    const cachedBuilds = localStorage.getItem('tuning_lab_builds');
    if (cachedBuilds) {
      try {
        const allBuilds: SavedBuild[] = JSON.parse(cachedBuilds);
        setSavedBuilds(allBuilds.filter(b => b.username === username));
      } catch (err) {
        console.error(err);
      }
    } else {
      setSavedBuilds([]);
    }

    const cachedSims = localStorage.getItem(`tuning_sim_history_${username}`);
    setSimHistory(cachedSims ? JSON.parse(cachedSims) : []);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tuning_lab_current_user');
    setSavedBuilds([]);
    setSimHistory([]);
    setSelectedPreset('');
  };

  const handleLoadBuild = (build: SavedBuild) => {
    setWeight(build.weight);
    setHorsepower(build.horsepower);
    setTorque(build.torque);
    setDrivetrain(build.drivetrain);
    setModifications(build.modifications);
    
    const matchedPreset = CAR_PRESETS.find(c => 
      c.weight === build.weight && 
      c.horsepower === build.horsepower && 
      c.torque === build.torque && 
      c.drivetrain === build.drivetrain
    );
    setSelectedPreset(matchedPreset ? matchedPreset.id : '');
  };

  // Log simulation to history when results change and stabilize
  useEffect(() => {
    if (!results || !currentUser) return;
    
    const historyKey = `tuning_sim_history_${currentUser}`;
    const cached = localStorage.getItem(historyKey);
    const historyList: SimHistoryEntry[] = cached ? JSON.parse(cached) : [];
    
    // De-duplicate consecutive identical runs
    const latest = historyList[0];
    const isDuplicate = latest && 
      latest.weight === weight &&
      latest.horsepower === horsepower &&
      latest.torque === torque &&
      latest.drivetrain === drivetrain &&
      JSON.stringify(latest.modifications.sort()) === JSON.stringify(modifications.sort());
      
    if (isDuplicate) return;

    const newEntry: SimHistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      weight,
      horsepower,
      torque,
      drivetrain,
      modifications,
      results,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const updated = [newEntry, ...historyList].slice(0, 10);
    setSimHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  }, [results]);

  const handleReloadSim = (entry: SimHistoryEntry) => {
    setWeight(entry.weight);
    setHorsepower(entry.horsepower);
    setTorque(entry.torque);
    setDrivetrain(entry.drivetrain);
    setModifications(entry.modifications);
    
    const matchedPreset = CAR_PRESETS.find(c => 
      c.weight === entry.weight && 
      c.horsepower === entry.horsepower && 
      c.torque === entry.torque && 
      c.drivetrain === entry.drivetrain
    );
    setSelectedPreset(matchedPreset ? matchedPreset.id : '');
  };

  const handleClearHistory = () => {
    if (!currentUser) return;
    setSimHistory([]);
    localStorage.removeItem(`tuning_sim_history_${currentUser}`);
  };

  if (!currentUser) {
    return (
      <div className="container">
        {/* Header */}
        <header>
          <div className="brand-section">
            <Wrench size={32} className="brand-icon" />
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1px' }}>
                {t.appTitle}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="btn-secondary"
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Globe size={16} />
            <span style={{ fontWeight: 600 }}>{t.languageLabel}</span>
          </button>
        </header>

        <AuthPortal onLoginSuccess={handleLogin} t={t} lang={lang} />
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div className="brand-section">
          <Wrench size={32} className="brand-icon" />
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1px' }}>
              {t.appTitle}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Actions panel: Language + User welcome / Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '30px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.welcome}, <strong style={{ color: 'var(--color-orange)' }}>{currentUser}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>{t.logout}</span>
            </button>
          </div>

          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="btn-secondary"
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Globe size={16} />
            <span style={{ fontWeight: 600 }}>{t.languageLabel}</span>
          </button>
        </div>
      </header>

      {/* Warning/Error overlay fallback banner */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(255, 179, 0, 0.1)',
            border: '1px solid rgba(255, 179, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: 'var(--color-warning)',
            fontSize: '0.9rem'
          }}
        >
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="main-layout">
        
        {/* Left column: Configurations */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ConfigPanel
            weight={weight}
            setWeight={setWeight}
            horsepower={horsepower}
            setHorsepower={setHorsepower}
            torque={torque}
            setTorque={setTorque}
            drivetrain={drivetrain}
            setDrivetrain={setDrivetrain}
            modifications={modifications}
            setModifications={setModifications}
            t={t}
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
          />
          {results && (
            <PDFExport
              results={results}
              weight={weight}
              drivetrain={drivetrain}
              modifications={modifications}
              t={t}
              lang={lang}
            />
          )}
        </aside>

        {/* Right column: Results, Charts, Build comparison */}
        <main className="dashboard-sections">
          <Dashboard 
            results={results} 
            t={t}
            selectedPreset={selectedPreset}
            modifications={modifications}
            setModifications={setModifications}
            lang={lang}
          />
          <Charts results={results} t={t} lang={lang} />
          <BuildHistory
            savedBuilds={savedBuilds}
            onSaveBuild={handleSaveBuild}
            onDeleteBuild={handleDeleteBuild}
            onLoadBuild={handleLoadBuild}
            t={t}
            lang={lang}
          />
          <CompareBuilds
            savedBuilds={savedBuilds}
            t={t}
            lang={lang}
          />
          <SimulationHistory
            simHistory={simHistory}
            onReloadSim={handleReloadSim}
            onClearHistory={handleClearHistory}
            t={t}
            lang={lang}
          />
        </main>
        
      </div>
    </div>
  );
};
