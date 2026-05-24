import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <p className="text-7xl font-bold mb-4" style={{ color: 'var(--blue)' }}>
        404
      </p>
      <h1 className="text-2xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        URL yang kamu cari tidak ada atau sudah dipindah.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl font-medium text-sm"
        style={{ backgroundColor: 'var(--blue)', color: '#fff' }}
      >
        Kembali ke Home
      </Link>
    </div>
  );
}
