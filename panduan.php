<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/shared/layout.php';
sgHead('Panduan', '<link rel="stylesheet" href="css/panduan.css?v=1.6">');
sgAppBar('panduan');
?>

<main class="main-content">
  <div class="panduan-wrap">

    
    <div class="pd-header">
      <div class="pd-tag"><i class="fa fa-book-open"></i> Dokumentasi Sistem</div>
      <h1 class="pd-title">Panduan Penggunaan</h1>
      <p class="pd-desc">Panduan lengkap menggunakan sistem Smart Garden — dari membaca sensor hingga mengatur jadwal penyiraman otomatis.</p>
    </div>

    
    <div class="pd-toc">
      <div class="pd-toc-title"><i class="fa fa-list"></i> Daftar Isi</div>
      <div class="pd-toc-links">
        <a href="#dashboard" class="pd-toc-link"><span class="pd-toc-num">01</span> Dashboard</a>
        <a href="#sensor"    class="pd-toc-link"><span class="pd-toc-num">02</span> Sensor</a>
        <a href="#kontrol"   class="pd-toc-link"><span class="pd-toc-num">03</span> Kontrol Pompa</a>
        <a href="#settings"  class="pd-toc-link"><span class="pd-toc-num">04</span> Settings</a>
        <a href="#jadwal"    class="pd-toc-link"><span class="pd-toc-num">05</span> Jadwal Penyiraman</a>
        <a href="#esp32info" class="pd-toc-link"><span class="pd-toc-num">06</span> Info ESP32</a>
        <a href="#sistem"    class="pd-toc-link"><span class="pd-toc-num">07</span> Halaman Sistem</a>
        <a href="#device"    class="pd-toc-link"><span class="pd-toc-num">08</span> Multi-Device</a>
        <a href="#admin"     class="pd-toc-link"><span class="pd-toc-num">09</span> Akses Admin</a>
      </div>
    </div>

    
    <section class="pd-section" id="dashboard">
      <div class="pd-section-num">01</div>
      <h2 class="pd-section-title">Dashboard</h2>
      <p class="pd-text">Dashboard adalah halaman utama untuk memantau kondisi tanaman secara <em>real-time</em> melalui koneksi MQTT langsung dari ESP32.</p>

      <div class="pd-table-wrap">
        <table class="pd-table">
          <thead><tr><th>Fitur</th><th>Keterangan</th></tr></thead>
          <tbody>
            <tr><td>Status ESP32</td><td>Indikator di pojok kanan atas — ONLINE jika data masuk dalam 3 detik terakhir, OFFLINE jika tidak ada respons.</td></tr>
            <tr><td>Device Selector</td><td>Dropdown di panel Kontrol untuk berpindah antar ESP32. Dot <span style="color:var(--green)">●</span> hijau = online, <span style="color:var(--red)">●</span> merah = offline. Semua data menyesuaikan device yang dipilih.</td></tr>
            <tr><td>Info ESP32</td><td>Panel ketiga di dashboard — Device ID, firmware, IP, SSID, RSSI, heap, uptime. Diperbarui tiap 30 detik.</td></tr>
            <tr><td>Grafik Real-time</td><td>Grafik kelembaban tanah diperbarui tiap kali ESP32 kirim data baru via MQTT tanpa reload halaman.</td></tr>
            <tr><td>Grafik Historis</td><td>Pilih sensor dan rentang waktu (1J, 6J, 24J, 1M, 1Bln) untuk melihat data historis per device.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    
    <section class="pd-section" id="sensor">
      <div class="pd-section-num">02</div>
      <h2 class="pd-section-title">Sensor</h2>
      <p class="pd-text">ESP32 membaca empat jenis sensor yang ditampilkan di metric strip bagian atas dashboard.</p>

      <div class="pd-table-wrap">
        <table class="pd-table">
          <thead>
            <tr>
              <th>Sensor</th>
              <th>Satuan</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><i class="fa fa-seedling" style="color:var(--green)"></i> Kelembaban Tanah</td>
              <td class="mono">%</td>
              <td>Dibaca dari pin ADC (pin 32). Nilai 0% = sangat kering, 100% = sangat basah.</td>
            </tr>
            <tr>
              <td><i class="fa fa-temperature-half" style="color:var(--amber)"></i> Suhu Udara</td>
              <td class="mono">°C</td>
              <td>Sensor DHT11 (pin 14). Mengukur suhu udara di sekitar tanaman.</td>
            </tr>
            <tr>
              <td><i class="fa fa-droplet" style="color:var(--blue)"></i> Kelembaban Udara</td>
              <td class="mono">%</td>
              <td>Sensor DHT11 (pin 14). Mengukur kelembaban relatif udara.</td>
            </tr>
            <tr>
              <td><i class="fa fa-water" style="color:#06b6d4"></i> Suhu Air</td>
              <td class="mono">°C</td>
              <td>Sensor DS18B20 (pin 5). Mengukur suhu air dalam wadah/selang irigasi.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    
    <section class="pd-section" id="kontrol">
      <div class="pd-section-num">03</div>
      <h2 class="pd-section-title">Kontrol Pompa</h2>
      <p class="pd-text">Pompa air dapat dikontrol secara otomatis oleh sistem maupun manual oleh pengguna.</p>

      <div class="pd-table-wrap">
        <table class="pd-table">
          <thead><tr><th>Mode</th><th>Perilaku</th><th>Keterangan</th></tr></thead>
          <tbody>
            <tr>
              <td><i class="fa fa-robot" style="color:var(--green)"></i> <strong>AUTO</strong></td>
              <td>Otomatis oleh ESP32</td>
              <td>Pompa nyala jika kelembaban &lt; Soil Min, mati jika ≥ Soil Max. Badge <em>"Dikontrol sistem"</em> tampil di toggle pompa.</td>
            </tr>
            <tr>
              <td><i class="fa fa-hand" style="color:var(--blue)"></i> <strong>MANUAL</strong></td>
              <td>Dikontrol pengguna</td>
              <td>Toggle pompa di dashboard aktif. Perintah dikirim via MQTT, berlaku dalam ~1 detik.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    
    <section class="pd-section" id="settings">
      <div class="pd-section-num">04</div>
      <h2 class="pd-section-title">Settings — Sensor Threshold</h2>
      <p class="pd-text">Threshold menentukan kapan pompa nyala dan mati secara otomatis dalam mode AUTO. Pengaturan disimpan per-device — tiap ESP32 bisa punya nilai threshold yang berbeda.</p>

      <div class="pd-callout warning" style="margin-bottom:16px">
        <i class="fa fa-shield-halved"></i>
        <span>Halaman Settings hanya bisa diakses oleh <strong>Admin</strong>. Login dulu melalui ikon <i class="fa fa-shield-halved"></i> di pojok kanan bawah sidebar.</span>
      </div>

      <div class="pd-steps">
        <div class="pd-step">
          <div class="pd-step-num">1</div>
          <div>Login sebagai admin, lalu buka halaman <strong>Settings</strong> dari sidebar.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">2</div>
          <div>Pastikan device yang benar sudah dipilih di dropdown <strong>Device</strong> bagian atas.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">3</div>
          <div>Geser slider <strong>Soil Moisture Minimum</strong> — pompa akan nyala jika kelembaban di bawah nilai ini.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">4</div>
          <div>Geser slider <strong>Soil Moisture Maximum</strong> — pompa akan mati jika kelembaban sudah mencapai nilai ini.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">5</div>
          <div>Klik <strong>Simpan &amp; Kirim</strong> — settings disimpan ke database dan langsung dikirim ke ESP32 via MQTT.</div>
        </div>
      </div>

      <div class="pd-callout warning">
        <i class="fa fa-triangle-exclamation"></i>
        <span>Pastikan nilai <strong>Soil Min</strong> selalu lebih kecil dari <strong>Soil Max</strong> agar pompa tidak nyala-mati terus-menerus.</span>
      </div>
    </section>

    
    <section class="pd-section" id="jadwal">
      <div class="pd-section-num">05</div>
      <h2 class="pd-section-title">Jadwal Penyiraman</h2>
      <p class="pd-text">Sistem mendukung jadwal penyiraman otomatis berdasarkan hari dan jam. Jadwal dijalankan oleh ESP32 secara mandiri.</p>

      <div class="pd-steps">
        <div class="pd-step">
          <div class="pd-step-num">1</div>
          <div>Di bagian <strong>Jadwal Penyiraman</strong>, pilih hari-hari yang diinginkan (Sen–Min).</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">2</div>
          <div>Atur jam penyiraman menggunakan input waktu, lalu klik <strong>Tambah</strong>.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">3</div>
          <div>Jadwal yang sudah ditambah muncul di daftar. Toggle untuk mengaktifkan/menonaktifkan.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">4</div>
          <div>Klik <strong>Kirim Semua Jadwal ke ESP32</strong> agar ESP32 menerima daftar jadwal terbaru.</div>
        </div>
      </div>

      <div class="pd-callout info">
        <i class="fa fa-circle-info"></i>
        <span>Jadwal hanya berjalan saat ESP32 menyala dan terhubung ke jaringan. Jadwal tersimpan di memori ESP32 (EEPROM) sehingga tetap aktif meski server mati.</span>
      </div>
    </section>

    
    <section class="pd-section" id="esp32info">
      <div class="pd-section-num">06</div>
      <h2 class="pd-section-title">Info ESP32</h2>
      <p class="pd-text">Panel <strong>Info ESP32</strong> di dashboard menampilkan data teknis perangkat secara otomatis — tidak perlu interaksi apapun.</p>

      <div class="pd-table-wrap">
        <table class="pd-table">
          <thead>
            <tr><th>Field</th><th>Keterangan</th></tr>
          </thead>
          <tbody>
            <tr><td class="mono">DeviceID</td><td>ID unik device, diambil dari MAC address ESP32.</td></tr>
            <tr><td class="mono">FW</td><td>Versi firmware yang sedang berjalan.</td></tr>
            <tr><td class="mono">IP</td><td>Alamat IP lokal ESP32 di jaringan WiFi.</td></tr>
            <tr><td class="mono">MAC</td><td>Alamat MAC ESP32.</td></tr>
            <tr><td class="mono">SSID</td><td>Nama jaringan WiFi yang tersambung.</td></tr>
            <tr><td class="mono">RSSI</td><td>Kekuatan sinyal WiFi dalam dBm. Makin besar (mendekati 0), makin kuat.</td></tr>
            <tr><td class="mono">Heap</td><td>Memori bebas ESP32 dalam byte.</td></tr>
            <tr><td class="mono">CPU</td><td>Frekuensi CPU ESP32 dalam MHz.</td></tr>
            <tr><td class="mono">Uptime</td><td>Durasi ESP32 menyala sejak boot terakhir.</td></tr>
          </tbody>
        </table>
      </div>

      <div class="pd-callout info" style="margin-top: 16px">
        <i class="fa fa-circle-info"></i>
        <span>Data diperbarui otomatis setiap <strong>30 detik</strong> via MQTT. Saat berganti device di dropdown, panel langsung mereset dan memuat data device baru.</span>
      </div>
    </section>

    
    <section class="pd-section" id="sistem">
      <div class="pd-section-num">07</div>
      <h2 class="pd-section-title">Halaman Sistem</h2>
      <p class="pd-text">Halaman <strong>Sistem</strong> di sidebar menampilkan kondisi server secara real-time — CPU, RAM, disk, dan uptime — diperbarui setiap 1 detik via MQTT.</p>

      <div class="pd-table-wrap">
        <table class="pd-table">
          <thead>
            <tr><th>Metrik</th><th>Keterangan</th></tr>
          </thead>
          <tbody>
            <tr><td><i class="fa fa-microchip" style="color:var(--blue)"></i> CPU</td><td>Persentase penggunaan CPU beserta load average 1/5/15 menit. Bar kuning &gt;60%, merah &gt;80%.</td></tr>
            <tr><td><i class="fa fa-memory" style="color:var(--amber)"></i> RAM</td><td>RAM terpakai vs total dalam MB. Bar warna mengikuti tingkat pemakaian.</td></tr>
            <tr><td><i class="fa fa-hard-drive" style="color:var(--green)"></i> Disk</td><td>Kapasitas disk terpakai vs total. Berguna untuk memantau pertumbuhan database sensor logs.</td></tr>
            <tr><td><i class="fa fa-clock" style="color:var(--blue)"></i> Uptime</td><td>Durasi server menyala dalam format hari, jam, dan menit sejak boot terakhir.</td></tr>
          </tbody>
        </table>
      </div>

      <div class="pd-callout info">
        <i class="fa fa-circle-info"></i>
        <span>Halaman Sistem terhubung langsung ke broker MQTT — tidak ada permintaan ke database. Data diterima dari server backend setiap <strong>1 detik</strong>.</span>
      </div>
    </section>

    
    <section class="pd-section" id="device">
      <div class="pd-section-num">08</div>
      <h2 class="pd-section-title">Multi-Device</h2>
      <p class="pd-text">Sistem mendukung lebih dari satu ESP32. Setiap device dikenali secara otomatis saat pertama kali terhubung ke MQTT broker.</p>

      <div class="pd-steps">
        <div class="pd-step">
          <div class="pd-step-num"><i class="fa fa-bolt"></i></div>
          <div>Device baru <strong>otomatis terdaftar</strong> begitu mengirim data ke broker MQTT pertama kali — tidak perlu registrasi manual.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num"><i class="fa fa-arrows-left-right"></i></div>
          <div>Gunakan dropdown <strong>Device</strong> di dashboard atau settings untuk berpindah antar ESP32. Data sensor, threshold, dan jadwal tiap device <strong>terpisah</strong>.</div>
        </div>
      </div>

      <div class="pd-callout info">
        <i class="fa fa-circle-info"></i>
        <span>Device ID otomatis diambil dari MAC address ESP32 — dijamin unik, tidak perlu diubah manual. Format: <code>esp32-aabbccddeeff</code>.</span>
      </div>
    </section>

    
    <section class="pd-section" id="admin">
      <div class="pd-section-num">09</div>
      <h2 class="pd-section-title">Akses Admin</h2>
      <p class="pd-text">Mode Admin memberikan akses ke halaman Settings, kelola feedback, dan manajemen akun admin. Sidebar menampilkan label peran pengguna secara otomatis.</p>

      <div class="pd-steps">
        <div class="pd-step">
          <div class="pd-step-num">1</div>
          <div>Klik ikon <i class="fa fa-shield-halved"></i> di pojok kanan bawah sidebar untuk membuka halaman login admin.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">2</div>
          <div>Masukkan <strong>username</strong> dan <strong>password</strong> admin, lalu klik <strong>Masuk</strong>.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">3</div>
          <div>Setelah login berhasil, akan diarahkan ke <strong>Dashboard</strong>. Sidebar kini menampilkan badge <strong>Admin</strong> dan menambahkan menu <strong>Settings</strong> dan <strong>Admin</strong>.</div>
        </div>
        <div class="pd-step">
          <div class="pd-step-num">4</div>
          <div>Untuk logout, klik ikon <i class="fa fa-right-from-bracket"></i> di pojok kanan bawah sidebar.</div>
        </div>
      </div>

      <div class="pd-table-wrap">
        <table class="pd-table">
          <thead><tr><th>Menu Admin</th><th>Keterangan</th></tr></thead>
          <tbody>
            <tr><td><i class="fa fa-gear" style="color:var(--blue)"></i> Settings</td><td>Atur threshold sensor, jadwal penyiraman, interval publish, dan trigger OTA update per-device.</td></tr>
            <tr><td><i class="fa fa-shield-halved" style="color:var(--blue)"></i> Admin</td><td>Kelola feedback (balas, filter, cari) dan manajemen akun admin (tambah/hapus).</td></tr>
          </tbody>
        </table>
      </div>
    </section>

  </div>
</main>

<?php sgFoot(); ?>
