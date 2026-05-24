import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const isPWA = window.matchMedia('(display-mode: standalone)').matches
           || window.navigator.standalone === true;

const PAGE_HELP = {
  '/dashboard': {
    icon: 'fa-gauge-high',
    title: 'Dashboard',
    desc: 'Monitor kondisi kebun secara real-time. Data sensor langsung dari ESP32, kontrol pompa, dan analisis tren historis.',
    features: [
      { icon: 'fa-seedling',     text: 'Soil Moisture — kelembaban tanah + grafik realtime 20 titik terakhir' },
      { icon: 'fa-toggle-on',    text: 'Kontrol — nyalain/matiin pompa & ganti mode AUTO/MANUAL' },
      { icon: 'fa-chart-line',   text: 'Grafik Historis — tren sensor dari 1 jam sampai 1 bulan' },
      { icon: 'fa-cloud-sun',    text: 'Cuaca — prakiraan & peluang hujan via Open-Meteo' },
      { icon: 'fa-microchip',    text: 'Info Device — firmware, IP, RSSI, uptime ESP32' },
    ],
  },
  '/settings': {
    icon: 'fa-sliders',
    title: 'Pengaturan',
    desc: 'Konfigurasi parameter sistem — threshold sensor, jadwal penyiraman otomatis, dan manajemen device.',
    features: [
      { icon: 'fa-droplet',      text: 'Threshold Tanah — batas min/max kelembaban untuk mode AUTO' },
      { icon: 'fa-calendar',     text: 'Jadwal — atur hari & jam siram otomatis' },
      { icon: 'fa-microchip',    text: 'Device — ganti nama perangkat ESP32' },
      { icon: 'fa-robot',        text: 'Mode AUTO — pompa nyala otomatis kalau tanah terlalu kering' },
    ],
  },
  '/sistem': {
    icon: 'fa-server',
    title: 'Sistem',
    desc: 'Pantau kesehatan infrastruktur — server, layanan backend, dan konektivitas IoT.',
    features: [
      { icon: 'fa-microchip',    text: 'CPU & RAM — resource usage server real-time' },
      { icon: 'fa-hard-drive',   text: 'Disk — kapasitas penyimpanan tersisa' },
      { icon: 'fa-wifi',         text: 'MQTT — status broker Mosquitto' },
      { icon: 'fa-database',     text: 'Database — status koneksi MariaDB' },
    ],
  },
  '/feedback': {
    icon: 'fa-comment-dots',
    title: 'Feedback',
    desc: 'Kirim masukan, saran, atau laporan bug untuk sistem Smart Garden.',
    features: [
      { icon: 'fa-star',         text: 'Rating — beri nilai 1–5 bintang' },
      { icon: 'fa-pen',          text: 'Komentar — tulis masukan spesifik' },
      { icon: 'fa-paper-plane',  text: 'Submit — langsung tersimpan ke database' },
    ],
  },
  '/feedback/list': {
    icon: 'fa-list',
    title: 'Daftar Feedback',
    desc: 'Lihat semua feedback yang sudah masuk dari pengguna sistem.',
    features: [
      { icon: 'fa-star',         text: 'Rating — distribusi bintang dari semua pengguna' },
      { icon: 'fa-clock',        text: 'Timeline — feedback terbaru tampil di atas' },
    ],
  },
  '/dokumentasi': {
    icon: 'fa-book',
    title: 'Dokumentasi',
    desc: 'Foto dan video dokumentasi proyek Smart Garden.',
    features: [
      { icon: 'fa-image',        text: 'Foto — gambar rangkaian & wiring' },
      { icon: 'fa-film',         text: 'Video — rekaman perakitan & demo' },
    ],
  },
  '/panduan': {
    icon: 'fa-circle-question',
    title: 'Panduan',
    desc: 'Tutorial langkah demi langkah cara menggunakan Smart Garden Dashboard dari awal.',
    features: [
      { icon: 'fa-wifi',         text: 'Setup — koneksiin ESP32 ke WiFi & MQTT' },
      { icon: 'fa-gauge-high',   text: 'Dashboard — cara baca sensor & kontrol pompa' },
      { icon: 'fa-sliders',      text: 'Pengaturan — atur threshold & jadwal siram' },
      { icon: 'fa-wrench',       text: 'Troubleshoot — solusi masalah umum' },
    ],
  },
  '/tentang': {
    icon: 'fa-users',
    title: 'Tentang',
    desc: 'Informasi proyek Smart Garden — tim pengembang, teknologi yang digunakan, dan latar belakang.',
    features: [
      { icon: 'fa-graduation-cap', text: 'Kelompok 6 — anggota tim & peran masing-masing' },
      { icon: 'fa-code',           text: 'Tech Stack — ESP32, React, Laravel, MQTT, MariaDB' },
      { icon: 'fa-lightbulb',      text: 'Latar Belakang — motivasi & tujuan proyek' },
    ],
  },
};

