import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  Heart, MessageCircle, Dumbbell, Trophy, Clock, Zap,
  ChevronDown, Users, Flame
} from 'lucide-react';
import './Feed.css';

function WorkoutCard({ workout, onLike }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(workout.comments || []);
  const [likeCount, setLikeCount] = useState(workout.likes?.length || 0);
  const [liked, setLiked] = useState(workout.likes?.includes(user?._id));
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async () => {
    try {
      const res = await api.post(`/workouts/${workout._id}/like`);
      setLikeCount(res.data.likes);
      setLiked(res.data.liked);
    } catch (e) { console.error(e); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/workouts/${workout._id}/comment`, { text: comment });
      setComments(res.data.comments);
      setComment('');
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const initials = workout.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const totalSets = workout.exercises?.reduce((s, e) => s + e.sets.length, 0) || 0;

  return (
    <div className="feed-card animate-fade">
      {/* Header */}
      <div className="feed-card-header">
        <Link to={`/profile/${workout.user?.username}`} className="feed-user">
          <div className="avatar avatar-md" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
            {initials}
          </div>
          <div>
            <span className="feed-user-name">{workout.user?.name}</span>
            <span className="feed-user-handle">@{workout.user?.username}</span>
          </div>
        </Link>
        <div className="feed-time">{timeAgo(workout.createdAt)}</div>
      </div>

      {/* Workout title */}
      <h3 className="feed-workout-title">{workout.title}</h3>

      {/* Stats row */}
      <div className="feed-stats">
        {workout.exercises?.length > 0 && (
          <div className="feed-stat"><Dumbbell size={13} />{workout.exercises.length} exercises</div>
        )}
        {totalSets > 0 && (
          <div className="feed-stat"><Zap size={13} />{totalSets} sets</div>
        )}
        {workout.totalVolume > 0 && (
          <div className="feed-stat"><TrendingUpIcon size={13} />{workout.totalVolume.toLocaleString()}kg</div>
        )}
        {workout.duration > 0 && (
          <div className="feed-stat"><Clock size={13} />{workout.duration}m</div>
        )}
        {workout.personalRecordsCount > 0 && (
          <div className="feed-stat pr"><Trophy size={13} />{workout.personalRecordsCount} PR{workout.personalRecordsCount > 1 ? 's' : ''}</div>
        )}
      </div>

      {/* Exercises preview */}
      {workout.exercises?.length > 0 && (
        <div className="feed-exercises">
          {workout.exercises.slice(0, 4).map((ex, i) => {
            const maxSet = ex.sets?.reduce((best, s) =>
              (s.weight || 0) > (best.weight || 0) ? s : best, ex.sets?.[0] || {}
            );
            return (
              <div key={i} className="feed-exercise-pill">
                <span className="feed-ex-name">{ex.exerciseName}</span>
                {maxSet?.weight > 0 && (
                  <span className="feed-ex-weight">{maxSet.weight}kg × {maxSet.reps}</span>
                )}
              </div>
            );
          })}
          {workout.exercises.length > 4 && (
            <div className="feed-exercise-pill more">+{workout.exercises.length - 4} more</div>
          )}
        </div>
      )}

      {/* Notes */}
      {workout.notes && (
        <p className="feed-notes">"{workout.notes}"</p>
      )}

      {/* Actions */}
      <div className="feed-actions">
        <button className={`feed-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>
        <button className="feed-action-btn" onClick={() => setShowComments(p => !p)}>
          <MessageCircle size={16} />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="feed-comments">
          {comments.map((c, i) => (
            <div key={i} className="feed-comment">
              <span className="feed-comment-user">@{c.username}</span>
              <span className="feed-comment-text">{c.text}</span>
            </div>
          ))}
          <form onSubmit={handleComment} className="feed-comment-form">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..."
              style={{ fontSize: '13px', padding: '9px 12px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !comment.trim()}>
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// tiny inline icon
const TrendingUpIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function Feed() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('feed'); // 'feed' | 'discover'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFeed = async (p = 1, t = tab) => {
    try {
      const endpoint = t === 'discover' ? '/feed/discover' : '/feed';
      const res = await api.get(`${endpoint}?page=${p}&limit=10`);
      const newWorkouts = res.data.workouts || [];
      if (p === 1) setWorkouts(newWorkouts);
      else setWorkouts(prev => [...prev, ...newWorkouts]);
      setHasMore(newWorkouts.length === 10);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchFeed(1, tab);
  }, [tab]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchFeed(nextPage);
  };

  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: '680px' }}>
        <div className="page-header">
          <h1 className="page-title">FEED</h1>
          <p className="page-subtitle">Your fitness community</p>
        </div>

        {/* Tabs */}
        <div className="feed-tabs">
          <button className={`feed-tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>
            <Users size={15} /> Following
          </button>
          <button className={`feed-tab ${tab === 'discover' ? 'active' : ''}`} onClick={() => setTab('discover')}>
            <Flame size={15} /> Discover
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : workouts.length === 0 ? (
          <div className="feed-empty">
            <Dumbbell size={48} color="var(--text-muted)" />
            <h3>No workouts yet</h3>
            <p>{tab === 'feed' ? 'Follow some athletes to see their workouts here, or switch to Discover.' : 'No public workouts yet.'}</p>
          </div>
        ) : (
          <>
            {workouts.map(w => <WorkoutCard key={w._id} workout={w} />)}
            {hasMore && (
              <button className="btn btn-secondary btn-block" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <ChevronDown size={16} />}
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
