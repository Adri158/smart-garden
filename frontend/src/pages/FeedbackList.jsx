import { useState, useEffect, useCallback } from 'react';
import '../styles/feedback.css';

const PHP_BASE = import.meta.env.VITE_APP_URL ?? '';

const CAT_BADGE = {
  saran:   { cls: 'badge-saran',   label: '💡 Saran'   },
  kritik:  { cls: 'badge-kritik',  label: '⚠️ Kritik'  },
  bug:     { cls: 'badge-bug',     label: '🐛 Bug'     },
  lainnya: { cls: 'badge-lainnya', label: '• Lainnya'  },
};

function FbCard({ fb }) {
  const cat  = CAT_BADGE[fb.category] ?? CAT_BADGE.lainnya;
  const stars = fb.rating > 0 ? '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating) : '';
  const date  = new Date(fb.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

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
            <div className="fb-reply-by">
              — {fb.reply_by} · {new Date(fb.reply_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeedbackList() {
  const [items,    setItems]    = useState([]);
  const [total,    setTotal]    = useState(null);
  const [avg,      setAvg]      = useState(null);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [category, setCat]      = useState('');
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async (pg, cat) => {
    setLoading(true);
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
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(1, category); }, [category, load]);

  function handleFilter(cat, btn) {
    document.querySelectorAll('.fp-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setCat(cat); setPage(1);
  }

  return (
    <main className="main-content" style={{ padding: 0 }}>
      <div className="fb-page" style={{ flexDirection: 'column', maxWidth: 860, margin: '0 auto', padding: '36px 24px' }}>

        <div className="fb-header">
          <div className="fb-tag"><i className="fa fa-comment-dots" /> Feedback</div>
          <h1 className="fb-title">Semua Feedback</h1>
          <p className="fb-desc">Masukan dan saran dari pengguna sistem Smart Garden Kelompok 6.</p>
        </div>


        <div className="stats-card" style={{ marginBottom: 24 }}>
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
          <span className="fb-list-title">Daftar Feedback</span>
          <div className="fb-filter-pills">
            <button className="fp-btn active" onClick={e => handleFilter('', e.currentTarget)}>Semua</button>
            <button className="fp-btn" onClick={e => handleFilter('saran', e.currentTarget)}>💡</button>
            <button className="fp-btn" onClick={e => handleFilter('kritik', e.currentTarget)}>⚠️</button>
            <button className="fp-btn" onClick={e => handleFilter('bug', e.currentTarget)}>🐛</button>
          </div>
        </div>


        <div className="fb-list">
          {loading ? (
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

      </div>
    </main>
  );
}
