@extends('admin.layout')

@section('title', 'Admin Dashboard')

@section('extra-styles')
<style>
  /* ── Admin-specific styles — matches /css/admin.css ── */
  .admin-main {
    max-width: 1100px; margin: 0 auto; padding: 24px 24px 60px;
    position: relative; z-index: 2;
  }

  /* Stats */
  .admin-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background: var(--border);
    border: 1px solid var(--border); border-radius: 12px;
    overflow: hidden; margin-bottom: 24px;
  }
  .astat-card { background: var(--surface); padding: 20px 24px; text-align: center; }
  .astat-card.highlight { background: var(--raise); }
  .astat-val {
    font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700;
    color: var(--blue); margin-bottom: 4px;
  }
  .astat-label {
    font-size: 11px; color: var(--muted);
    letter-spacing: 1px; text-transform: uppercase;
  }

  /* Tabs */
  .admin-tabs {
    display: flex; gap: 4px; margin-bottom: 20px;
    border-bottom: 1px solid var(--border); padding-bottom: 0;
  }
  .tab-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 18px; font-size: 12px;
    font-family: 'Space Mono', monospace; letter-spacing: 0.5px;
    color: var(--muted); background: transparent;
    border: none; border-bottom: 2px solid transparent;
    cursor: pointer; transition: all 0.2s; margin-bottom: -1px;
  }
  .tab-btn:hover { color: var(--text); }
  .tab-btn.active { color: var(--blue); border-bottom-color: var(--blue); }
  .tab-content { display: block; }
  .tab-content.hidden { display: none; }

  /* Filter */
  .filter-row {
    display: flex; gap: 8px; flex-wrap: wrap;
    align-items: center; margin-bottom: 16px;
  }
  .filter-btn {
    padding: 6px 14px; font-size: 11px;
    font-family: 'Space Mono', monospace;
    border-radius: 20px; border: 1px solid var(--border);
    background: transparent; color: var(--muted);
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
  }
  .filter-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }
  .filter-btn.active {
    background: var(--blue-dim); color: var(--blue);
    border-color: rgba(59,130,246,0.3);
  }
  .filter-search { margin-left: auto; }
  .filter-search input {
    background: var(--raise); border: 1px solid var(--border);
    color: var(--text); padding: 7px 14px; border-radius: 8px;
    font-size: 12px; font-family: inherit; outline: none;
    width: 200px; transition: border-color 0.2s;
    user-select: text;
  }
  .filter-search input:focus { border-color: var(--blue); }

  /* Feedback list */
  .fb-admin-list { display: flex; flex-direction: column; gap: 12px; }
  .fb-admin-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden; transition: border-color 0.2s;
  }
  .fb-admin-card:hover { border-color: rgba(59,130,246,0.2); }
  .fb-admin-card.has-reply { border-color: rgba(34,197,94,0.15); }
  .fba-head {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-bottom: 1px solid var(--border);
    background: var(--raise); flex-wrap: wrap;
  }
  .fba-cat {
    font-family: 'Space Mono', monospace; font-size: 9px;
    letter-spacing: 1.5px; text-transform: uppercase;
    padding: 3px 8px; border-radius: 4px; font-weight: 700;
  }
  .cat-saran   { background: rgba(59,130,246,0.12);  color: var(--blue); }
  .cat-kritik  { background: rgba(245,158,11,0.12);  color: var(--amber); }
  .cat-bug     { background: rgba(239,68,68,0.12);   color: var(--red); }
  .cat-lainnya { background: rgba(100,116,139,0.12); color: var(--muted); }
  .fba-name   { font-size: 12px; font-weight: 600; color: var(--text); }
  .fba-email  { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted); }
  .fba-time   { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted); margin-left: auto; }
  .fba-stars  { font-size: 11px; color: var(--amber); letter-spacing: 1px; }
  .fba-body   { padding: 14px 16px; }
  .fba-pesan  { font-size: 13px; color: var(--text); line-height: 1.7; margin-bottom: 12px; }
  .fba-reply-box {
    background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.15);
    border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;
  }
  .fba-reply-label {
    font-family: 'Space Mono', monospace; font-size: 9px;
    letter-spacing: 1.5px; color: var(--green); text-transform: uppercase; margin-bottom: 6px;
  }
  .fba-reply-text { font-size: 12px; color: var(--text); line-height: 1.6; }
  .fba-reply-meta { font-size: 10px; color: var(--muted); margin-top: 4px; font-family: 'Space Mono', monospace; }
  .fba-actions { display: flex; gap: 8px; }
  .fba-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 6px;
    font-size: 11px; font-family: 'Space Mono', monospace;
    letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s;
    border: 1px solid var(--border); background: transparent; color: var(--muted);
  }
  .fba-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }
  .fba-btn-reply { color: var(--blue); border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.06); }
  .fba-btn-reply:hover { background: rgba(59,130,246,0.14); color: var(--blue); }
  .fba-btn-del { color: var(--red); border-color: rgba(239,68,68,0.2); }
  .fba-btn-del:hover { background: rgba(239,68,68,0.08); color: var(--red); }

  /* Pagination */
  .pagination { display: flex; gap: 6px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
  .page-btn {
    width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
    border-radius: 6px; font-family: 'Space Mono', monospace; font-size: 11px;
    border: 1px solid var(--border); background: transparent; color: var(--muted);
    cursor: pointer; transition: all 0.2s;
  }
  .page-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }
  .page-btn.active { background: var(--blue); color: #fff; border-color: var(--blue); }

  /* States */
  .loading-state, .empty-state {
    text-align: center; padding: 48px 24px;
    font-family: 'Space Mono', monospace; font-size: 12px;
    color: var(--muted); letter-spacing: 1px;
  }
  .empty-state i { font-size: 28px; display: block; margin-bottom: 12px; }

  /* Admins panel */
  .admins-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .admin-form-card, .admin-list-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .afc-title {
    font-family: 'Space Mono', monospace; font-size: 10px;
    letter-spacing: 2px; color: var(--muted); text-transform: uppercase;
    padding-bottom: 12px; border-bottom: 1px solid var(--border);
  }
  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label { font-size: 11px; color: var(--muted); font-weight: 500; letter-spacing: 0.5px; }
  .field-wrap { position: relative; display: flex; align-items: center; }
  .field-icon { position: absolute; left: 12px; color: var(--muted); font-size: 12px; }
  .field-input {
    width: 100%; background: var(--raise); border: 1px solid var(--border);
    color: var(--text); padding: 10px 12px 10px 34px;
    border-radius: 8px; font-size: 13px; font-family: inherit; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s; user-select: text;
  }
  .field-input:focus { border-color: var(--blue); box-shadow: 0 0 8px rgba(59,130,246,0.2); }
  textarea.field-input { padding-left: 12px; resize: vertical; min-height: 80px; }
  .login-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px; background: var(--blue); color: #fff;
    border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .login-btn:hover { filter: brightness(1.12); box-shadow: 0 0 20px rgba(59,130,246,0.4); }
  .admin-list {
    display: flex; flex-direction: column; gap: 1px;
    background: var(--border); border-radius: 8px; overflow: hidden;
  }
  .admin-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; background: var(--raise);
  }
  .admin-uname { font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; color: var(--text); }
  .admin-rname { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .badge-you {
    font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 1px;
    color: var(--green); background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.2); padding: 3px 8px; border-radius: 4px;
  }
  .del-admin-btn {
    background: transparent; border: 1px solid rgba(239,68,68,0.2);
    color: var(--red); width: 28px; height: 28px; border-radius: 6px;
    cursor: pointer; font-size: 11px; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .del-admin-btn:hover { background: rgba(239,68,68,0.1); }
  #adminAlert { font-size: 12px; font-family: 'Space Mono', monospace; }

  /* Modal */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px); z-index: 500;
    opacity: 0; pointer-events: none; transition: opacity 0.25s;
  }
  .modal-backdrop.active { opacity: 1; pointer-events: auto; }
  .modal {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -48%);
    width: 480px; max-width: calc(100vw - 32px);
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; box-shadow: 0 0 40px rgba(0,0,0,0.6);
    z-index: 510; opacity: 0; pointer-events: none;
    transition: opacity 0.25s, transform 0.25s;
  }
  .modal.active { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%); }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
  }
  .modal-title {
    font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 1.5px;
    color: var(--text); font-weight: 700; display: flex; align-items: center; gap: 8px;
  }
  .modal-title i { color: var(--blue); }
  .modal-close {
    background: transparent; border: none; color: var(--muted);
    font-size: 14px; cursor: pointer; padding: 4px 6px; border-radius: 6px; transition: all 0.2s;
  }
  .modal-close:hover { color: var(--text); background: var(--raise); }
  .modal-body { padding: 20px; }
  .reply-original {
    background: var(--raise); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px 14px; font-size: 13px; color: var(--muted); line-height: 1.6;
    font-style: italic; max-height: 120px; overflow-y: auto;
  }
  .modal-error { font-size: 11px; color: var(--red); font-family: 'Space Mono', monospace; min-height: 16px; margin-top: 8px; }
  .modal-footer {
    display: flex; justify-content: flex-end; gap: 8px;
    padding: 14px 20px; border-top: 1px solid var(--border);
  }
  .modal-cancel {
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); padding: 8px 16px; border-radius: 8px;
    font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .modal-cancel:hover { color: var(--text); }
  .modal-submit {
    display: flex; align-items: center; gap: 7px;
    background: var(--blue); color: #fff; border: none;
    padding: 8px 18px; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .modal-submit:hover { filter: brightness(1.1); }
  .modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  @media (max-width: 768px) {
    .admin-stats  { grid-template-columns: 1fr; }
    .admins-wrap  { grid-template-columns: 1fr; }
    .filter-search { margin-left: 0; width: 100%; }
    .filter-search input { width: 100%; }
  }
</style>
@endsection

@section('content')
<main class="admin-main main-content">

  <!-- STATS ROW -->
  <div class="admin-stats">
    <div class="astat-card">
      <div class="astat-val">{{ $total }}</div>
      <div class="astat-label">Total Feedback</div>
    </div>
    <div class="astat-card highlight">
      <div class="astat-val">{{ $unread }}</div>
      <div class="astat-label">Belum Dibalas</div>
    </div>
    <div class="astat-card">
      <div class="astat-val">{{ $avg ? number_format((float)$avg, 1) : '—' }}</div>
      <div class="astat-label">Rating Rata-rata</div>
    </div>
  </div>

  <!-- TABS -->
  <div class="admin-tabs">
    <button class="tab-btn active" onclick="switchTab('feedback', this)">
      <i class="fa fa-comment-dots"></i> Feedback
    </button>
    <button class="tab-btn" onclick="switchTab('admins', this)">
      <i class="fa fa-users"></i> Kelola Admin
    </button>
  </div>

  <!-- TAB: FEEDBACK -->
  <div class="tab-content" id="tabFeedback">
    <div class="filter-row">
      <button class="filter-btn active" onclick="filterFeedback('', this)">Semua</button>
      <button class="filter-btn" onclick="filterFeedback('saran', this)">Saran</button>
      <button class="filter-btn" onclick="filterFeedback('kritik', this)">Kritik</button>
      <button class="filter-btn" onclick="filterFeedback('bug', this)">Bug</button>
      <button class="filter-btn" onclick="filterFeedback('lainnya', this)">Lainnya</button>
      <div class="filter-search">
        <input type="text" id="searchInput" placeholder="Cari feedback..." oninput="searchFeedback(this.value)">
      </div>
    </div>
    <div id="feedbackList" class="fb-admin-list">
      <div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Memuat...</div>
    </div>
    <div class="pagination" id="pagination"></div>
  </div>

  <!-- TAB: ADMINS -->
  <div class="tab-content hidden" id="tabAdmins">
    <div class="admins-wrap">
      <div class="admin-form-card">
        <div class="afc-title">Tambah Admin Baru</div>
        <div id="adminAlert"></div>
        <div class="field-group">
          <label class="field-label">Username</label>
          <div class="field-wrap">
            <i class="fa fa-user field-icon"></i>
            <input type="text" id="newUsername" class="field-input" placeholder="username">
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Nama Lengkap</label>
          <div class="field-wrap">
            <i class="fa fa-id-card field-icon"></i>
            <input type="text" id="newName" class="field-input" placeholder="Nama tampilan">
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Password</label>
          <div class="field-wrap">
            <i class="fa fa-lock field-icon"></i>
            <input type="password" id="newPassword" class="field-input" placeholder="Min 8 karakter">
          </div>
        </div>
        <button class="login-btn" onclick="addAdmin()" style="margin-top:8px;">
          <i class="fa fa-plus"></i> Tambah Admin
        </button>
      </div>

      <div class="admin-list-card">
        <div class="afc-title">Daftar Admin</div>
        <div class="admin-list" id="adminList">
          @foreach($admins as $a)
          <div class="admin-row" id="adminRow{{ $a->id }}">
            <div class="admin-info">
              <div class="admin-uname">{{ $a->username }}</div>
              <div class="admin-rname">{{ $a->name ?? '—' }}</div>
            </div>
            <div class="admin-meta">
              @if($a->id == session('admin_id'))
                <span class="badge-you">Kamu</span>
              @else
                <button class="del-admin-btn" onclick="deleteAdmin({{ $a->id }}, '{{ $a->username }}')">
                  <i class="fa fa-trash"></i>
                </button>
              @endif
            </div>
          </div>
          @endforeach
        </div>
      </div>
    </div>
  </div>

</main>

<!-- REPLY MODAL -->
<div class="modal-backdrop" id="replyBackdrop" onclick="closeReply()"></div>
<div class="modal" id="replyModal">
  <div class="modal-header">
    <span class="modal-title"><i class="fa fa-reply"></i> Balas Feedback</span>
    <button class="modal-close" onclick="closeReply()"><i class="fa fa-xmark"></i></button>
  </div>
  <div class="modal-body">
    <div class="reply-original" id="replyOriginal"></div>
    <div class="field-group" style="margin-top:14px;">
      <label class="field-label">Balasan Admin</label>
      <textarea id="replyText" class="field-input" style="min-height:100px;resize:vertical;" placeholder="Tulis balasan..."></textarea>
    </div>
    <div class="modal-error" id="replyError"></div>
  </div>
  <div class="modal-footer">
    <button class="modal-cancel" onclick="closeReply()">Batal</button>
    <button class="modal-submit" id="replySubmitBtn" onclick="submitReply()">
      <i class="fa fa-paper-plane"></i> Kirim Balasan
    </button>
  </div>
</div>
@endsection

@section('scripts')
<script>
const CSRF = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// ── Tab switching ──
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  btn.classList.add('active');
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.remove('hidden');
}

