<?php

session_start();

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../shared/layout.php';

if (empty($_SESSION['admin_id'])) {
  header('Location: login.php');
  exit;
}

initTables();
$pdo       = getDB();
$adminName = $_SESSION['admin_name'] ?? 'Admin';

$total   = $pdo->query("SELECT COUNT(*) FROM feedback")->fetchColumn();
$unread  = $pdo->query("SELECT COUNT(*) FROM feedback WHERE reply IS NULL")->fetchColumn();
$avgRaw  = $pdo->query("SELECT AVG(rating) FROM feedback WHERE rating > 0")->fetchColumn();
$avg     = $avgRaw ? number_format((float)$avgRaw, 1) : '—';

$admins = $pdo->query("SELECT id, username, name, created_at FROM admins ORDER BY id ASC")->fetchAll();
sgHead('Admin Panel', '<link rel="stylesheet" href="../css/admin.css?v=1.0.0">');
sgAdminBar('admin');
?>

  <main class="admin-main main-content">

    <!-- STATS ROW -->
    <div class="admin-stats">

      <div class="astat-card">
        <div class="astat-val"><?= $total ?></div>
        <div class="astat-label">Total Feedback</div>
      </div>

      <div class="astat-card highlight">
        <div class="astat-val"><?= $unread ?></div>
        <div class="astat-label">Belum Dibalas</div>
      </div>

      <div class="astat-card">
        <div class="astat-val"><?= $avg ?></div>
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

    <!-- ── TAB: FEEDBACK ── -->
    <div class="tab-content" id="tabFeedback">

      <!-- FILTER -->
      <div class="filter-row">
        <button class="filter-btn active" onclick="filterFeedback('', this)">Semua</button>
        <button class="filter-btn" onclick="filterFeedback('saran', this)">💡 Saran</button>
        <button class="filter-btn" onclick="filterFeedback('kritik', this)">⚠️ Kritik</button>
        <button class="filter-btn" onclick="filterFeedback('bug', this)">🐛 Bug</button>
        <button class="filter-btn" onclick="filterFeedback('lainnya', this)">• Lainnya</button>
        <div class="filter-search">
          <input type="text" id="searchInput" placeholder="Cari feedback..." oninput="searchFeedback(this.value)">
        </div>
      </div>

      <!-- LIST -->
      <div id="feedbackList" class="fb-admin-list">
        <div class="loading-state">
          <i class="fa fa-spinner fa-spin"></i> Memuat...
        </div>
      </div>

      <div class="pagination" id="pagination"></div>

    </div>

    <!-- ── TAB: ADMINS ── -->
    <div class="tab-content hidden" id="tabAdmins">

      <div class="admins-wrap">

        <!-- ADD ADMIN FORM -->
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

        <!-- ADMIN LIST -->
        <div class="admin-list-card">
          <div class="afc-title">Daftar Admin</div>
          <div class="admin-list">
            <?php foreach ($admins as $a): ?>
            <div class="admin-row" id="adminRow<?= $a['id'] ?>">
              <div class="admin-info">
                <div class="admin-uname"><?= htmlspecialchars($a['username']) ?></div>
                <div class="admin-rname"><?= htmlspecialchars($a['name'] ?? '—') ?></div>
              </div>
              <div class="admin-meta">
                <?php if ($a['id'] == $_SESSION['admin_id']): ?>
                  <span class="badge-you">Kamu</span>
                <?php else: ?>
                  <button class="del-admin-btn" onclick="deleteAdmin(<?= $a['id'] ?>, '<?= htmlspecialchars($a['username']) ?>')">
                    <i class="fa fa-trash"></i>
                  </button>
                <?php endif; ?>
              </div>
            </div>
            <?php endforeach; ?>
          </div>
        </div>

      </div>

    </div>

  </main>

  <!-- ── REPLY MODAL ── -->
  <div class="modal-backdrop" id="replyBackdrop" onclick="closeReply()"></div>
  <div class="modal" id="replyModal">

    <div class="modal-header">
      <span class="modal-title">
        <i class="fa fa-reply"></i> Balas Feedback
      </span>
      <button class="modal-close" onclick="closeReply()">
        <i class="fa fa-xmark"></i>
      </button>
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

  <script src="../js/admin.js?v=1.0.2"></script>
  <?php sgFoot(); ?>
