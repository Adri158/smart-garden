import { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/feedback.css';

const PHP_BASE = import.meta.env.VITE_APP_URL ?? '';

const CAT_BADGE = {
  saran:   { cls: 'badge-saran',   label: '💡 Saran'   },
  kritik:  { cls: 'badge-kritik',  label: '⚠️ Kritik'  },
  bug:     { cls: 'badge-bug',     label: '🐛 Bug'     },
  lainnya: { cls: 'badge-lainnya', label: '• Lainnya'  },
};

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function StarRow({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map(v => (
        <span
          key={v}
          className={`star${v <= (hover || value) ? ' active' : ''}`}
          onMouseOver={() => setHover(v)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(v === value ? 0 : v)}
        >★</span>
      ))}
    </div>
  );
}

function FbCard({ fb }) {
  const cat    = CAT_BADGE[fb.category] ?? CAT_BADGE.lainnya;
  const stars  = fb.rating > 0 ? '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating) : '';
  const date   = new Date(fb.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className={`fb-card${fb.reply ? ' replied' : ''}`}>
      <div className="fb-card-head">
        <span className={`fb-cat-badge ${cat.cls}`}>{cat.label}</span>
        <span className="fb-card-name">{fb.nama || 'Anonim'}</span>
        {stars && <span className="fb-card-stars">{stars}</span>}
        <span className="fb-card-time">{date}</span>
      </div>
      <div className="fb-card-body">
        <div className="fb-card-pesan">{fb.pesan}</div>
        {fb.reply && (
          <div className="fb-card-reply">
            <div className="fb-reply-label"><i className="fa fa-reply" /> Balasan Anggota</div>
            <div className="fb-reply-text">{fb.reply}</div>
            <div className="fb-reply-by">— {fb.reply_by} · {new Date(fb.reply_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackListPanel({ refreshKey }) {
  const [items, setItems]     = useState([]);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [total, setTotal]     = useState(null);
  const [avg, setAvg]         = useState(null);
  const [category, setCat]    = useState('');
  const [listLoading, setListLoading] = useState(false);

  const load = useCallback(async (pg, cat) => {
    setListLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, category: cat });
      const res  = await fetch(PHP_BASE + '/feedback_list?' + params);
      const data = await res.json();
      if (data.success) {
        setItems(data.data ?? []);
        setTotal(data.total);
        setAvg(data.avg);
        setPages(data.pages ?? 1);
        setPage(data.page ?? pg);
      }
    } catch (_) {}
    setListLoading(false);
  }, []);

  useEffect(() => { load(1, category); }, [category, refreshKey, load]);

  function handleFilter(cat, e) {
    document.querySelectorAll('.fp-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    setCat(cat); setPage(1);
  }

  return (
    <>
      <div className="stats-card">
        <div className="stats-item">
          <span className="stats-label">Total Feedback</span>
          <span className="stats-val">{total ?? '—'}</span>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <span className="stats-label">Rating Rata-rata</span>
          <span className="stats-val">{avg && avg !== '—' ? avg + ' ★' : '—'}</span>
        </div>
      </div>

      <div className="fb-list-header">
        <span className="fb-list-title">Feedback Terbaru</span>
        <div className="fb-filter-pills">
          <button className="fp-btn active" onClick={e => handleFilter('', e)}>Semua</button>
          <button className="fp-btn" onClick={e => handleFilter('saran', e)}>💡</button>
          <button className="fp-btn" onClick={e => handleFilter('kritik', e)}>⚠️</button>
          <button className="fp-btn" onClick={e => handleFilter('bug', e)}>🐛</button>
        </div>
      </div>

      <div className="fb-list">
        {listLoading ? (
          <div className="fb-list-loading"><i className="fa fa-spinner fa-spin" /></div>
        ) : items.length === 0 ? (
          <div className="fb-empty">Belum ada feedback</div>
        ) : (
          items.map((fb, i) => <FbCard key={fb.id ?? i} fb={fb} />)
        )}
      </div>

      {pages > 1 && (
        <div className="fb-pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`fb-page-btn${p === page ? ' active' : ''}`}
              onClick={() => { setPage(p); load(p, category); }}
            >{p}</button>
          ))}
        </div>
      )}
    </>
  );
}

export default function Feedback() {
  const [form, setForm] = useState({
    csrf: '', category: 'saran', nama: '', email: '', pesan: '', rating: 0,
  });
  const [charCount, setCharCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);
  const [flashError, setFlashError]     = useState('');
  const [refreshKey, setRefreshKey]     = useState(0);

  useEffect(() => {
    // The CSRF field is handled server-side; we pass an empty token and rely on
    // No-op: we just call feedback_submit directly.
  }, []);

  function showFlash(type, msg) {
    if (type === 'success') { setFlashSuccess(true); setFlashError(''); }
    else { setFlashError(msg || 'Terjadi kesalahan.'); setFlashSuccess(false); }
    setTimeout(() => { setFlashSuccess(false); setFlashError(''); }, 5000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.pesan.trim()) { showFlash('error', 'Pesan tidak boleh kosong'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(PHP_BASE + '/feedback_submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          csrf:     form.csrf,
          nama:     form.nama,
          email:    form.email,
          category: form.category,
          pesan:    form.pesan,
          rating:   form.rating,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFlash('success', data.message || 'Feedback berhasil dikirim!');
        setForm(prev => ({ ...prev, nama: '', email: '', pesan: '', rating: 0 }));
        setCharCount(0);
        setRefreshKey(k => k + 1);
      } else {
        showFlash('error', data.message || 'Terjadi kesalahan');
      }
    } catch {
      showFlash('error', 'Gagal menghubungi server');
    }
    setSubmitting(false);
  }

  return (
    <main className="main-content" style={{ padding: 0 }}>
      <div className="fb-page">

        {/* LEFT: FORM */}
        <div className="fb-left">
          <div className="fb-header">
            <div className="fb-tag"><i className="fa fa-comment-dots" /> Feedback</div>
            <h1 className="fb-title">Saran &amp; Kritik</h1>
            <p className="fb-desc">Punya masukan untuk Projek IoT kita? Tulis di sini — nama &amp; email tidak wajib (Biarkan kosong).</p>
          </div>

          {/* Flash messages */}
          <div className={`flash flash-success${flashSuccess ? ' show' : ''}`}>
            <i className="fa fa-circle-check" />
            <span>Feedback berhasil dikirim. Terima kasih!</span>
          </div>
          <div className={`flash flash-error${flashError ? ' show' : ''}`}>
            <i className="fa fa-circle-exclamation" />
            <span>{flashError || 'Terjadi kesalahan.'}</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Kategori <span className="required">*</span></label>
              <div className="category-row">
                {[
                  { v: 'saran',   ico: 'fa-lightbulb',             label: 'Saran'   },
                  { v: 'kritik',  ico: 'fa-triangle-exclamation',  label: 'Kritik'  },
                  { v: 'bug',     ico: 'fa-bug',                   label: 'Bug'     },
                  { v: 'lainnya', ico: 'fa-ellipsis',              label: 'Lainnya' },
                ].map(({ v, ico, label }) => (
                  <label key={v} className="cat-option">
                    <input
                      type="radio" name="category" value={v}
                      checked={form.category === v}
                      onChange={() => setForm(f => ({ ...f, category: v }))}
                    />
                    <span className="cat-btn"><i className={`fa ${ico}`} /> {label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nama */}
            <div className="form-group">
              <label className="form-label" htmlFor="inputNama">
                Nama <span className="optional">(opsional)</span>
              </label>
              <input
                type="text" id="inputNama" name="nama" className="form-input"
                placeholder="Nama kamu" maxLength={80}
                value={form.nama}
                onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="inputEmail">
                Email <span className="optional">(opsional)</span>
              </label>
              <input
                type="email" id="inputEmail" name="email" className="form-input"
                placeholder="email@contoh.com" maxLength={120}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            {/* Pesan */}
            <div className="form-group">
              <label className="form-label" htmlFor="inputPesan">
                Pesan <span className="required">*</span>
              </label>
              <textarea
                id="inputPesan" name="pesan" className="form-input form-textarea"
                placeholder="Tulis pesan disini" maxLength={1000} rows={5}
                value={form.pesan}
                onChange={e => { setForm(f => ({ ...f, pesan: e.target.value })); setCharCount(e.target.value.length); }}
              />
              <div className="char-count">
                <span style={{ color: charCount > 900 ? '#ef4444' : undefined }}>{charCount}</span> / 1000
              </div>
            </div>

            {/* Rating */}
            <div className="form-group">
              <label className="form-label">Rating Proyek</label>
              <StarRow value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              <i className={`fa ${submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} />
              <span>{submitting ? 'Mengirim...' : 'Kirim Feedback'}</span>
            </button>
          </form>
        </div>

        {/* RIGHT: LIST */}
        <div className="fb-right">
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon"><i className="fa fa-shield-halved" /></div>
              <div>
                <div className="info-title">Anonim &amp; Aman</div>
                <div className="info-desc">Nama dan email tidak wajib.</div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon"><i className="fa fa-bolt" /></div>
              <div>
                <div className="info-title">Langsung Diterima</div>
                <div className="info-desc">Feedback tersimpan dan dilihat anggota.</div>
              </div>
            </div>
          </div>

          <FeedbackListPanel refreshKey={refreshKey} />
        </div>

      </div>
    </main>
  );
}
