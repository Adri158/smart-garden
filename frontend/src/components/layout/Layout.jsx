import { Outlet } from 'react-router-dom';
import AppBar from './AppBar';
import HelpWidget from '../ui/HelpWidget';

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar />
      <Outlet />
      <HelpWidget />
    </div>
  );
}
