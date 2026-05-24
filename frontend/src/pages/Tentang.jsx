import '../styles/tentang.css';

const MEMBERS = [
  ["Nama anggota",           "ROLE"],
  ["Nama anggota",                   "ROLE"],
  ["Nama anggota",  "ROLE"],
  ["Nama anggota",                "ROLE"],
  ["Nama anggota",        "ROLE"],
  ["Nama anggota",          "ROLE"],
  ["Nama anggota",        "ROLE"],
  ["Nama anggota",                 "ROLE"],
  ["Nama anggota",               "ROLE"],
  ["Nama anggota",    "ROLE"],
  ["Nama anggota",        "ROLE"],
];

const TEACHERS = [
  ["Nama Pembimbing", "Guru Pembimbing"],
  ["Nama Pembimbing",       "Guru Pembimbing"],
];

function roleClass(r) {
  return 't-role-' + r.toLowerCase().replace(/[^a-z]/g, '');
}

export default function Tentang() {
  return (
    <main className="main-content" style={{ padding: 0 }}>
      <div className="tentang-wrap">

        <div className="t-header">
          <div className="t-tag"><i className="fa fa-users" /> Kelompok 6</div>
          <h1 className="t-title">Anggota Kelompok</h1>
          <p className="t-desc">
            Sebelas anggota yang membangun projek <strong>Penyiram Tanaman Otomatis</strong>{' '}
            berbasis IoT — dari hardware ESP32 hingga dashboard web real-time.
          </p>
          <div className="t-stats">
            <div className="t-stat"><span className="t-stat-num">11</span><span className="t-stat-lbl">Anggota</span></div>
            <div className="t-stat-div" />
            <div className="t-stat"><span className="t-stat-num">2</span><span className="t-stat-lbl">Pembimbing</span></div>
            <div className="t-stat-div" />
            <div className="t-stat"><span className="t-stat-num">1</span><span className="t-stat-lbl">Proyek</span></div>
          </div>
        </div>

        <div className="t-section-label" style={{ marginBottom: 0 }}>
          <i className="fa fa-id-badge" /> Anggota
        </div>

        <div className="t-roster">
          {MEMBERS.map(([name, rolesStr], i) => {
            const roles = rolesStr.split(',').map(r => r.trim());
            return (
              <div className="t-row" key={name}>
                <span className="t-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="t-avatar">
                  <img
                    src={`/img/anggota/member-${i + 1}.jpg`}
                    alt={name}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="t-avatar-fallback" style={{ display: 'none' }}>
                    <i className="fa fa-user" />
                  </div>
                </div>
                <div className="t-info">
                  <span className="t-name">{name}</span>
                  <div className="t-roles">
                    {roles.map(r => (
                      <span key={r} className={`t-role ${roleClass(r)}`}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="t-section-label" style={{ marginBottom: 0 }}>
          <i className="fa fa-chalkboard-user" /> Guru Pembimbing
        </div>

        <div className="t-teachers t-teachers-bottom">
          {TEACHERS.map(([name, role]) => (
            <div className="t-teacher-row" key={name}>
              <div className="t-teacher-icon"><i className="fa fa-user-tie" /></div>
              <div>
                <div className="t-teacher-name">{name}</div>
                <div className="t-teacher-role">{role}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