// ── Feedback state ──
let _cat = '', _search = '', _page = 1, _searchTimer = null;
let _replyId = null;

function filterFeedback(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _cat = cat; _page = 1;
  loadFeedback();
}

function searchFeedback(val) {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => { _search = val; _page = 1; loadFeedback(); }, 300);
}

function goPage(p) { _page = p; loadFeedback(); }

async function loadFeedback() {
  document.getElementById('feedbackList').innerHTML = '<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Memuat...</div>';

  const params = new URLSearchParams({ page: _page });
  if (_cat)    params.set('category', _cat);
  if (_search) params.set('search', _search);

  const res  = await fetch('/admin/feedback?' + params);
  const json = await res.json();

  if (!json.success || !json.data.length) {
    document.getElementById('feedbackList').innerHTML = '<div class="empty-state"><i class="fa fa-inbox"></i> Tidak ada feedback</div>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  document.getElementById('feedbackList').innerHTML = json.data.map(renderCard).join('');
  renderPagination(json.page, json.pages);
}

function renderCard(f) {
  const stars = f.rating > 0 ? '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating) : '';
  const catClass = { saran:'cat-saran', kritik:'cat-kritik', bug:'cat-bug', lainnya:'cat-lainnya' }[f.category] || 'cat-lainnya';
  const replyHtml = f.reply
    ? `<div class="fba-reply-box">
         <div class="fba-reply-label">Balasan Admin</div>
         <div class="fba-reply-text">${esc(f.reply)}</div>
         <div class="fba-reply-meta">${esc(f.reply_by)} · ${fmtDate(f.reply_at)}</div>
       </div>` : '';
  return `
  <div class="fb-admin-card${f.reply ? ' has-reply' : ''}">
    <div class="fba-head">
      <span class="fba-cat ${catClass}">${f.category || 'lainnya'}</span>
      <span class="fba-name">${esc(f.nama || 'Anonim')}</span>
      ${f.email ? `<span class="fba-email">${esc(f.email)}</span>` : ''}
      ${stars ? `<span class="fba-stars">${stars}</span>` : ''}
      <span class="fba-time">${fmtDate(f.created_at)}</span>
    </div>
    <div class="fba-body">
      <div class="fba-pesan">${esc(f.pesan)}</div>
      ${replyHtml}
      <div class="fba-actions">
        <button class="fba-btn fba-btn-reply" onclick="openReply(${f.id}, ${JSON.stringify(f.pesan)})">
          <i class="fa fa-reply"></i> ${f.reply ? 'Edit Balasan' : 'Balas'}
        </button>
        <button class="fba-btn fba-btn-del" onclick="deleteFeedback(${f.id})">
          <i class="fa fa-trash"></i> Hapus
        </button>
      </div>
    </div>
  </div>`;
}

function renderPagination(page, pages) {
  if (pages <= 1) { document.getElementById('pagination').innerHTML = ''; return; }
  let html = '';
  for (let p = 1; p <= pages; p++) {
    html += `<button class="page-btn${p === page ? ' active' : ''}" onclick="goPage(${p})">${p}</button>`;
  }
  document.getElementById('pagination').innerHTML = html;
}

// ── Reply modal ──
function openReply(id, text) {
  _replyId = id;
  document.getElementById('replyOriginal').textContent = text;
  document.getElementById('replyText').value = '';
  document.getElementById('replyError').textContent = '';
  document.getElementById('replyBackdrop').classList.add('active');
  document.getElementById('replyModal').classList.add('active');
}
function closeReply() {
  document.getElementById('replyBackdrop').classList.remove('active');
  document.getElementById('replyModal').classList.remove('active');
}
async function submitReply() {
  const reply = document.getElementById('replyText').value.trim();
  if (!reply) { document.getElementById('replyError').textContent = 'Balasan tidak boleh kosong'; return; }

  const btn = document.getElementById('replySubmitBtn');
  btn.disabled = true;

  const res  = await fetch(`/admin/feedback/${_replyId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
    body: JSON.stringify({ reply }),
  });
  const json = await res.json();
  btn.disabled = false;

  if (json.success) { closeReply(); loadFeedback(); }
  else document.getElementById('replyError').textContent = json.message;
}

// ── Delete feedback ──
async function deleteFeedback(id) {
  if (!confirm('Hapus feedback ini?')) return;
  await fetch(`/admin/feedback/${id}`, {
    method: 'DELETE',
    headers: { 'X-CSRF-TOKEN': CSRF },
  });
  loadFeedback();
}

// ── Admin management ──
async function addAdmin() {
  const username = document.getElementById('newUsername').value.trim();
  const name     = document.getElementById('newName').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const alertEl  = document.getElementById('adminAlert');

  const res  = await fetch('/admin/admins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
    body: JSON.stringify({ username, name, password }),
  });
  const json = await res.json();

  if (json.success) {
    alertEl.innerHTML = `<span style="color:var(--green);font-size:12px;"><i class="fa fa-check"></i> Admin ${username} berhasil ditambah</span>`;
    document.getElementById('newUsername').value = '';
    document.getElementById('newName').value = '';
    document.getElementById('newPassword').value = '';
    // Append new row to list
    const list = document.getElementById('adminList');
    const div  = document.createElement('div');
    div.className = 'admin-row';
    div.id = `adminRow${json.admin.id}`;
    div.innerHTML = `
      <div class="admin-info">
        <div class="admin-uname">${esc(json.admin.username)}</div>
        <div class="admin-rname">${esc(json.admin.name || '—')}</div>
      </div>
      <div class="admin-meta">
        <button class="del-admin-btn" onclick="deleteAdmin(${json.admin.id}, '${esc(json.admin.username)}')">
          <i class="fa fa-trash"></i>
        </button>
      </div>`;
    list.appendChild(div);
  } else {
    alertEl.innerHTML = `<span style="color:var(--red);font-size:12px;"><i class="fa fa-circle-exclamation"></i> ${json.message}</span>`;
  }
}

async function deleteAdmin(id, username) {
  if (!confirm(`Hapus admin "${username}"?`)) return;
  const res  = await fetch(`/admin/admins/${id}`, {
    method: 'DELETE',
    headers: { 'X-CSRF-TOKEN': CSRF },
  });
  const json = await res.json();
  if (json.success) {
    const row = document.getElementById(`adminRow${id}`);
    if (row) row.remove();
  } else {
    alert(json.message);
  }
}

// ── Helpers ──
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// Auto-load feedback on page load
loadFeedback();
</script>
@endsection
