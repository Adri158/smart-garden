<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('title', 'Admin') — Smart Garden</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <style>
    /* ── Design System — matches /css/global.css + /css/admin.css ── */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; user-select: none; }
    input, textarea, [contenteditable] { user-select: text; }

    :root {
      --bg:        #07090f;
      --surface:   #0d1117;
      --raise:     #131b27;
      --panel:     #111827;
      --blue:      #3b82f6;
      --blue-dim:  rgba(59,130,246,0.12);
      --blue-glow: rgba(59,130,246,0.35);
      --green:     #22c55e;
      --red:       #ef4444;
      --amber:     #f59e0b;
      --text:      #e2e8f0;
      --muted:     #64748b;
      --faint-text:#334155;
      --border:    rgba(255,255,255,0.06);
      --radius:    10px;
    }

    html, body { height: 100%; }

    body {
      font-family: 'DM Sans', sans-serif;
      color: var(--text);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    body::before {
      content: "";
      position: fixed; inset: 0;
      pointer-events: none; z-index: 0;
      background-image: radial-gradient(circle, rgba(59,130,246,0.03) 1px, transparent 1px);
      background-size: 38px 38px;
      animation: gridMove 120s linear infinite;
    }
    @keyframes gridMove { from { transform: translate(0,0); } to { transform: translate(-60px,-60px); } }

    body::after {
      content: "";
      position: fixed; width: 500px; height: 500px;
      top: 40%; left: 50%; transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%);
      pointer-events: none; z-index: 0;
    }

    /* ── AppBar ── */
    .app-bar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      height: 52px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px;
      background: rgba(13,17,23,0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .app-bar-logo {
      font-family: 'Space Mono', monospace;
      font-size: 12px; font-weight: 700; letter-spacing: 2px;
      color: var(--blue); text-transform: uppercase;
      display: flex; align-items: center; gap: 8px;
      text-decoration: none;
    }
    .app-bar-logo i { font-size: 14px; }
    .app-bar-right { display: flex; align-items: center; gap: 10px; }
    .admin-badge {
      display: flex; align-items: center; gap: 6px;
      font-family: 'Space Mono', monospace; font-size: 10px;
      letter-spacing: 1px; color: var(--muted);
      padding: 4px 12px;
      background: var(--raise); border: 1px solid var(--border); border-radius: 20px;
    }
    .hud-exit {
      font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 1px;
      color: var(--muted); background: transparent;
      border: 1px solid var(--border); padding: 5px 12px; border-radius: 6px;
      cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; gap: 6px;
    }
    .hud-exit:hover { color: var(--red); border-color: rgba(239,68,68,0.3); }

    /* ── Main Content ── */
    .main-content { padding-top: 52px; min-height: 100vh; position: relative; z-index: 2; }

    @yield('extra-styles')
  </style>
</head>
<body>

<nav class="app-bar">
  <a class="app-bar-logo" href="{{ route('admin.dashboard') }}">
    <i class="fa fa-leaf"></i> Smart Garden
  </a>
  <div class="app-bar-right">
    <div class="admin-badge">
      <i class="fa fa-circle" style="color:var(--green);font-size:7px;"></i>
      ADMIN — {{ session('admin_name', 'Admin') }}
    </div>
    <form method="POST" action="{{ route('admin.logout') }}" style="display:inline;">
      @csrf
      <button type="submit" class="hud-exit">
        <i class="fa fa-right-from-bracket"></i> Keluar
      </button>
    </form>
  </div>
</nav>

@yield('content')

@yield('scripts')
</body>
</html>
