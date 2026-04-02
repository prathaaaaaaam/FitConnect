import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, Eye, EyeOff, Dumbbell, TrendingUp, Users } from 'lucide-react';
import './AuthPage.css';

const GOALS = [
  { value: 'strength', label: '💪 Strength' },
  { value: 'muscle', label: '🏋️ Muscle' },
  { value: 'endurance', label: '🏃 Endurance' },
  { value: 'weight_loss', label: '🔥 Fat Loss' },
  { value: 'general', label: '⚡ General' },
];

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', fitnessGoal: 'general' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-logo">
            <div className="logo-icon"><Zap size={20} fill="currentColor" /></div>
            <span className="logo-text">FIT<span style={{ color: 'var(--accent)' }}>CONNECT</span></span>
          </div>
          <h1 className="auth-headline">
            TRAIN.<br />TRACK.<br /><span>CONNECT.</span>
          </h1>
          <p className="auth-tagline">The only fitness platform that combines serious workout tracking with real social accountability.</p>
          <div className="auth-features">
            {[
              { icon: <Dumbbell size={16} />, text: '500+ exercise library with form guides' },
              { icon: <TrendingUp size={16} />, text: 'Auto-detect personal records & celebrate PRs' },
              { icon: <Users size={16} />, text: 'Train with a community that pushes you' },
            ].map((f, i) => (
              <div key={i} className="auth-feature">
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
          {/* Decorative */}
          <div className="auth-decoration">
            {['BENCH 140KG', 'DEADLIFT 200KG', 'SQUAT 160KG', '42 DAY STREAK'].map((t, i) => (
              <div key={i} className="auth-deco-tag">{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
            <p>{isLogin ? "Log in to your FitConnect account" : "Join thousands of athletes tracking their gains"}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" required />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input value={form.username} onChange={e => set('username', e.target.value.toLowerCase())} placeholder="johnsmith" required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Fitness Goal</label>
                <div className="goal-grid">
                  {GOALS.map(g => (
                    <button
                      key={g.value}
                      type="button"
                      className={`goal-btn ${form.fitnessGoal === g.value ? 'selected' : ''}`}
                      onClick={() => set('fitnessGoal', g.value)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : null}
              {isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? (
              <p>New to FitConnect? <Link to="/register">Create account →</Link></p>
            ) : (
              <p>Already have an account? <Link to="/login">Sign in →</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
