import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const PHP_BASE = import.meta.env.VITE_APP_URL ?? '';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi'); return;
    }
    setLoading(true); setError('');

    try {

      const res = await fetch(PHP_BASE + '/admin/login', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:        new URLSearchParams({ username, password }).toString(),
        redirect:    'manual', 
      });



      if (res.status === 0 || res.type === 'opaqueredirect' || res.redirected) {

        login('php-session');
        navigate('/admin');
        return;
      }


      const text = await res.text();
      if (text.includes('alert-error') || text.includes('salah')) {
        setError('Username atau password salah');
      } else if (res.ok) {

        login('php-session');
        navigate('/admin');
      } else {
        setError('Server error. Coba lagi.');
      }
    } catch {

      setError('Tidak bisa terhubung ke server. Coba login langsung:');
    }

    setLoading(false);
  }

  return (
    <>
      <div className="login-wrap">

        <div className="login-logo">
          <i className="fa fa-seedling" />
          Smart Garden
        </div>

        <div className="login-card">

          <div className="login-header">
            <div className="login-title">Admin Panel</div>
            <div className="login-sub">Masuk untuk kelola feedback</div>
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="fa fa-circle-exclamation" />
              {error}
              {error.includes('langsung') && (
                <>
                  {' '}
                  <a href={PHP_BASE + '/admin/login'} style={{ color: 'inherit', textDecoration: 'underline' }}>
                    Buka Admin PHP
                  </a>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">

            <div className="field-group">
              <label className="field-label">Username</label>
              <div className="field-wrap">
                <i className="fa fa-user field-icon" />
                <input
                  type="search"
                  name="username"
                  className="field-input"
                  placeholder="Username admin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <i className="fa fa-lock field-icon" />
                <input
                  type="password"
                  name="password"
                  className="field-input"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading
                ? <><i className="fa fa-spinner fa-spin" /> Memeriksa...</>
                : <><i className="fa fa-right-to-bracket" /> Masuk</>
              }
            </button>

          </form>

        </div>

        <div className="login-back">
          <Link to="/dashboard">
            <i className="fa fa-arrow-left" /> Kembali ke Dashboard
          </Link>
        </div>


        <div className="login-back" style={{ marginTop: 8 }}>
          <a href={PHP_BASE + '/admin/login'} style={{ color: 'var(--muted)', fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
            Atau login langsung via PHP →
          </a>
        </div>

      </div>
    </>
  );
}
