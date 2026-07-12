import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, UserPlus, LogIn, Wrench } from 'lucide-react';

interface AuthPortalProps {
  onLoginSuccess: (username: string) => void;
  t: any;
  lang: 'en' | 'ar';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onLoginSuccess, t, lang }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setError(t.errorEmptyFields);
      return;
    }

    // Retrieve users list
    const cachedUsers = localStorage.getItem('tuning_lab_users');
    const usersList: any[] = cachedUsers ? JSON.parse(cachedUsers) : [];

    if (mode === 'register') {
      const userExists = usersList.some(u => u.username.toLowerCase() === trimmedUser.toLowerCase());
      if (userExists) {
        setError(t.errorUserExists);
        return;
      }

      // Add new user
      usersList.push({ username: trimmedUser, password });
      localStorage.setItem('tuning_lab_users', JSON.stringify(usersList));
      setSuccess(t.successRegister);
      setMode('login');
      setUsername('');
      setPassword('');
    } else {
      // Login mode
      const matchedUser = usersList.find(
        u => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === password
      );

      if (matchedUser) {
        onLoginSuccess(matchedUser.username);
      } else {
        setError(t.errorInvalidCredentials);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        padding: '20px'
      }}
    >
      <div
        className="neon-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 12px 48px 0 rgba(0, 0, 0, 0.6)',
          borderTop: '3px solid var(--color-orange)'
        }}
      >
        {/* Brand Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 85, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 85, 0, 0.2)'
            }}
          >
            <Wrench size={30} style={{ color: 'var(--color-orange)' }} className="brand-icon" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{t.appTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Form header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {mode === 'login' ? t.login : t.register}
          </h3>
          {mode === 'login' ? <LogIn size={18} style={{ color: 'var(--color-orange)' }} /> : <UserPlus size={18} style={{ color: 'var(--color-cyan)' }} />}
        </div>

        {/* Message banners */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.2)', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.2)', color: 'var(--color-success)', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {t.username}
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={lang === 'ar' ? 'ادخل اسم المستخدم' : 'e.g. Skyline_GTR'}
              style={{ background: 'rgba(0,0,0,0.2)' }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {t.password}
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            <span>{mode === 'login' ? t.login : t.register}</span>
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '8px' }}>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
              setSuccess(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-cyan)',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'underline'
            }}
          >
            {mode === 'login' ? t.noAccount : t.haveAccount}
          </button>
        </div>

      </div>
    </div>
  );
};
