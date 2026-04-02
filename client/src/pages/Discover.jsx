import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, Users, UserPlus, Dumbbell, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Discover.css';

const goalMap = { strength: '💪 Strength', muscle: '🏋️ Muscle', endurance: '🏃 Endurance', weight_loss: '🔥 Fat Loss', general: '⚡ General' };

export default function Discover() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState({});

  const searchUsers = async (q) => {
    if (!q.trim()) { setUsers([]); return; }
    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${q}`);
      setUsers(res.data.users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => searchUsers(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleFollow = async (userId) => {
    try {
      const res = await api.post(`/users/${userId}/follow`);
      setFollowing(prev => ({ ...prev, [userId]: res.data.following }));
      toast.success(res.data.following ? 'Following!' : 'Unfollowed');
    } catch (e) { toast.error('Failed'); }
  };

  const isFollowing = (userId) => {
    if (following[userId] !== undefined) return following[userId];
    return me?.following?.includes(userId);
  };

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">DISCOVER</h1>
          <p className="page-subtitle">Find athletes to train with</p>
        </div>

        {/* Search */}
        <div className="discover-search">
          <div style={{ position: 'relative', maxWidth: '500px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or username..."
              style={{ paddingLeft: '40px', fontSize: '15px', padding: '14px 14px 14px 40px' }}
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner" />
          </div>
        )}

        {!loading && search && users.length === 0 && (
          <div className="discover-empty">
            <Users size={40} color="var(--text-muted)" />
            <p>No users found for "{search}"</p>
          </div>
        )}

        {users.length > 0 && (
          <div className="discover-results">
            {users.map(u => {
              const initials = u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={u._id} className="discover-card">
                  <Link to={`/profile/${u.username}`} className="discover-card-main">
                    <div className="avatar avatar-lg" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                      {initials}
                    </div>
                    <div className="discover-info">
                      <h3 className="discover-name">{u.name}</h3>
                      <p className="discover-handle">@{u.username}</p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span className="discover-meta"><Dumbbell size={12} /> {u.totalWorkouts || 0} workouts</span>
                        <span className="discover-meta"><Users size={12} /> {u.followers?.length || 0} followers</span>
                        {u.fitnessGoal && <span className="discover-meta">{goalMap[u.fitnessGoal]}</span>}
                      </div>
                    </div>
                  </Link>
                  {u._id !== me?._id && (
                    <button
                      className={`btn btn-sm ${isFollowing(u._id) ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleFollow(u._id)}
                    >
                      {isFollowing(u._id) ? 'Following' : <><UserPlus size={14} /> Follow</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!search && (
          <div className="discover-prompt">
            <div className="discover-prompt-icon"><Flame size={32} /></div>
            <h3>Find Your Tribe</h3>
            <p>Search for athletes by name or username. Follow them to see their workouts in your feed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
