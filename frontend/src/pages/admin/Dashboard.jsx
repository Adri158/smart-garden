import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const PHP_BASE = import.meta.env.VITE_APP_URL ?? '';

const CAT_CLASS = {
  saran:   'cat-saran',
  kritik:  'cat-kritik',
  bug:     'cat-bug',
  lainnya: 'cat-lainnya',
};
const CAT_LABEL = {
  saran:   '💡 Saran',
  kritik:  '⚠️ Kritik',
  bug:     '🐛 Bug',
  lainnya: '• Lainnya',
};

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/**
 * Admin Dashboard — matches admin/dashboard.php + js/admin.js.
 * Uses PHP API endpoints (admin/api.php) via fetch with credentials.
 */
export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [tab,          setTab]       = useState('feedback'); // 'feedback' | 'admins'
  const [feedbacks,    setFeedbacks] = useState([]);
  const [fbPage,       setFbPage]    = useState(1);
  const [fbPages,      setFbPages]   = useState(1);
  const [fbCat,        setFbCat]     = useState('');
  const [fbSearch,     setFbSearch]  = useState('');
  const [fbLoading,    setFbLoading] = useState(true);
  const [stats,        setStats]     = useState({ total: '—', unread: '—', avg: '—' });

  const [admins,       setAdmins]    = useState([]);
  const [newUsername,  setNewUser]   = useState('');
  const [newName,      setNewName]   = useState('');
  const [newPassword,  setNewPass]   = useState('');
  const [adminAlert,   setAdAlert]   = useState({ type: '', msg: '' });

  // Reply modal
  const [replyTarget, setReplyTarget] = useState(null); // { id, pesan }
  const [replyText,   setReplyText]   = useState('');
  const [replyError,  setReplyError]  = useState('');
  const [replyLoading,setReplyLoading]= useState(false);

  const searchTimerRef = useRef(null);

  async function loadFeedback(page = fbPage, cat = fbCat, search = fbSearch) {
    setFbLoading(true);
    try {
      const params = new URLSearchParams({ action: 'list', page, category: cat, search });
      const res  = await fetch(PHP_BASE + '/admin/api?' + params, { credentials: 'include' });
      if (res.status === 401) { navigate('/admin/login'); return; }
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data ?? []);
        setFbPages(data.pages ?? 1);
        setFbPage(data.page ?? page);
        if (data.stats) setStats(data.stats);
      } else {
        setFeedbacks([]);
      }
    } catch { setFeedbacks([]); }
    setFbLoading(false);
  }

  async function loadAdmins() {
    try {
      const res  = await fetch(PHP_BASE + '/admin/api?action=list_admins', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setAdmins(data.data ?? []);
    } catch {}
  }

  useEffect(() => { loadFeedback(); }, []);
  useEffect(() => { if (tab === 'admins') loadAdmins(); }, [tab]);

  function handleFilter(cat, e) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    setFbCat(cat); setFbPage(1); loadFeedback(1, cat, fbSearch);
  }

  function handleSearch(val) {
    setFbSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setFbPage(1); loadFeedback(1, fbCat, val.trim());
    }, 350);
  }

  async function submitReply() {
    if (!replyText.trim()) { setReplyError('Balasan tidak boleh kosong'); return; }
    setReplyLoading(true); setReplyError('');
    try {
      const res  = await fetch(PHP_BASE + '/admin/api', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply', id: replyTarget.id, reply: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyTarget(null); setReplyText('');
        loadFeedback(fbPage, fbCat, fbSearch);
      } else { setReplyError(data.message || 'Gagal mengirim balasan'); }
    } catch { setReplyError('Server error'); }
    setReplyLoading(false);
  }

  async function deleteFeedback(id) {
    if (!window.confirm('Hapus feedback ini?')) return;
    try {
      const res  = await fetch(PHP_BASE + '/admin/api', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_feedback', id }),
      });
      const data = await res.json();
      if (data.success) loadFeedback(fbPage, fbCat, fbSearch);
      else alert(data.message || 'Gagal menghapus');
    } catch { alert('Server error'); }
  }

  async function addAdmin() {
    setAdAlert({ type: '', msg: '' });
    try {
      const res  = await fetch(PHP_BASE + '/admin/api', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_admin', username: newUsername, name: newName, password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setAdAlert({ type: 'success', msg: 'Admin berhasil ditambahkan' });
        setAdmins(prev => [...prev, data.admin]);
        setNewUser(''); setNewName(''); setNewPass('');
      } else { setAdAlert({ type: 'error', msg: data.message || 'Gagal' }); }
    } catch { setAdAlert({ type: 'error', msg: 'Server error' }); }
  }

  async function deleteAdmin(id, username) {
    if (!window.confirm(`Hapus admin "${username}"?`)) return;
    try {
      const res  = await fetch(PHP_BASE + '/admin/api', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_admin', id }),
      });
      const data = await res.json();
      if (data.success) setAdmins(prev => prev.filter(a => a.id !== id));
      else alert(data.message || 'Gagal');
    } catch { alert('Server error'); }
  }

  function handleLogout() {
    fetch(PHP_BASE + '/admin/logout', { credentials: 'include' }).finally(() => {
      logout();
      navigate('/admin/login');
    });
  }

  function renderCard(fb) {
    const catCls   = CAT_CLASS[fb.category] ?? 'cat-lainnya';
    const catLabel = CAT_LABEL[fb.category] ?? '• Lainnya';
    const stars    = fb.rating > 0 ? '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating) : '';
    const date     = new Date(fb.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
      <div key={fb.id} className={`fb-admin-card${fb.reply ? ' has-reply' : ''}`}>
        <div className="fba-head">
          <span className={`fba-cat ${catCls}`}>{catLabel}</span>
          <span className="fba-name">{fb.nama || 'Anonim'}</span>
          {fb.email && <span className="fba-email">{fb.email}</span>}
          {stars && <span className="fba-stars">{stars}</span>}
          <span className="fba-time">{date}</span>
        </div>
        <div className="fba-body">
          <div className="fba-pesan">{fb.pesan}</div>
          {fb.reply && (
            <div className="fba-reply-box">
              <div className="fba-reply-label"><i className="fa fa-reply" /> Balasan Admin</div>
              <div className="fba-reply-text">{fb.reply}</div>
              <div className="fba-reply-meta">— {fb.reply_by} · {new Date(fb.reply_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          )}
          <div className="fba-actions">
            <button
              className="fba-btn fba-btn-reply"
              onClick={() => { setReplyTarget({ id: fb.id, pesan: fb.pesan }); setReplyText(fb.reply || ''); setReplyError(''); }}
            >
              <i className="fa fa-reply" /> {fb.reply ? 'Edit Balasan' : 'Balas'}
            </button>
            <button className="fba-btn fba-btn-del" onClick={() => deleteFeedback(fb.id)}>
              <i className="fa fa-trash" /> Hapus
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="admin-main main-content">

        {/* STATS ROW */}
        <div className="admin-stats">
          <div className="astat-card">
            <div className="astat-val">{stats.total}</div>
            <div className="astat-label">Total Feedback</div>
          </div>
          <div className="astat-card highlight">
            <div className="astat-val">{stats.unread}</div>
            <div className="astat-label">Belum Dibalas</div>
          </div>
          <div className="astat-card">
            <div className="astat-val">{stats.avg}</div>
            <div className="astat-label">Rating Rata-rata</div>
          </div>
        </div>

        {/* TABS */}
        <div className="admin-tabs">
          <button
            className={`tab-btn${tab === 'feedback' ? ' active' : ''}`}
            onClick={() => setTab('feedback')}
          >
            <i className="fa fa-comment-dots" /> Feedback
          </button>
          <button
            className={`tab-btn${tab === 'admins' ? ' active' : ''}`}
            onClick={() => setTab('admins')}
          >
            <i className="fa fa-users" /> Kelola Admin
          </button>
        </div>

        {/* TAB: FEEDBACK */}
        {tab === 'feedback' && (
          <div className="tab-content">
            <div className="filter-row">
              <button className="filter-btn active" onClick={e => handleFilter('', e)}>Semua</button>
              <button className="filter-btn" onClick={e => handleFilter('saran', e)}>💡 Saran</button>
              <button className="filter-btn" onClick={e => handleFilter('kritik', e)}>⚠️ Kritik</button>
              <button className="filter-btn" onClick={e => handleFilter('bug', e)}>🐛 Bug</button>
              <button className="filter-btn" onClick={e => handleFilter('lainnya', e)}>• Lainnya</button>
              <div className="filter-search">
                <input
                  type="text"
                  placeholder="Cari feedback..."
                  value={fbSearch}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="fb-admin-list">
              {fbLoading ? (
                <div className="loading-state"><i className="fa fa-spinner fa-spin" /> Memuat...</div>
              ) : feedbacks.length === 0 ? (
                <div className="empty-state"><i className="fa fa-comment-slash" />Belum ada feedback</div>
              ) : (
                feedbacks.map(renderCard)
              )}
            </div>

            {/* Pagination */}
            {fbPages > 1 && (
              <div className="pagination">
                {Array.from({ length: fbPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn${p === fbPage ? ' active' : ''}`}
                    onClick={() => { setFbPage(p); loadFeedback(p, fbCat, fbSearch); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >{p}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ADMINS */}
        {tab === 'admins' && (
          <div className="tab-content">
            <div className="admins-wrap">

              <div className="admin-form-card">
                <div className="afc-title">Tambah Admin Baru</div>

                {adminAlert.msg && (
                  <div className={`alert ${adminAlert.type === 'success' ? '' : 'alert-error'}`}
                       style={adminAlert.type === 'success' ? { background: 'rgba(34,197,94,0.08)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.2)', padding: '8px 12px', borderRadius: 6, fontSize: 11, border: '1px solid', marginBottom: 12 } : { padding: '8px 12px', borderRadius: 6, fontSize: 11, marginBottom: 12 }}>
                    <i className={`fa fa-${adminAlert.type === 'success' ? 'check' : 'circle-exclamation'}`} />
                    {' '}{adminAlert.msg}
                  </div>
                )}

                <div className="field-group">
                  <label className="field-label">Username</label>
                  <div className="field-wrap">
                    <i className="fa fa-user field-icon" />
                    <input type="text" className="field-input" placeholder="username" value={newUsername} onChange={e => setNewUser(e.target.value)} />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Nama Lengkap</label>
                  <div className="field-wrap">
                    <i className="fa fa-id-card field-icon" />
                    <input type="text" className="field-input" placeholder="Nama tampilan" value={newName} onChange={e => setNewName(e.target.value)} />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Password</label>
                  <div className="field-wrap">
                    <i className="fa fa-lock field-icon" />
                    <input type="password" className="field-input" placeholder="Min 8 karakter" value={newPassword} onChange={e => setNewPass(e.target.value)} />
                  </div>
                </div>
                <button className="login-btn" onClick={addAdmin} style={{ marginTop: 8 }}>
                  <i className="fa fa-plus" /> Tambah Admin
                </button>
              </div>

              <div className="admin-list-card">
                <div className="afc-title">Daftar Admin</div>
                <div className="admin-list">
                  {admins.map(a => (
                    <div key={a.id} className="admin-row">
                      <div className="admin-info">
                        <div className="admin-uname">{a.username}</div>
                        <div className="admin-rname">{a.name || '—'}</div>
                      </div>
                      <div className="admin-meta">
                        <button className="del-admin-btn" onClick={() => deleteAdmin(a.id, a.username)}>
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* REPLY MODAL */}
      {replyTarget && (
        <>
          <div className="modal-backdrop active" onClick={() => setReplyTarget(null)} />
          <div className="modal active">
            <div className="modal-header">
              <span className="modal-title"><i className="fa fa-reply" /> Balas Feedback</span>
              <button className="modal-close" onClick={() => setReplyTarget(null)}><i className="fa fa-xmark" /></button>
            </div>
            <div className="modal-body">
              <div className="reply-original">{replyTarget.pesan}</div>
              <div className="field-group" style={{ marginTop: 14 }}>
                <label className="field-label">Balasan Admin</label>
                <textarea
                  className="field-input"
                  style={{ minHeight: 100, resize: 'vertical' }}
                  placeholder="Tulis balasan..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
              </div>
              {replyError && <div className="modal-error">{replyError}</div>}
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setReplyTarget(null)}>Batal</button>
              <button className="modal-submit" onClick={submitReply} disabled={replyLoading}>
                {replyLoading
                  ? <><i className="fa fa-spinner fa-spin" /> Mengirim...</>
                  : <><i className="fa fa-paper-plane" /> Kirim Balasan</>
                }
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
