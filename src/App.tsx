import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppNav } from './components/AppNav';
import { ProvidersPage } from './pages/ProvidersPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-page">
        <AppNav />
        <Routes>
          <Route path="/" element={<ProvidersPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
