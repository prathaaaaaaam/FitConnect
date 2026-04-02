import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Rss, PlusSquare, Dumbbell, Compass, User, LogOut, Zap
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/feed', icon: Rss, label: 'Feed' },
  { to: '/log', icon: PlusSquare, label: 'Log Workout', accent: true },
  { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="layout">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon"><Zap size={18} fill="currentColor" /></div>
          <span className="logo-text">FIT<span>CONNECT</span></span>
        </div>

        {/* User pill */}
        <NavLink to="/profile" className="sidebar-user">
          <div className="avatar avatar-sm" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
            {initials}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-handle">@{user?.username}</span>
          </div>
        </NavLink>

        {/* Streak badge */}
        {user?.currentStreak > 0 && (
          <div className="sidebar-streak">
            <span>🔥</span>
            <span>{user.currentStreak} day streak</span>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, accent }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''} ${accent ? 'accent' : ''}`
            }>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} className="sidebar-logout">
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
