<?php

session_start();

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../shared/layout.php';

if (!empty($_SESSION['admin_id'])) {
  header('Location: ../dashboard.php');
  exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

  $username = trim($_POST['username'] ?? '');
  $password = trim($_POST['password'] ?? '');

  if (empty($username) || empty($password)) {
    $error = 'Username dan password wajib diisi';
  } else {
    try {
      initTables();
      $pdo  = getDB();
      $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ? LIMIT 1");
      $stmt->execute([$username]);
      $admin = $stmt->fetch();

      if ($admin && password_verify($password, $admin['password'])) {
        $_SESSION['admin_id']   = $admin['id'];
        $_SESSION['admin_user'] = $admin['username'];
        $_SESSION['admin_name'] = $admin['name'] ?? $admin['username'];
        session_regenerate_id(true);
        header('Location: ../dashboard.php');
        exit;
      } else {
        sleep(1); 
        $error = 'Username atau password salah';
      }
    } catch (Exception $e) {
      $error = 'Server error. Coba lagi.';
    }
  }
}
sgHead('Admin Login', '<link rel="stylesheet" href="../css/admin.css?v=1.0.0">');
?>
<script>document.body.classList.add('admin-body');</script>

  <div class="login-wrap">

    <div class="login-logo">
      <i class="fa fa-seedling"></i>
      Smart Garden
    </div>

    <div class="login-card">

      <div class="login-header">
        <div class="login-title">Admin Panel</div>
        <div class="login-sub">Masuk untuk kelola feedback</div>
      </div>

      <?php if ($error): ?>
      <div class="alert alert-error">
        <i class="fa fa-circle-exclamation"></i>
        <?= htmlspecialchars($error) ?>
      </div>
      <?php endif; ?>

      <form method="POST" action="login" autocomplete="off">

        <div class="field-group">
          <label class="field-label">Username</label>
          <div class="field-wrap">
            <i class="fa fa-user field-icon"></i>
            <input
              type="search"
              name="username"
              class="field-input"
              placeholder="Username admin"
              value="<?= htmlspecialchars($_POST['username'] ?? '') ?>"
              autocomplete="off"
              required>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">Password</label>
          <div class="field-wrap">
            <i class="fa fa-lock field-icon"></i>
            <input
              type="password"
              name="password"
              class="field-input"
              placeholder="Password"
              autocomplete="current-password"
              required>
          </div>
        </div>

        <button type="submit" class="login-btn">
          <i class="fa fa-right-to-bracket"></i>
          Masuk
        </button>

      </form>

    </div>

    <div class="login-back">
      <a href="../dashboard.php">
        <i class="fa fa-arrow-left"></i> Kembali ke Dashboard
      </a>
    </div>

  </div>

<?php sgFoot(); ?>
