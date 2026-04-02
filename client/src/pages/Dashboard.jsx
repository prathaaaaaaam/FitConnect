import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, Cell
} from 'recharts';
import {
  Dumbbell, TrendingUp, Flame, Trophy, Plus, Clock,
  Target, Zap, Award, Calendar, Activity, Star, CheckCircle
} from 'lucide-react';
import './Dashboard.css';

const ChartTooltip = ({ active, payload, label, unit = 'kg' }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>
        {payload[0].value?.toLocaleString()} {unit}
      </p>
      {payload[1] && <p style={{ color: 'var(--blue)', fontWeight: 600, fontSize: '13px' }}>
        {payload[1].value} workouts
      </p>}
    </div>
  );
  return null;
};

const COLORS = ['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--purple)', 'var(--gold)', '#EC4899', '#06B6D4', '#84CC16'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([api.get('/workouts/stats'), api.get('/workouts/my?limit=5')])
      .then(([s, w]) => { setStats(s.data); setRecentWorkouts(w.data.workouts || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const goalMap = { strength: 'Strength', muscle: 'Muscle Building', endurance: 'Endurance', weight_loss: 'Fat Loss', general: 'General Fitness' };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  const topStatCards = [
    { label: 'Total Workouts', value: stats?.totalWorkouts || 0, icon: <Dumbbell size={20} />, color: 'var(--accent)', sub: `${stats?.workoutsThisMonth || 0} this month` },
    { label: 'Total Volume', value: `${((stats?.totalVolume || 0) / 1000).toFixed(1)}t`, icon: <TrendingUp size={20} />, color: 'var(--blue)', sub: `Avg ${((stats?.avgVolume || 0) / 1000).toFixed(1)}t/session` },
    { label: 'Current Streak', value: `${stats?.currentStreak || 0}d`, icon: <Flame size={20} />, color: 'var(--gold)', sub: `Best: ${stats?.longestStreak || 0} days` },
    { label: 'Personal Records', value: stats?.personalRecords?.length || 0, icon: <Trophy size={20} />, color: 'var(--green)', sub: 'All time PRs' },
    { label: 'Total Sets', value: (stats?.totalSets || 0).toLocaleString(), icon: <Zap size={20} />, color: 'var(--purple)', sub: `${stats?.totalWorkouts ? Math.round(stats.totalSets / stats.totalWorkouts) : 0} avg/session` },
    { label: 'Avg Duration', value: `${stats?.avgDuration || 0}m`, icon: <Clock size={20} />, color: '#EC4899', sub: `${Math.round((stats?.totalDuration || 0) / 60)}h total` },
    { label: 'This Week', value: stats?.workoutsThisWeek || 0, icon: <Calendar size={20} />, color: '#06B6D4', sub: 'workouts logged' },
    { label: 'Consistency', value: `${stats?.consistencyScore || 0}%`, icon: <CheckCircle size={20} />, color: '#84CC16', sub: `${stats?.activeDaysLast30 || 0} active days (30d)` },
  ];

  return (
    <div className="page">
      <div className="page-content">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">DASHBOARD</h1>
            <p className="page-subtitle">Your fitness command center</p>
          </div>
          <Link to="/log" className="btn btn-primary btn-lg"><Plus size={18} />Log Workout</Link>
        </div>

        {/* Hero */}
        <div className="dashboard-hero">
          <div className="profile-bg-glow" />
          <div className="hero-user">
            <div className="avatar avatar-xl" style={{
              background: user?.avatar ? 'transparent' : 'var(--accent-dim)',
              color: 'var(--accent)', fontSize: '32px',
              border: '3px solid var(--accent)', overflow: 'hidden'
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div>
              <h2 className="hero-name">{user?.name}</h2>
              <p className="hero-handle">@{user?.username}</p>
              <div className="hero-goal"><Target size={13} /><span>{goalMap[user?.fitnessGoal]}</span></div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-val">{user?.following?.length || 0}</span><span className="hero-stat-label">Following</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-val">{user?.followers?.length || 0}</span><span className="hero-stat-label">Followers</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-val">{stats?.longestStreak || 0}d</span><span className="hero-stat-label">Best Streak</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-val" style={{ color: stats?.consistencyScore >= 50 ? 'var(--green)' : 'var(--gold)' }}>
                {stats?.consistencyScore || 0}%
              </span>
              <span className="hero-stat-label">Consistency</span>
            </div>
          </div>
        </div>

        {/* Stat cards — 4 col grid */}
        <div className="grid-4" style={{ marginBottom: '24px' }}>
          {topStatCards.map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 50}ms`, animation: 'fadeIn 0.4s ease forwards', opacity: 0 }}>
              <div className="stat-card-icon" style={{ color: s.color, background: s.color + '22' }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="dash-tabs">
          {['overview', 'volume', 'frequency', 'exercises'].map(t => (
            <button key={t} className={`dash-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-charts">
              {/* Weekly Volume Area */}
              <div className="card" style={{ flex: 2 }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Weekly Volume</h3>
                  <span className="badge badge-accent"><Zap size={11} /> Last 10 weeks</span>
                </div>
                {stats?.weeklyVolume?.some(w => w.volume > 0) ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={stats.weeklyVolume}>
                      <defs>
                        <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="volume" stroke="var(--accent)" strokeWidth={2} fill="url(#volGrad)" dot={{ fill: 'var(--accent)', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <div className="empty-chart"><TrendingUp size={32} color="var(--text-muted)" /><p>Log workouts to see your chart</p></div>}
              </div>

              {/* Workouts per week */}
              <div className="card" style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Workouts / Week</h3>
                {stats?.weeklyVolume?.some(w => w.workouts > 0) ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.weeklyVolume} barSize={18}>
                      <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                      <Bar dataKey="workouts" radius={[4, 4, 0, 0]}>
                        {stats.weeklyVolume.map((_, i) => <Cell key={i} fill={i === stats.weeklyVolume.length - 1 ? 'var(--accent)' : 'var(--bg-elevated)'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="empty-chart"><Dumbbell size={32} color="var(--text-muted)" /><p>No data yet</p></div>}
              </div>
            </div>

            {/* Bottom row */}
            <div className="dashboard-bottom">
              {/* Recent workouts */}
              <div className="card" style={{ flex: 2 }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Recent Workouts</h3>
                  <Link to="/feed" className="btn btn-ghost btn-sm">View all →</Link>
                </div>
                {recentWorkouts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Dumbbell size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ marginBottom: '16px' }}>No workouts yet!</p>
                    <Link to="/log" className="btn btn-primary">Log First Workout</Link>
                  </div>
                ) : (
                  <div className="recent-list">
                    {recentWorkouts.map(w => (
                      <div key={w._id} className="recent-item">
                        <div className="recent-icon"><Dumbbell size={16} /></div>
                        <div className="recent-info">
                          <span className="recent-title">{w.title}</span>
                          <span className="recent-meta">{w.exercises?.length} exercises · {w.totalVolume ? `${w.totalVolume}kg` : ''}</span>
                        </div>
                        <div className="recent-right">
                          <div className="flex gap-2 items-center">
                            {w.duration > 0 && <span className="recent-tag"><Clock size={10} /> {w.duration}m</span>}
                            {w.personalRecordsCount > 0 && <span className="recent-tag pr"><Trophy size={10} /> {w.personalRecordsCount} PR</span>}
                          </div>
                          <span className="recent-date">{new Date(w.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Best workout + PRs */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stats?.bestWorkout && (
                  <div className="card best-workout-card">
                    <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                      <Star size={16} color="var(--gold)" />
                      <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Best Workout</h3>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '6px' }}>{stats.bestWorkout.title}</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--gold)' }}>⚡ {stats.bestWorkout.volume?.toLocaleString()}kg</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stats.bestWorkout.exercises} exercises</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(stats.bestWorkout.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                <div className="card" style={{ flex: 1 }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Top PRs</h3>
                    <Award size={16} color="var(--gold)" />
                  </div>
                  {!stats?.personalRecords?.length ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Break some records!</p>
                  ) : (
                    <div className="pr-list">
                      {stats.personalRecords.slice(0, 5).map((pr, i) => (
                        <div key={i} className="pr-item">
                          <div><div className="pr-exercise">{pr.exercise}</div></div>
                          <div className="pr-weight"><span>{pr.weight}kg</span><span className="pr-reps">×{pr.reps}</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── VOLUME TAB ── */}
        {activeTab === 'volume' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 30-day daily volume */}
            <div className="card">
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Daily Volume — Last 30 Days</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.dailyVolume || []} barSize={8}>
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="volume" radius={[3, 3, 0, 0]}>
                    {(stats?.dailyVolume || []).map((d, i) => (
                      <Cell key={i} fill={d.volume > 0 ? 'var(--accent)' : 'var(--bg-elevated)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly summary */}
            <div className="card">
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Monthly Summary — Last 6 Months</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.monthlyWorkouts || []} barSize={32}>
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip unit="workouts" />} />
                  <Bar dataKey="workouts" fill="var(--blue)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Volume stats grid */}
            <div className="grid-4">
              {[
                { label: 'Total Volume Lifted', value: `${(stats?.totalVolume / 1000 || 0).toFixed(2)}t` },
                { label: 'This Month Volume', value: `${(stats?.volumeThisMonth / 1000 || 0).toFixed(2)}t` },
                { label: 'Avg Volume / Session', value: `${(stats?.avgVolume / 1000 || 0).toFixed(2)}t` },
                { label: 'Total Hours Trained', value: `${Math.round(stats?.totalDuration / 60 || 0)}h` },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '28px' }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FREQUENCY TAB ── */}
        {activeTab === 'frequency' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dashboard-charts">
              {/* Day of week */}
              <div className="card" style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Favourite Training Days</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats?.workoutsByDay || []} barSize={28}>
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {(stats?.workoutsByDay || []).map((d, i) => {
                        const max = Math.max(...(stats?.workoutsByDay || []).map(x => x.count));
                        return <Cell key={i} fill={d.count === max ? 'var(--accent)' : 'var(--bg-elevated)'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
                  Orange = your most consistent training day
                </p>
              </div>

              {/* Monthly trend line */}
              <div className="card" style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Monthly Workout Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats?.monthlyWorkouts || []}>
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="workouts" stroke="var(--green)" strokeWidth={2} dot={{ fill: 'var(--green)', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Consistency breakdown */}
            <div className="card">
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Consistency Breakdown</h3>
              <div className="grid-4">
                {[
                  { label: 'This Week', value: stats?.workoutsThisWeek || 0, unit: 'workouts', color: 'var(--accent)' },
                  { label: 'This Month', value: stats?.workoutsThisMonth || 0, unit: 'workouts', color: 'var(--blue)' },
                  { label: 'Active Days (30d)', value: stats?.activeDaysLast30 || 0, unit: 'days', color: 'var(--green)' },
                  { label: 'Consistency Score', value: `${stats?.consistencyScore || 0}%`, unit: 'last 30 days', color: stats?.consistencyScore >= 50 ? 'var(--green)' : 'var(--gold)' },
                ].map((s, i) => (
                  <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
                    <div className="stat-value" style={{ color: s.color, fontSize: '32px' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EXERCISES TAB ── */}
        {activeTab === 'exercises' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dashboard-charts">
              {/* Top exercises bar */}
              <div className="card" style={{ flex: 2 }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Most Trained Exercises</h3>
                {stats?.topExercises?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.topExercises} layout="vertical" barSize={16}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {stats.topExercises.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="empty-chart"><Activity size={32} color="var(--text-muted)" /><p>Log some workouts first</p></div>}
              </div>

              {/* PR list full */}
              <div className="card" style={{ flex: 1 }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>All PRs</h3>
                  <Trophy size={18} color="var(--gold)" />
                </div>
                {!stats?.personalRecords?.length ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Trophy size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: '13px' }}>No PRs yet — get lifting!</p>
                  </div>
                ) : (
                  <div className="pr-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {stats.personalRecords.map((pr, i) => (
                      <div key={i} className="pr-item">
                        <div>
                          <div className="pr-exercise">{pr.exercise}</div>
                          <div className="pr-date">{new Date(pr.date).toLocaleDateString()}</div>
                        </div>
                        <div className="pr-weight">
                          <span>{pr.weight}kg</span>
                          <span className="pr-reps">×{pr.reps}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Volume per exercise */}
            {stats?.topExercises?.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Volume Per Exercise</h3>
                <div className="ex-volume-grid">
                  {stats.topExercises.map((ex, i) => (
                    <div key={i} className="ex-volume-card" style={{ borderColor: COLORS[i % COLORS.length] + '44' }}>
                      <div className="ex-vol-color" style={{ background: COLORS[i % COLORS.length] }} />
                      <div className="ex-vol-name">{ex.name}</div>
                      <div className="ex-vol-stats">
                        <span>{ex.count}× performed</span>
                        <span>{ex.sets} sets total</span>
                        {ex.volume > 0 && <span>{Math.round(ex.volume / 1000 * 10) / 10}t volume</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
