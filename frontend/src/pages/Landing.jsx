import { Link } from 'react-router-dom';
import '../styles/landing.css';

const FEATURES = [
  {
    icon: '📡',
    title: 'Real-time Monitoring',
    desc: 'Data sensor langsung via MQTT WebSocket — kelembaban tanah, suhu udara, suhu air, dan kelembaban udara.',
  },
  {
    icon: '💧',
    title: 'Kontrol Pompa',
    desc: 'Aktifkan pompa air secara manual atau biarkan sistem AUTO menyiram berdasarkan threshold kelembaban.',
  },
  {
    icon: '📅',
    title: 'Jadwal Penyiraman',
    desc: 'Atur jadwal penyiraman otomatis per hari dan jam, dikirim langsung ke ESP32 via MQTT.',
  },
  {
    icon: '📊',
    title: 'Riwayat Data',
    desc: 'Grafik historis sensor dengan range 1 jam hingga 1 bulan untuk analisis kondisi taman.',
  },
  {
    icon: '🖥️',
    title: 'Server Monitoring',
    desc: 'Pantau CPU, RAM, disk, dan uptime server secara real-time.',
  },
  {
    icon: '📱',
    title: 'PWA Ready',
    desc: 'Install sebagai app di smartphone. Bekerja offline dengan fallback page.',
  },
];

export default function Landing() {
  return (
    <div className="landing-page">

      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '60px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(6,8,15,0.85)',
        backdropFilter: 'blur(12px)',
      }}>
        <div className="nav-brand">
          <div className="dot" />
          SMART GARDEN
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/tentang">Tentang</Link>
          <Link to="/dashboard" className="nav-cta">Buka App</Link>
        </div>
      </nav>


      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-tag">
          <span style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 8px var(--green)',
            display: 'inline-block',
            flexShrink: 0,
          }} />
          Kelompok 6 — IoT Project
        </div>
        <h1 className="hero-title">
          <span className="thin">Sistem Penyiram</span>
          <span className="accent">Tanaman</span>
          <span className="thin">Otomatis</span>
        </h1>
        <p className="hero-desc">
          Monitoring dan kontrol taman cerdas berbasis ESP32. Sensor real-time,
          otomatisasi kelembaban, jadwal penyiraman, dan dashboard web modern.
        </p>
        <div className="hero-actions">
          <Link to="/dashboard" className="btn-primary">Buka Dashboard →</Link>
          <Link to="/tentang" className="btn-secondary">Tentang Project</Link>
        </div>
      </section>


      <div className="stats-strip">
        <div className="stat-item">
          <span className="stat-val">4</span>
          <span className="stat-label">Sensor</span>
        </div>
        <div className="stat-item">
          <span className="stat-val">MQTT</span>
          <span className="stat-label">Protocol</span>
        </div>
        <div className="stat-item">
          <span className="stat-val">ESP32</span>
          <span className="stat-label">Hardware</span>
        </div>
        <div className="stat-item">
          <span className="stat-val">24/7</span>
          <span className="stat-label">Monitoring</span>
        </div>
      </div>


      <section>
        <div className="features">
          <div className="features-head">
            <div className="section-tag">Fitur Sistem</div>
            <h2 className="section-title">
              Semua yang lo butuh untuk<br />taman cerdas
            </h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <footer>
        <div className="footer-brand">SMART GARDEN &copy; 2025</div>
        <div className="footer-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/tentang">Tentang</Link>
          <Link to="/feedback">Feedback</Link>
        </div>
      </footer>
    </div>
  );
}
