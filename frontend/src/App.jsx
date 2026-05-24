import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Sistem from './pages/Sistem';
import Feedback from './pages/Feedback';
import FeedbackList from './pages/FeedbackList';
import Dokumentasi from './pages/Dokumentasi';
import Panduan from './pages/Panduan';
import Tentang from './pages/Tentang';
import NotFound from './pages/NotFound';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            <Route path="/" element={<Landing />} />


            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/sistem" element={<Sistem />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/feedback/list" element={<FeedbackList />} />
              <Route path="/dokumentasi" element={<Dokumentasi />} />
              <Route path="/panduan" element={<Panduan />} />
              <Route path="/tentang" element={<Tentang />} />
            </Route>


            <Route path="/admin/login" element={<AdminLogin />} />


            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>


            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}
