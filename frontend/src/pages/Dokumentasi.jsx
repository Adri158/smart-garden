import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/dokumentasi.css';

const BASE_URL = '';
const srcUrl = (src) => encodeURI(BASE_URL + '/' + src);

export default function Dokumentasi() {
  const [files,  setFiles]    = useState([]);
  const [loaded, setLoaded]   = useState(false);
  const [view,   setView]     = useState('grid');
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [preview, setPreview] = useState(null);
  const [fullscreen, setFs]   = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetch('/api/dokumentasi/files')
      .then(r => r.json())
      .then(data => { setFiles(Array.isArray(data?.data) ? data.data : []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const visible = files.filter(f => {
    const typeOk = filter === 'all' || f.type === filter;
    const nameOk = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return typeOk && nameOk;
  });

  const counts = { all: files.length };
  files.forEach(f => { counts[f.type] = (counts[f.type] ?? 0) + 1; });

  const visibleIndices = visible.map((f) => ({ f, idx: files.indexOf(f) }));
  const previewPos = preview != null ? visibleIndices.findIndex(x => x.idx === preview) : -1;
  const canPrev    = previewPos > 0;
  const canNext    = previewPos < visibleIndices.length - 1;

  function openPreview(fileIdx) { setPreview(fileIdx); setFs(false); }
  function closePreview() { setPreview(null); setFs(false); }
  function shiftPreview(dir) {
    if (previewPos === -1) return;
    const next = previewPos + dir;
    if (next >= 0 && next < visibleIndices.length) openPreview(visibleIndices[next].idx);
  }

  useEffect(() => {
    function onKey(e) {
      if (preview == null) return;
      if (e.key === 'Escape')     closePreview();
      if (e.key === 'ArrowLeft')  shiftPreview(-1);
      if (e.key === 'ArrowRight') shiftPreview(1);
      if (e.key === 'f' || e.key === 'F') setFs(v => !v);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [preview, previewPos]);

  const previewFile = preview != null ? files[preview] : null;


  const swipeRef = useRef({ x: 0, active: false });
  function onTouchStart(e) { swipeRef.current = { x: e.touches[0].clientX, active: true }; }
  function onTouchEnd(e) {
    if (!swipeRef.current.active) return;
    const dx = e.changedTouches[0].clientX - swipeRef.current.x;
    swipeRef.current.active = false;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) shiftPreview(1);
    else shiftPreview(-1);
  }

  return (
    <main className="main-content" style={{ padding: 0 }}>
      <div className="doc-root">

        <div className="doc-toolbar">
          <div className="doc-title"><i className="fa fa-folder-open" /> Dokumentasi</div>
          <div className="doc-search">
            <i className="fa fa-magnifying-glass" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Cari file..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
            {search && (
              <button className="search-clear" onClick={() => { setSearch(''); searchRef.current?.focus(); }}>
                <i className="fa fa-xmark" />
              </button>
            )}
          </div>
          <div className="view-toggle">
            <button className={`vbtn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')} title="Grid view">
              <i className="fa fa-grip" />
            </button>
            <button className={`vbtn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')} title="List view">
              <i className="fa fa-list" />
            </button>
          </div>
        </div>

        <div className="filter-bar">
          {[
            { k: 'all',   icon: 'fa-layer-group', label: 'Semua',  cnt: counts.all ?? 0 },
            { k: 'image', icon: 'fa-image',        label: 'Gambar', cnt: counts.image ?? 0 },
            { k: 'video', icon: 'fa-film',         label: 'Video',  cnt: counts.video ?? 0 },
          ].map(({ k, icon, label, cnt }) => (
            <button
              key={k}
              className={`chip${filter === k ? ' active' : ''}`}
              onClick={() => setFilter(k)}
            >
              <i className={`fa ${icon}`} /> {label} <span className="chip-count">{cnt}</span>
            </button>
          ))}
        </div>

        {!loaded && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
            <i className="fa fa-spinner fa-spin" /> Memuat file...
          </div>
        )}

        {loaded && view === 'grid' && (
          <div className="file-grid">
            {visible.length === 0 ? (
              <div className="empty-state">
                <i className={`fa ${search ? 'fa-magnifying-glass' : 'fa-folder-open'}`} />
                <p>{search ? 'Tidak ada file yang cocok' : 'Belum ada file dokumentasi'}</p>
              </div>
            ) : (
              visibleIndices.map(({ f, idx }) => (
                <button
                  key={idx}
                  className="file-card"
                  type="button"
                  onClick={() => openPreview(idx)}
                >
                  <div className={`card-thumb thumb--${f.type}`}>
                    {f.type === 'image' && (
                      <>
                        <img src={srcUrl(f.src)} alt="" loading="lazy" />
                        <span className="thumb-badge thumb-foto">FOTO</span>
                      </>
                    )}
                    {f.type === 'video' && (
                      <>
                        {f.thumb && <img src={srcUrl(f.thumb)} alt="" loading="lazy" />}
                        <div className="thumb-play"><i className="fa fa-play" /></div>
                        <span className="thumb-badge thumb-vid">VIDEO</span>
                      </>
                    )}
                  </div>
                  <div className="card-foot">
                    <span className="card-name" title={f.name}>{f.name}</span>
                    <span className="card-meta">{f.sizeH} &middot; {f.date}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {loaded && view === 'list' && (
          <div className="file-list">
            <div className="list-head">
              <span />
              <span>Nama</span>
              <span>Tipe</span>
              <span>Ukuran</span>
              <span>Tanggal</span>
            </div>
            {visible.length === 0 ? (
              <div className="empty-state list-empty">
                <i className="fa fa-magnifying-glass" />
                <p>Tidak ada file yang cocok</p>
              </div>
            ) : (
              visibleIndices.map(({ f, idx }) => (
                <button key={idx} className="file-row" type="button" onClick={() => openPreview(idx)}>
                  <div className={`row-ico ico--${f.type}`}>
                    <i className={`fa ${f.type === 'image' ? 'fa-image' : 'fa-film'}`} />
                  </div>
                  <span className="row-name">{f.name}</span>
                  <span className="row-type">{f.type === 'image' ? 'Gambar' : 'Video'}</span>
                  <span className="row-size">{f.sizeH}</span>
                  <span className="row-date">{f.date}</span>
                </button>
              ))
            )}
          </div>
        )}

      </div>

      {previewFile && createPortal(
        <div className={`pv-modal${fullscreen ? ' is-fullscreen' : ''}`}>
          <div className="pv-backdrop" onClick={closePreview} />

          <button className={`pv-nav pv-nav--prev${!canPrev ? ' disabled' : ''}`} onClick={() => shiftPreview(-1)} disabled={!canPrev}>
            <i className="fa fa-chevron-left" />
          </button>
          <button className={`pv-nav pv-nav--next${!canNext ? ' disabled' : ''}`} onClick={() => shiftPreview(1)} disabled={!canNext}>
            <i className="fa fa-chevron-right" />
          </button>

          <div className="pv-panel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="pv-bar">
              <div className="pv-bar-left">
                <div className={`pv-bar-icon pv-icon--${previewFile.type}`}>
                  <i className={`fa ${previewFile.type === 'image' ? 'fa-image' : 'fa-film'}`} />
                </div>
                <div>
                  <div className="pv-bar-name">{previewFile.name}</div>
                  <div className="pv-bar-meta">{previewFile.sizeH} · {previewFile.date}</div>
                </div>
              </div>
              <div className="pv-bar-right">
                <a className="pv-btn" href={srcUrl(previewFile.src)} download={previewFile.name} title="Download">
                  <i className="fa fa-download" />
                </a>
                <button className="pv-btn" onClick={() => setFs(v => !v)} title="Full screen">
                  <i className={`fa ${fullscreen ? 'fa-compress' : 'fa-expand'}`} />
                </button>
                <button className="pv-btn pv-close-btn" onClick={closePreview} title="Tutup">
                  <i className="fa fa-xmark" />
                </button>
              </div>
            </div>

            <div className="pv-body">
              {previewFile.type === 'image' && (
                <PinchZoomImg key={srcUrl(previewFile.src)} src={srcUrl(previewFile.src)} alt={previewFile.name} />
              )}
              {previewFile.type === 'video' && (
                <VideoPlayer key={srcUrl(previewFile.src)} src={srcUrl(previewFile.src)} />
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </main>
  );
}

function PinchZoomImg({ src, alt }) {
  const imgRef = useRef(null);
  const state  = useRef({ scale: 1, tx: 0, ty: 0, startDist: 0, startScale: 1, startTx: 0, startTy: 0, pointers: [] });

  function apply() {
    const { scale, tx, ty } = state.current;
    if (imgRef.current) imgRef.current.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
  }
  function reset() {
    Object.assign(state.current, { scale: 1, tx: 0, ty: 0 });
    if (imgRef.current) {
      imgRef.current.style.transition = 'transform .25s ease';
      apply();
      setTimeout(() => { if (imgRef.current) imgRef.current.style.transition = ''; }, 260);
    }
  }
  function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }

  function onDown(e) {
    const s = state.current;
    s.pointers.push(e);
    if (s.pointers.length === 2) {
      s.startDist = dist(s.pointers[0], s.pointers[1]);
      s.startScale = s.scale; s.startTx = s.tx; s.startTy = s.ty;
    }
    if (s.pointers.length === 1) { s.startTx = s.tx - e.clientX; s.startTy = s.ty - e.clientY; }
  }
  function onMove(e) {
    const s = state.current;
    const idx = s.pointers.findIndex(p => p.pointerId === e.pointerId);
    if (idx !== -1) s.pointers[idx] = e;
    if (s.pointers.length === 2) {
      const d = dist(s.pointers[0], s.pointers[1]);
      s.scale = Math.min(6, Math.max(1, s.startScale * (d / s.startDist)));
      apply();
    } else if (s.pointers.length === 1 && s.scale > 1) {
      s.tx = e.clientX + s.startTx; s.ty = e.clientY + s.startTy; apply();
    }
  }
  function onUp(e) {
    const s = state.current;
    s.pointers = s.pointers.filter(p => p.pointerId !== e.pointerId);
    if (s.pointers.length === 1) { s.startTx = s.tx - s.pointers[0].clientX; s.startTy = s.ty - s.pointers[0].clientY; }
    if (s.pointers.length === 0 && s.scale < 1.05) reset();
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onDoubleClick={() => { if (state.current.scale > 1) reset(); }}
      style={{ maxWidth: '100%', objectFit: 'contain', touchAction: 'none', cursor: 'grab' }}
    />
  );
}

function VideoPlayer({ src }) {
  const vidRef   = useRef(null);
  const progRef  = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted,   setMuted]   = useState(false);
  const [time, setTime]       = useState(0);
  const [dur,  setDur]        = useState(0);
  const [pct,  setPct]        = useState(0);

  function togglePlay() {
    const v = vidRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  }
  function toggleMute() {
    const v = vidRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }
  function fmtTime(s) { const m = Math.floor(s / 60); return m + ':' + String(Math.floor(s % 60)).padStart(2, '0'); }
  function onTimeUpdate() {
    const v = vidRef.current;
    if (!v || !v.duration) return;
    setTime(v.currentTime); setDur(v.duration); setPct(v.currentTime / v.duration * 100);
  }
  function onProgClick(e) {
    const v = vidRef.current; const r = progRef.current;
    if (!v || !r || !v.duration) return;
    v.currentTime = ((e.clientX - r.getBoundingClientRect().left) / r.getBoundingClientRect().width) * v.duration;
  }

  return (
    <div className="vid-wrap">
      <div className="vid-video-area">
        <video
          ref={vidRef}
          className="vid-el"
          playsInline
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onClick={togglePlay}
        >
          <source src={src} type="video/mp4" />
        </video>
        <div className="vid-overlay" onClick={togglePlay} />
      </div>
      <div className="vid-controls">
        <div className="vid-prog" ref={progRef} onClick={onProgClick}>
          <div className="vid-prog-fill" style={{ width: pct + '%' }} />
          <div className="vid-prog-thumb" style={{ left: pct + '%' }} />
        </div>
        <div className="vid-bar">
          <button className="vid-btn" onClick={e => { e.stopPropagation(); togglePlay(); }}>
            <i className={`fa ${playing ? 'fa-pause' : 'fa-play'}`} />
          </button>
          <span className="vid-time">{fmtTime(time)} / {fmtTime(dur)}</span>
          <button className="vid-btn" onClick={e => { e.stopPropagation(); toggleMute(); }} title={muted ? 'Unmute' : 'Mute'}>
            <i className={`fa ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
