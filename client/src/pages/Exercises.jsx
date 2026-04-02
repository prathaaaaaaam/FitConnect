import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Dumbbell, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import './Exercises.css';

const MUSCLES = ['Chest','Back','Lats','Shoulders','Biceps','Triceps','Quadriceps','Hamstrings','Glutes','Calves','Abs','Core'];
const CATEGORIES = ['strength','cardio','plyometrics','flexibility','balance'];
const DIFFICULTIES = ['beginner','intermediate','advanced'];

const diffColor = { beginner: 'var(--green)', intermediate: 'var(--gold)', advanced: '#EF4444' };

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (muscle) params.set('muscle', muscle);
    if (category) params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);
    setLoading(true);
    api.get(`/exercises?${params}`)
      .then(res => setExercises(res.data.exercises || []))
      .finally(() => setLoading(false));
  }, [muscle, category, difficulty]);

  const filtered = exercises.filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.muscleGroups?.primary?.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  const clearFilters = () => { setMuscle(''); setCategory(''); setDifficulty(''); setSearch(''); };
  const hasFilters = muscle || category || difficulty || search;

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">EXERCISE LIBRARY</h1>
          <p className="page-subtitle">{exercises.length}+ exercises with muscle guides</p>
        </div>

        {/* Filters */}
        <div className="ex-filters">
          <div style={{ position: 'relative', flex: 2 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises or muscle groups..." style={{ paddingLeft: '36px' }} />
          </div>
          <select value={muscle} onChange={e => setMuscle(e.target.value)} style={{ flex: 1 }}>
            <option value="">All Muscles</option>
            {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1 }}>
            <option value="">All Types</option>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
          </select>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ flex: 1 }}>
            <option value="">All Levels</option>
            {DIFFICULTIES.map(d => <option key={d} value={d} style={{ textTransform: 'capitalize' }}>{d}</option>)}
          </select>
          {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>}
        </div>

        {/* Results count */}
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> exercises
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="ex-grid">
            {filtered.map(ex => (
              <div key={ex._id} className={`ex-card ${expanded === ex._id ? 'expanded' : ''}`}>
                <div className="ex-card-header" onClick={() => setExpanded(expanded === ex._id ? null : ex._id)}>
                  <div className="ex-card-icon">
                    <Dumbbell size={18} />
                  </div>
                  <div className="ex-card-info">
                    <h3 className="ex-card-name">{ex.name}</h3>
                    <div className="ex-card-meta">
                      <span style={{ color: diffColor[ex.difficulty], fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {ex.difficulty}
                      </span>
                      <span className="ex-dot">·</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{ex.category}</span>
                    </div>
                  </div>
                  <div className="ex-card-muscles">
                    {ex.muscleGroups?.primary?.slice(0, 2).map(m => (
                      <span key={m} className="badge badge-accent" style={{ fontSize: '10px' }}>{m}</span>
                    ))}
                  </div>
                  <button className="btn btn-ghost btn-sm">
                    {expanded === ex._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {expanded === ex._id && (
                  <div className="ex-card-detail animate-fade">
                    <div className="divider" />

                    {/* Muscle groups */}
                    <div className="ex-detail-section">
                      <h4>Muscles Worked</h4>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {ex.muscleGroups?.primary?.map(m => (
                          <span key={m} className="badge badge-accent">{m}</span>
                        ))}
                        {ex.muscleGroups?.secondary?.map(m => (
                          <span key={m} className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '12px' }}>{m}</span>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    {ex.equipment?.length > 0 && (
                      <div className="ex-detail-section">
                        <h4>Equipment</h4>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {ex.equipment.map(e => (
                            <span key={e} className="badge badge-blue">{e}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    {ex.instructions?.length > 0 && (
                      <div className="ex-detail-section">
                        <h4>How to Perform</h4>
                        <ol className="ex-instructions">
                          {ex.instructions.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
                <Dumbbell size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <p>No exercises found. Try different filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