const DEFAULT_HELP = {
  icon: 'fa-circle-question',
  title: 'Bantuan',
  desc: 'Navigasi ke halaman mana pun untuk melihat penjelasan spesifik.',
  features: [],
};

export default function HelpWidget() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [open, setOpen]             = useState(false);
  const [tab, setTab]               = useState('info');
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [streaming, setStreaming]   = useState(false);
  const panelRef  = useRef(null);
  const bottomRef = useRef(null);

  const page    = PAGE_HELP[location.pathname] || DEFAULT_HELP;
  const pageKey = location.pathname.replace(/^\//, '') || '';

  useEffect(() => { setMessages([]); setTab('info'); }, [location.pathname]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    function onOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const userMsg = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setStreaming(true);
    setMessages(m => [...m, { role: 'assistant', content: '', streaming: true }]);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: newMsgs.map(({ role, content }) => ({ role, content })),
          page: pageKey,
          isAdmin: isAuthenticated,
          isPWA,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages(m => m.slice(0, -1).concat({ role: 'assistant', content: err.message || 'Error.', streaming: false }));
        return;
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '', full = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const d = line.slice(6).trim();
          if (d === '[DONE]') continue;
          try {
            const token = JSON.parse(d)?.content;
            if (token) {
              full += token;
              setMessages(m => m.slice(0, -1).concat({ role: 'assistant', content: full, streaming: true }));
            }
          } catch (_) {}
        }
      }
      setMessages(m => m.slice(0, -1).concat({ role: 'assistant', content: full, streaming: false }));
    } catch {
      setMessages(m => m.slice(0, -1).concat({ role: 'assistant', content: 'Koneksi gagal.', streaming: false }));
    } finally {
      setStreaming(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div className="hw-root" ref={panelRef}>
      <div className={`hw-panel${open ? ' hw-open' : ''}`}>
        <div className="hw-head">
          <div className="hw-head-left">
            <i className={`fa ${page.icon} hw-head-ico`} />
            <span className="hw-head-title">{page.title}</span>
          </div>
          <button className="hw-close" onClick={() => setOpen(false)}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        <div className="hw-tabs">
          <button className={`hw-tab${tab === 'info' ? ' active' : ''}`} onClick={() => setTab('info')}>
            <i className="fa fa-circle-info" /> Info
          </button>
          <button className={`hw-tab${tab === 'chat' ? ' active' : ''}`} onClick={() => setTab('chat')}>
            <i className="fa fa-message" /> Tanya
          </button>
        </div>

        {tab === 'info' && (
          <div className="hw-body hw-info">
            <p className="hw-desc">{page.desc}</p>
            {page.features.length > 0 && (
              <ul className="hw-features">
                {page.features.map((f, i) => (
                  <li key={i} className="hw-feature">
                    <i className={`fa ${f.icon} hw-feature-ico`} />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'chat' && (
          <div className="hw-body hw-chat-body">
            <div className="hw-messages">
              {messages.length === 0 && (
                <div className="hw-chat-empty">
                  <i className="fa fa-message" />
                  <span>Tanya apa aja tentang halaman ini!</span>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`hw-msg hw-msg-${m.role}`}>
                  {m.content || (m.streaming ? <span className="hw-typing">...</span> : '')}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="hw-input-row">
              <input
                className="hw-input"
                type="text"
                placeholder="Ketik pertanyaan..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                disabled={streaming}
              />
              <button className="hw-send" onClick={sendMessage} disabled={streaming || !input.trim()}>
                <i className={`fa ${streaming ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        className={`hw-btn${open ? ' hw-btn-open' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="Bantuan"
      >
        <i className={`fa ${open ? 'fa-xmark' : 'fa-circle-question'}`} />
      </button>
    </div>
  );
}
