<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login — Smart Garden</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; user-select:none; }
    input { user-select:text; }
    :root {
      --bg:#07090f; --surface:#0d1117; --raise:#131b27;
      --blue:#3b82f6; --blue-dim:rgba(59,130,246,0.12); --blue-glow:rgba(59,130,246,0.35);
      --green:#22c55e; --red:#ef4444;
      --text:#e2e8f0; --muted:#64748b;
      --border:rgba(255,255,255,0.06);
    }
    html, body { height: 100%; }
    body {
      font-family: 'DM Sans', sans-serif;
      color: var(--text); background: var(--bg);
      -webkit-font-smoothing: antialiased;
      overflow: hidden;
    }
    body::before {
      content:""; position:fixed; inset:0; pointer-events:none; z-index:0;
      background-image: radial-gradient(circle, rgba(59,130,246,0.03) 1px, transparent 1px);
      background-size: 38px 38px;
      animation: gridMove 120s linear infinite;
    }
    @keyframes gridMove { from{transform:translate(0,0)} to{transform:translate(-60px,-60px)} }
    body::after {
      content:""; position:fixed; width:500px; height:500px;
      top:40%; left:50%; transform:translate(-50%,-50%);
      background:radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%);
      pointer-events:none; z-index:0;
    }

    /* -- Layout -- */
    .admin-body {
      min-height:100vh; display:flex; align-items:center; justify-content:center; overflow:auto;
      position:relative; z-index:2;
    }
    .login-wrap {
      width:100%; max-width:380px; padding:24px;
      display:flex; flex-direction:column; align-items:center; gap:20px;
    }
    .login-logo {
      font-family:'Space Mono',monospace; font-size:14px; font-weight:700;
      letter-spacing:2px; color:var(--blue); text-transform:uppercase;
      display:flex; align-items:center; gap:8px;
    }
    .login-card {
      width:100%; background:var(--surface);
      border:1px solid var(--border); border-radius:16px; overflow:hidden;
    }
    .login-header { padding:24px 24px 20px; border-bottom:1px solid var(--border); }
    .login-title {
      font-family:'Space Mono',monospace; font-size:14px; font-weight:700;
      color:var(--text); letter-spacing:1px; margin-bottom:4px;
    }
    .login-sub { font-size:12px; color:var(--muted); }
    .alert {
      display:flex; align-items:center; gap:8px; padding:10px 24px;
      font-size:12px; border-bottom:1px solid var(--border);
    }
    .alert-error {
      background:rgba(239,68,68,0.08); color:var(--red);
      border-color:rgba(239,68,68,0.2);
    }
    .login-card form { padding:20px 24px 24px; display:flex; flex-direction:column; gap:14px; }
    .field-group { display:flex; flex-direction:column; gap:6px; }
    .field-label { font-size:11px; color:var(--muted); font-weight:500; letter-spacing:0.5px; }
    .field-wrap { position:relative; display:flex; align-items:center; }
    .field-icon { position:absolute; left:12px; color:var(--muted); font-size:12px; }
    .field-input {
      width:100%; background:var(--raise); border:1px solid var(--border);
      color:var(--text); padding:10px 12px 10px 34px;
      border-radius:8px; font-size:13px; font-family:inherit; outline:none;
      transition:border-color 0.2s, box-shadow 0.2s;
    }
    .field-input:focus { border-color:var(--blue); box-shadow:0 0 8px rgba(59,130,246,0.2); }
    .login-btn {
      display:flex; align-items:center; justify-content:center; gap:8px;
      width:100%; padding:12px; background:var(--blue); color:#fff;
      border:none; border-radius:8px; font-size:13px; font-weight:600;
      cursor:pointer; transition:all 0.2s; margin-top:4px; font-family:inherit;
    }
    .login-btn:hover { filter:brightness(1.12); box-shadow:0 0 20px rgba(59,130,246,0.4); }
    .login-back { font-size:12px; }
    .login-back a {
      color:var(--muted); text-decoration:none;
      display:flex; align-items:center; gap:6px; transition:color 0.2s;
    }
    .login-back a:hover { color:var(--blue); }
  </style>
</head>
<body>
<div class="admin-body">
  <div class="login-wrap">

    <div class="login-logo">
      <i class="fa fa-leaf"></i> Smart Garden
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="login-title">ADMIN ACCESS</div>
        <div class="login-sub">Masuk ke panel administrasi</div>
      </div>

      @if($error)
        <div class="alert alert-error">
          <i class="fa fa-circle-exclamation"></i> {{ $error }}
        </div>
      @endif

      <form method="POST" action="{{ route('admin.login.post') }}">
        @csrf

        <div class="field-group">
          <label class="field-label">USERNAME</label>
          <div class="field-wrap">
            <i class="fa fa-user field-icon"></i>
            <input type="text" name="username" class="field-input" placeholder="username" autocomplete="username" required>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">PASSWORD</label>
          <div class="field-wrap">
            <i class="fa fa-lock field-icon"></i>
            <input type="password" name="password" class="field-input" placeholder="••••••••" autocomplete="current-password" required>
          </div>
        </div>

        <button type="submit" class="login-btn">
          <i class="fa fa-right-to-bracket"></i> Masuk
        </button>
      </form>
    </div>

    <div class="login-back">
      <a href="{{ config('app.url') }}">
        <i class="fa fa-arrow-left"></i> Kembali ke Dashboard
      </a>
    </div>

  </div>
</div>
</body>
</html>
