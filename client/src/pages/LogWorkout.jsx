import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  Plus, Trash2, Search, ChevronDown, ChevronUp, Check,
  Clock, Dumbbell, Trophy, X, Zap
} from 'lucide-react';
import './LogWorkout.css';

const emptySet = () => ({ setNumber: 1, reps: '', weight: '', completed: false });

export default function LogWorkout() {
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [filterMuscle, setFilterMuscle] = useState('');
  const [saving, setSaving] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [newPRs, setNewPRs] = useState([]);

  // Auto-timer
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    api.get('/exercises').then(res => setAllExercises(res.data.exercises || []));
  }, []);

  const formatTimer = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const filtered = allExercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroups?.primary?.some(m => m.toLowerCase().includes(search.toLowerCase()));
    const matchMuscle = !filterMuscle || ex.muscleGroups?.primary?.includes(filterMuscle);
    return matchSearch && matchMuscle;
  });

  const muscles = [...new Set(allExercises.flatMap(e => e.muscleGroups?.primary || []))].sort();

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      exercise: ex._id,
      exerciseName: ex.name,
      muscleGroups: ex.muscleGroups,
      sets: [{ ...emptySet(), setNumber: 1 }],
      notes: '',
      expanded: true,
    }]);
    setShowPicker(false);
    setSearch('');
  };

  const removeExercise = (idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSet = (exIdx, setIdx, field, value) => {
    setExercises(prev => {
      const next = [...prev];
      next[exIdx] = {
        ...next[exIdx],
        sets: next[exIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, [field]: value } : s
        ),
      };
      return next;
    });
  };

  const addSet = (exIdx) => {
    setExercises(prev => {
      const next = [...prev];
      const sets = next[exIdx].sets;
      const last = sets[sets.length - 1];
      next[exIdx] = {
        ...next[exIdx],
        sets: [...sets, {
          setNumber: sets.length + 1,
          reps: last.reps,
          weight: last.weight,
          completed: false,
        }],
      };
      return next;
    });
  };

  const removeSet = (exIdx, setIdx) => {
    setExercises(prev => {
      const next = [...prev];
      next[exIdx] = {
        ...next[exIdx],
        sets: next[exIdx].sets.filter((_, i) => i !== setIdx).map((s, i) => ({ ...s, setNumber: i + 1 })),
      };
      return next;
    });
  };

  const toggleExpanded = (idx) => {
    setExercises(prev => prev.map((ex, i) =>
      i === idx ? { ...ex, expanded: !ex.expanded } : ex
    ));
  };

  const totalVolume = exercises.reduce((sum, ex) =>
    sum + ex.sets.reduce((s2, set) =>
      s2 + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
    ), 0
  );

  const handleSave = async () => {
    if (exercises.length === 0) { toast.error('Add at least one exercise'); return; }
    setSaving(true);
    try {
      const payload = {
        title: title || `Workout — ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`,
        duration: parseInt(duration) || Math.round(timer / 60) || 0,
        notes,
        isPublic,
        exercises: exercises.map(ex => ({
          exercise: ex.exercise,
          exerciseName: ex.exerciseName,
          notes: ex.notes,
          sets: ex.sets.map((s, i) => ({
            setNumber: i + 1,
            reps: parseInt(s.reps) || 0,
            weight: parseFloat(s.weight) || 0,
            completed: s.completed,
          })),
        })),
      };
      const res = await api.post('/workouts', payload);
      if (res.data.newPRs?.length > 0) setNewPRs(res.data.newPRs);
      else { toast.success('Workout logged! 💪'); navigate('/dashboard'); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      {/* PR Celebration Modal */}
      {newPRs.length > 0 && (
        <div className="modal-overlay" onClick={() => { navigate('/dashboard'); }}>
          <div className="modal pr-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="pr-celebration">
              <div className="pr-trophy">🏆</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', color: 'var(--gold)' }}>NEW PR!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>You crushed your personal records!</p>
              <div className="pr-tags">
                {newPRs.map((pr, i) => (
                  <span key={i} className="badge badge-gold" style={{ fontSize: '14px', padding: '8px 16px' }}>
                    🎯 {pr}
                  </span>
                ))}
              </div>
              <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: '28px' }}
                onClick={() => navigate('/dashboard')}>
                Keep Crushing It →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-content">
        {/* Header */}
        <div className="log-header">
          <div>
            <h1 className="page-title">LOG WORKOUT</h1>
            <p className="page-subtitle">Build your session, crush your PRs</p>
          </div>
          <div className="log-header-actions">
            {/* Timer */}
            <div className="workout-timer" onClick={() => setTimerRunning(r => !r)}>
              <Clock size={14} />
              <span className={timerRunning ? 'timer-running' : ''}>{formatTimer(timer)}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{timerRunning ? 'RUNNING' : 'TAP TO START'}</span>
            </div>
            {totalVolume > 0 && (
              <div className="volume-badge">
                <Zap size={13} />
                <span>{Math.round(totalVolume).toLocaleString()}kg</span>
              </div>
            )}
          </div>
        </div>

        {/* Workout meta */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="log-meta">
            <div className="form-group" style={{ flex: 3 }}>
              <label>Workout Name</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Push Day / Chest & Triceps" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Duration (min)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60" min="1" />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Visibility</label>
              <button
                type="button"
                className={`btn ${isPublic ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setIsPublic(p => !p)}
              >
                {isPublic ? '🌍 Public' : '🔒 Private'}
              </button>
            </div>
          </div>
        </div>

        {/* Exercise list */}
        <div className="exercise-list">
          {exercises.map((ex, exIdx) => (
            <div key={exIdx} className="exercise-card">
              {/* Exercise header */}
              <div className="exercise-header">
                <div className="ex-header-left">
                  <div className="ex-number">{exIdx + 1}</div>
                  <div>
                    <h3 className="ex-name">{ex.exerciseName}</h3>
                    <div className="ex-muscles">
                      {ex.muscleGroups?.primary?.map(m => (
                        <span key={m} className="badge badge-accent" style={{ fontSize: '10px' }}>{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleExpanded(exIdx)}>
                    {ex.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeExercise(exIdx)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {ex.expanded && (
                <>
                  {/* Sets table */}
                  <div className="sets-table">
                    <div className="sets-header">
                      <span>SET</span>
                      <span>WEIGHT (KG)</span>
                      <span>REPS</span>
                      <span>VOL</span>
                      <span>✓</span>
                      <span></span>
                    </div>
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className={`set-row ${set.completed ? 'completed' : ''}`}>
                        <span className="set-num">{set.setNumber}</span>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                          placeholder="0"
                          min="0" step="0.5"
                          className="set-input"
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="set-input"
                        />
                        <span className="set-vol">
                          {set.weight && set.reps ? `${Math.round(parseFloat(set.weight) * parseInt(set.reps))}` : '—'}
                        </span>
                        <button
                          className={`set-check ${set.completed ? 'done' : ''}`}
                          onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                        >
                          <Check size={13} />
                        </button>
                        <button className="set-delete" onClick={() => removeSet(exIdx, setIdx)} disabled={ex.sets.length === 1}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="add-set-btn" onClick={() => addSet(exIdx)}>
                    <Plus size={14} /> Add Set
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add Exercise button */}
        <button className="add-exercise-btn" onClick={() => setShowPicker(true)}>
          <Plus size={20} />
          Add Exercise
        </button>

        {/* Notes */}
        {exercises.length > 0 && (
          <div className="card" style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Workout Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it go? Any PRs?" rows={3} style={{ resize: 'vertical' }} />
          </div>
        )}

        {/* Save */}
        {exercises.length > 0 && (
          <div className="log-save-bar">
            <div className="log-summary">
              <span><strong>{exercises.length}</strong> exercises</span>
              <span>·</span>
              <span><strong>{exercises.reduce((s, e) => s + e.sets.length, 0)}</strong> sets</span>
              {totalVolume > 0 && <><span>·</span><span><strong>{Math.round(totalVolume).toLocaleString()}kg</strong> total volume</span></>}
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Trophy size={18} />}
              {saving ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        )}
      </div>

      {/* Exercise Picker Modal */}
      {showPicker && (
        <div className="modal-overlay" onClick={() => setShowPicker(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-primary)' }}>Add Exercise</h3>
              <button onClick={() => setShowPicker(false)} className="btn btn-ghost btn-sm"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." style={{ paddingLeft: '36px' }} autoFocus />
                </div>
                <select value={filterMuscle} onChange={e => setFilterMuscle(e.target.value)} style={{ width: 'auto' }}>
                  <option value="">All muscles</option>
                  {muscles.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="ex-picker-list">
                {filtered.slice(0, 30).map(ex => (
                  <button key={ex._id} className="ex-picker-item" onClick={() => addExercise(ex)}>
                    <div className="ex-picker-icon"><Dumbbell size={16} /></div>
                    <div>
                      <div className="ex-picker-name">{ex.name}</div>
                      <div className="ex-picker-muscles">
                        {ex.muscleGroups?.primary?.join(', ')} · <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{ex.difficulty}</span>
                      </div>
                    </div>
                    <Plus size={16} style={{ color: 'var(--accent)', marginLeft: 'auto' }} />
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No exercises found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
