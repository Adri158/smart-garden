import { useState, useEffect } from 'react';
import '../styles/sistem.css';

export default function Sistem() {
  const [data, setData]       = useState(null);
  const [online, setOnline]   = useState(false);
  const [label, setLabel]     = useState('Menghubungkan...');

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {

        let res = await fetch('/api/server/stats').catch(() => null);
        if (!res || !res.ok) res = await fetch('/server_status.php');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const raw = await res.json();

        if (cancelled) return;




        let normalized;
        if (raw.cpu_pct !== undefined) {

          normalized = {
            cpu_pct:    raw.cpu_pct,
            load:       raw.load ?? [],
            ram_pct:    raw.ram_pct,
            ram_used:   raw.ram_used,
            ram_total:  raw.ram_total,
            disk_pct:   raw.disk_pct,
            disk_used:  raw.disk_used,
            disk_total: raw.disk_total,
            uptime_sec: raw.uptime_sec,
            hostname:   raw.hostname,
            os:         raw.os,
            kernel:     raw.kernel,
            cpu_model:  raw.cpu_model,
            cores:      raw.cores,
          };
        } else {

          const cpuPct   = raw?.data?.cpu?.percent ?? raw?.cpu?.percent ?? null;
          const mem      = raw?.data?.memory ?? raw?.memory ?? null;
          const disk     = raw?.data?.disk ?? raw?.disk ?? null;
          const up       = raw?.data?.uptime?.seconds ?? raw?.uptime?.seconds ?? null;
          const loadArr  = raw?.data?.load_avg ?? raw?.load_avg ?? [];
          const info     = raw?.data ?? raw ?? {};
          normalized = {
            cpu_pct:    cpuPct != null ? Math.round(cpuPct) : null,
            load:       loadArr,
            ram_pct:    mem ? Math.round(mem.percent) : null,
            ram_used:   mem ? Math.round(mem.used_bytes / 1024 / 1024) : null,
            ram_total:  mem ? Math.round(mem.total_bytes / 1024 / 1024) : null,
            disk_pct:   disk ? Math.round(disk.percent) : null,
            disk_used:  disk ? Math.round(disk.used_bytes / 1024 / 1024) : null,
            disk_total: disk ? Math.round(disk.total_bytes / 1024 / 1024) : null,
            uptime_sec: up,
            hostname:   info.hostname ?? '—',
            os:         info.os ?? '—',
            kernel:     info.kernel ?? '—',
            cpu_model:  info.cpu_model ?? info.cpu?.model ?? '—',
            cores:      info.cpu?.cores ?? info.cores ?? '—',
          };
        }

        setData(normalized);
        setOnline(true);
        setLabel('Server online');
      } catch {
        if (cancelled) return;
        setOnline(false);
        setLabel('Gagal mengambil data');
      }
    }

    fetchStats();
    const id = setInterval(fetchStats, 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  function uptime(s) {
    if (!s) return '—';
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return d > 0 ? `${d} hari ${h} jam ${m} mnt` : `${h} jam ${m} mnt`;
  }

  function barClass(pct) {
    if (pct >= 80) return 'sis-bar-fill danger';
    if (pct >= 60) return 'sis-bar-fill warn';
    return 'sis-bar-fill';
  }

  return (
    <main className="main-content" style={{ padding: 0 }}>
      <div className="sis-wrap">

        <div className="sis-head">
          <div className="sis-eyebrow">Smart Garden</div>
          <h1 className="sis-title">Status Sistem</h1>
          <div className="sis-status-row">
            <span className={`sis-dot${online ? '' : ' offline'}`} />
            <span>{label}</span>
          </div>
        </div>

        <div className="sis-stats">


          <div className="sis-stat">
            <div className="sis-stat-label"><i className="fa fa-microchip" /> CPU</div>
            <div className="sis-stat-val">
              {data?.cpu_pct ?? '—'}<span className="unit">%</span>
            </div>
            <div className="sis-bar-track">
              <div className={barClass(data?.cpu_pct)} style={{ width: (data?.cpu_pct ?? 0) + '%' }} />
            </div>
            <div className="sis-stat-sub">
              {data?.load?.length ? 'Load: ' + data.load.join('  ') : '—'}
            </div>
          </div>


          <div className="sis-stat">
            <div className="sis-stat-label"><i className="fa fa-memory" /> RAM</div>
            <div className="sis-stat-val">
              {data?.ram_pct ?? '—'}<span className="unit">%</span>
            </div>
            <div className="sis-bar-track">
              <div className={barClass(data?.ram_pct)} style={{ width: (data?.ram_pct ?? 0) + '%' }} />
            </div>
            <div className="sis-stat-sub">
              {data?.ram_used != null ? `${data.ram_used} / ${data.ram_total} MB` : '—'}
            </div>
          </div>


          <div className="sis-stat">
            <div className="sis-stat-label"><i className="fa fa-hard-drive" /> Disk</div>
            <div className="sis-stat-val">
              {data?.disk_pct ?? '—'}<span className="unit">%</span>
            </div>
            <div className="sis-bar-track">
              <div className={barClass(data?.disk_pct)} style={{ width: (data?.disk_pct ?? 0) + '%' }} />
            </div>
            <div className="sis-stat-sub">
              {data?.disk_used != null ? `${data.disk_used} / ${data.disk_total} MB` : '—'}
            </div>
          </div>


          <div className="sis-stat">
            <div className="sis-stat-label"><i className="fa fa-clock" /> Uptime</div>
            <div className="sis-stat-val" style={{ fontSize: 36, paddingTop: 4, letterSpacing: 1 }}>
              {uptime(data?.uptime_sec)}
            </div>
            <div className="sis-bar-track" />
            <div className="sis-stat-sub">
              {data?.uptime_sec != null ? data.uptime_sec + 's total' : '—'}
            </div>
          </div>

        </div>

        <div className="sis-info-head">Informasi Sistem</div>
        <div className="sis-table">
          <div className="sis-row"><span className="sis-key">Hostname</span><span className="sis-val">{data?.hostname ?? '—'}</span></div>
          <div className="sis-row"><span className="sis-key">OS</span><span className="sis-val">{data?.os ?? '—'}</span></div>
          <div className="sis-row"><span className="sis-key">Kernel</span><span className="sis-val">{data?.kernel ?? '—'}</span></div>
          <div className="sis-row"><span className="sis-key">CPU Model</span><span className="sis-val">{data?.cpu_model ?? '—'}</span></div>
          <div className="sis-row"><span className="sis-key">Cores</span><span className="sis-val">{data?.cores != null ? data.cores + ' cores' : '—'}</span></div>
          <div className="sis-row"><span className="sis-key">Load Avg</span><span className="sis-val">{data?.load?.length ? data.load.join(' / ') : '—'}</span></div>
        </div>

      </div>
    </main>
  );
}
