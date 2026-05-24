import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard',      label: 'Dashboard',    icon: 'fa-chart-line'    },
  { to: '/sistem',         label: 'Sistem',        icon: 'fa-server'        },
  { to: '/dokumentasi',    label: 'Dokumentasi',   icon: 'fa-folder-open'   },
  { to: '/feedback',       label: 'Feedback',      icon: 'fa-comment-dots'  },
  { to: '/tentang',        label: 'Tentang',       icon: 'fa-users'         },
  { to: '/panduan',        label: 'Panduan',       icon: 'fa-book-open'     },
];

const ADMIN_NAV = [
  { to: '/settings', label: 'Settings', icon: 'fa-gear' },
  { to: '/admin',    label: 'Admin',    icon: 'fa-shield-halved' },
];

export default function AppBar() {
  const online     = useSelector(s => s.sensor.live.online);
  const selectedId = useSelector(s => s.devices.selectedId);
  const { isAuthenticated, logout } = useAuth();
  const navigate   = useNavigate();
  const [open, setOpen] = useState(false);

  function toggle() { setOpen(v => !v); }
  function close()  { setOpen(false); }

  function handleLogout() {
    close();

    fetch((import.meta.env.VITE_APP_URL ?? '') + '/admin/logout', { credentials: 'include' }).catch(() => {});
    logout();
    navigate('/dashboard');
  }

  return (
    <>

      <div className="topbar">
        <div className="topbar-left">
          <button className="hamburger" onClick={toggle} aria-label="Menu">
            <span /><span /><span />
          </button>
          <Link to="/" style={{ textDecoration: 'none' }} onClick={close}>
            <span className="topbar-logo">
              <i className="fa fa-seedling" style={{ color: 'var(--green)', fontSize: 12 }} />
              Smart Garden
            </span>
          </Link>
          <div className="topbar-divider" />
          <span className="topbar-page">IoT Dashboard</span>
        </div>

        <div className="topbar-right">

          {selectedId && (
            <div className="esp-pill" style={online ? {
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: 'var(--green)',
            } : undefined}>
              <span className="esp-dot" style={{ background: online ? 'var(--green)' : undefined }} />
              <span>{online ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
          )}


          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{
                fontSize: 11, color: 'var(--muted)', background: 'none',
                padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)',
                fontFamily: "'Space Mono', monospace", letterSpacing: 1, cursor: 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
              onMouseOut={e  => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Logout
            </button>
          ) : (
            <Link
              to="/admin/login"
              style={{
                fontSize: 11, color: 'var(--muted)', textDecoration: 'none',
                padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)',
                fontFamily: "'Space Mono', monospace", letterSpacing: 1,
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.borderColor = 'var(--blue)'; }}
              onMouseOut={e  => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Admin
            </Link>
          )}
        </div>
      </div>


      <div className={`sidebar${open ? ' active' : ''}`}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 22px 16px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 8,
        }}>
          <i className="fa fa-seedling" style={{ color: 'var(--green)', fontSize: 10 }} />
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12, fontWeight: 700, letterSpacing: 2,
            color: 'var(--blue)', textTransform: 'uppercase',
          }}>Smart Garden</span>
        </div>


        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={close}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <i className={`fa ${icon}`} style={{ fontSize: 14, width: 16 }} />
            {label}
          </NavLink>
        ))}


        {isAuthenticated && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <div style={{
              padding: '4px 22px', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
              color: 'var(--muted)', fontFamily: "'Space Mono', monospace",
            }}>Admin</div>
            {ADMIN_NAV.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={close}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <i className={`fa ${icon}`} style={{ fontSize: 14, width: 16 }} />
                {label}
              </NavLink>
            ))}
          </div>
        )}


        <div style={{ marginTop: 'auto', padding: '16px 22px 22px', borderTop: '1px solid var(--border)' }}>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="sidebar-link"
              style={{ padding: '10px 0', borderLeft: 'none', width: '100%', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <i className="fa fa-right-from-bracket" style={{ fontSize: 14, width: 16 }} />
              Logout
            </button>
          ) : (
            <NavLink
              to="/admin/login"
              onClick={close}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              style={{ padding: '10px 0', borderLeft: 'none' }}
            >
              <i className="fa fa-shield-halved" style={{ fontSize: 14, width: 16 }} />
              Admin Panel
            </NavLink>
          )}
        </div>
      </div>


      <div
        className={`overlay${open ? ' active' : ''}`}
        onClick={close}
        onTouchEnd={e => { e.preventDefault(); close(); }}
        role="presentation"
        aria-hidden="true"
      />
    </>
  );
}
