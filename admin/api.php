<?php

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'message' => 'Unauthorized']);
  exit;
}

initTables();
$pdo    = getDB();
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $action ?: ($body['action'] ?? '');

if ($action === 'list') {

  $page   = max(1, intval($_GET['page'] ?? 1));
  $limit  = 15;
  $offset = ($page - 1) * $limit;
  $cat    = $_GET['category'] ?? '';
  $search = trim($_GET['search'] ?? '');

  $where  = [];
  $params = [];

  if ($cat && in_array($cat, ['saran','kritik','bug','lainnya'])) {
    $where[]  = "category = :cat";
    $params[':cat'] = $cat;
  }

  if ($search) {
    $where[]  = "(pesan LIKE :s OR nama LIKE :s2)";
    $params[':s']  = "%$search%";
    $params[':s2'] = "%$search%";
  }

  $whereStr = $where ? 'WHERE ' . implode(' AND ', $where) : '';

  $countStmt = $pdo->prepare("SELECT COUNT(*) FROM feedback $whereStr");
  $countStmt->execute($params);
  $total = $countStmt->fetchColumn();

  $stmt = $pdo->prepare("
    SELECT id, nama, email, category, pesan, rating,
           reply, reply_by, reply_at, created_at, ip
    FROM feedback
    $whereStr
    ORDER BY created_at DESC
    LIMIT $limit OFFSET $offset
  ");
  $stmt->execute($params);
  $rows = $stmt->fetchAll();

  echo json_encode([
    'success' => true,
    'data'    => $rows,
    'total'   => (int)$total,
    'page'    => $page,
    'pages'   => ceil($total / $limit),
  ]);
  exit;
}

if ($action === 'reply') {

  $id    = intval($body['id'] ?? 0);
  $reply = trim($body['reply'] ?? '');

  if (!$id || empty($reply)) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
    exit;
  }

  if (strlen($reply) > 2000) {
    echo json_encode(['success' => false, 'message' => 'Balasan terlalu panjang']);
    exit;
  }

  $stmt = $pdo->prepare("
    UPDATE feedback
    SET reply = :reply, reply_by = :by, reply_at = NOW()
    WHERE id = :id
  ");

  $stmt->execute([
    ':reply' => $reply,
    ':by'    => $_SESSION['admin_name'] ?? $_SESSION['admin_user'],
    ':id'    => $id,
  ]);

  echo json_encode(['success' => true, 'message' => 'Balasan berhasil dikirim']);
  exit;
}

if ($action === 'delete_feedback') {

  $id = intval($body['id'] ?? 0);
  if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID tidak valid']);
    exit;
  }

  $pdo->prepare("DELETE FROM feedback WHERE id = ?")->execute([$id]);
  echo json_encode(['success' => true]);
  exit;
}

if ($action === 'add_admin') {

  $username = trim($body['username'] ?? '');
  $name     = trim($body['name']     ?? '');
  $password = trim($body['password'] ?? '');

  if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username dan password wajib diisi']);
    exit;
  }

  if (strlen($password) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password minimal 8 karakter']);
    exit;
  }

  
  $check = $pdo->prepare("SELECT COUNT(*) FROM admins WHERE username = ?");
  $check->execute([$username]);
  if ($check->fetchColumn() > 0) {
    echo json_encode(['success' => false, 'message' => 'Username sudah digunakan']);
    exit;
  }

  $hash = password_hash($password, PASSWORD_DEFAULT);
  $pdo->prepare("INSERT INTO admins (username, password, name) VALUES (?, ?, ?)")
      ->execute([$username, $hash, $name ?: null]);

  $newId = $pdo->lastInsertId();

  echo json_encode([
    'success' => true,
    'admin'   => ['id' => $newId, 'username' => $username, 'name' => $name]
  ]);
  exit;
}

if ($action === 'delete_admin') {

  $id = intval($body['id'] ?? 0);

  if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID tidak valid']);
    exit;
  }

  
  if ($id === intval($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Tidak bisa menghapus akun sendiri']);
    exit;
  }

  
  $count = $pdo->query("SELECT COUNT(*) FROM admins")->fetchColumn();
  if ($count <= 1) {
    echo json_encode(['success' => false, 'message' => 'Minimal harus ada 1 admin']);
    exit;
  }

  $pdo->prepare("DELETE FROM admins WHERE id = ?")->execute([$id]);
  echo json_encode(['success' => true]);
  exit;
}

if ($action === 'list_admins') {
  $rows = $pdo->query("SELECT id, username, name, created_at FROM admins ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(['success' => true, 'admins' => $rows]);
  exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action']);
