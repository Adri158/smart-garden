import { Outlet } from 'react-router-dom';
import AppBar from './AppBar';

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar />
      <Outlet />
    </div>
  );
}
