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
$admins    = $pdo->query("SELECT id, username, name, created_at FROM admins ORDER BY id ASC")->fetchAll();

sgHead('Admin Panel', '<link rel="stylesheet" href="../css/admin.css?v=1.0.0">');
sgAdminBar('admin');
?>

  <main class="admin-main main-content">

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

  </main>

  <script src="../js/admin.js?v=1.0.2"></script>
  <?php sgFoot(); ?>
